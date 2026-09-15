import { prisma } from "../config/db.js";
import { stripe } from "../utils/stripe.js";


// GET /api/bookings/slots?serviceId=&date=
// GET /api/bookings/slots?serviceId=&date=   (date format: "2026-01-21")
export async function getAvailableSlots(req, res, next) {
  try {
    const { serviceId, date } = req.query;
    if (!serviceId || !date) {
      return res.status(400).json({ error: "serviceId and date are required" });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ error: "Service not found" });

    const requestedDate = new Date(date + "T00:00:00.000Z");                            // this combines the date and the UTC timezone 
    const dayOfWeek = requestedDate.getUTCDay(); // 0=Sun ... 6=Sat

    // 1. Exceptions override the normal weekly rule for this specific date.
    const exception = await prisma.availabilityException.findFirst({
      where: { businessId: service.businessId, date: requestedDate },
    });

    if (exception?.isClosed) {
      return res.json([]); // closed all day — no slots to generate
    }

    let startTime, endTime;
    if (exception?.startTime && exception?.endTime) {
      startTime = exception.startTime;                         // if there is an expection then this is the expectiton start time
      endTime = exception.endTime;                             // if there is an expection then this is the expectiton end time
    } else {
      // 2. No exception — fall back to the normal weekly rule for this day.
      const rule = await prisma.availabilityRule.findFirst({
        where: { businessId: service.businessId, dayOfWeek },
      });
      if (!rule) return res.json([]); // no rule for this weekday = closed
      startTime = rule.startTime;
      endTime = rule.endTime;
    }

    // 3. Generate candidate slots, one every `durationMin` minutes.
    const [startHour, startMin] = startTime.split(":").map(Number);                       // this split time like 9:00 to  startHour=9, startMin=0
    const [endHour, endMin] = endTime.split(":").map(Number);

    const dayStart = new Date(requestedDate);                                              // this saves it to dayStart and uses the UTC so asany server that runs this code won't use it's timezone
    dayStart.setUTCHours(startHour, startMin, 0, 0);
    const dayEnd = new Date(requestedDate);
    dayEnd.setUTCHours(endHour, endMin, 0, 0);

    const candidates = [];
    let cursor = new Date(dayStart);
    while (cursor.getTime() + service.durationMin * 60000 <= dayEnd.getTime()) {                           // this start at the dayStart and continues by 6000ms till the dayEnd
      candidates.push(new Date(cursor));
      cursor = new Date(cursor.getTime() + service.durationMin * 60000);
    }

    // 4. Remove slots that are already booked (pending or confirmed).
    const dayEndExclusive = new Date(dayStart);
    dayEndExclusive.setUTCHours(23, 59, 59, 999);                 // this thend of the calendar day 23 hours 59 minutes 59 seconds

    const existingBookings = await prisma.booking.findMany({
      where: {
        businessId: service.businessId,
        startAt: { gte: dayStart, lte: dayEndExclusive },
        status: { in: ["pending", "confirmed"] },                              // THis gets all the slots thave been booked either pendin or confirmed
      },
      select: { startAt: true },                                                  
    });
    const takenTimes = new Set(existingBookings.map((b) => b.startAt.toISOString()));      // this looks through the exisitng bookings then converts to a string

    const slots = candidates
      .filter((c) => !takenTimes.has(c.toISOString()))                                         // this  checks for the available slots
      .map((c) => c.toISOString());                                                          //Final step: keep only the candidate slots whose ISO string isn't in the taken set

    res.json(slots);
  } catch (err) {
    next(err);
  }
}

// POST /api/bookings
export async function createBooking(req, res, next) {
  try {
    const { serviceId, startAt } = req.body;
    if (!serviceId || !startAt) {
      return res.status(400).json({ error: "serviceId and startAt are required" });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.active) {
      return res.status(404).json({ error: "Service not found" });
    }

    const startDate = new Date(startAt);
    const endDate = new Date(startDate.getTime() + service.durationMin * 60000);

    // Create the booking first. The @@unique constraint on
    // [businessId, serviceId, startAt] is what actually prevents double-booking —
    // if someone else grabbed this exact slot a moment ago, this throws P2002,
    // which errorHandler.js turns into "That slot was just booked."
    const booking = await prisma.booking.create({
      data: {
        businessId: service.businessId,
        serviceId: service.id,
        clientUserId: req.user.id,
        startAt: startDate,
        endAt: endDate,
        depositAmountCents: service.depositCents,
        status: "pending",
      },
    });

    // Now create the Stripe PaymentIntent for the deposit amount.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.depositAmountCents,
      currency: "usd", // TODO: make this configurable per business later
      payment_method_types: ["card"], // deposits are simple card payments — no redirect-based methods needed
      metadata: { bookingId: booking.id },
    });

    // Save the PaymentIntent id so the webhook can find this booking later. larger scale
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    res.status(201).json({
      booking: updated,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    next(err);
  }
}



// POST /api/bookings/webhook — Stripe calls this directly (raw body, see index.js)
export async function stripeWebhook(req, res, next) {
  let event;

  try {
    // Verify this request genuinely came from Stripe, not someone spoofing
    // a fake "payment succeeded" call to your server.
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      const booking = await prisma.booking.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
      });

      if (booking && booking.status === "pending") {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: "confirmed" },
        });
        // TODO: sendConfirmationEmail(booking) — wiring this up in the
        // email automation feature next.
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;

      const booking = await prisma.booking.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
      });

      if (booking && booking.status === "pending") {
        // Delete rather than mark cancelled — this frees the @@unique slot
        // immediately so someone else can book it. A cancelled booking with
        // real history is different from one that never got paid at all.
        await prisma.booking.delete({ where: { id: booking.id } });
      }
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/bookings/mine — account dashboard path
export async function getMyBookings(req, res, next) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { clientUserId: req.user.id },
      include: { service: true, business: true },
      orderBy: { startAt: "desc" },
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

// GET /api/bookings/manage/:token — magic-link path, no auth required
export async function getBookingByToken(req, res, next) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { manageToken: req.params.token },
      include: { service: true, business: true },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    next(err);
  }
}

// POST /api/bookings/:id/cancel — reachable via account OR manage token
export async function cancelBooking(req, res, next) {
  try {
    // TODO: verify the requester owns this booking — either req.user.id
    // matches clientUserId, OR the request came via a valid manageToken.
    // Then: set status "cancelled", cancelledAt = now, trigger refund if
    // already paid, and send cancellation email.
    res.status(501).json({ error: "Not implemented yet" });
  } catch (err) {
    next(err);
  }
}

// POST /api/bookings/:id/reschedule
export async function rescheduleBooking(req, res, next) {
  try {
    // TODO: don't mutate the old booking's startAt. Instead:
    // 1. Create a NEW booking with the new startAt, rescheduledFromId = old.id
    // 2. Mark the OLD booking status = "rescheduled"
    // This preserves history for analytics (reschedule rate).
    res.status(501).json({ error: "Not implemented yet" });
  } catch (err) {
    next(err);
  }
}
