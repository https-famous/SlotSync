import { prisma } from "../config/db.js";

// GET /api/bookings/slots?serviceId=&date=
// This is the trickiest piece in the whole app — see plan doc section B.
export async function getAvailableSlots(req, res, next) {
  try {
    // TODO:
    // 1. Load the service -> business -> AvailabilityRule for that day of week
    // 2. Subtract any AvailabilityException for that date
    // 3. Generate candidate slots at service.durationMin intervals
    // 4. Subtract existing Bookings (status in [pending, confirmed]) for that
    //    business+date so already-taken slots don't show as open
    // 5. Return slots as UTC ISO strings — client converts to local display
    res.status(501).json({ error: "Not implemented yet" });
  } catch (err) {
    next(err);
  }
}

// POST /api/bookings
// Concurrency safety comes from the Prisma @@unique([businessId, serviceId, startAt])
// constraint — just attempt the create and let Prisma's P2002 error (caught by
// errorHandler.js) tell the client "someone else just took that slot."
export async function createBooking(req, res, next) {
  try {
    // TODO:
    // 1. Create booking with status "pending"
    // 2. Create a Stripe PaymentIntent for service.depositCents
    // 3. Return the client secret so the frontend can confirm payment
    // Booking stays "pending" until the webhook confirms payment succeeded.
    res.status(501).json({ error: "Not implemented yet" });
  } catch (err) {
    next(err);
  }
}

// POST /api/bookings/webhook — Stripe calls this directly (raw body, see index.js)
export async function stripeWebhook(req, res, next) {
  try {
    // TODO:
    // 1. Verify signature with STRIPE_WEBHOOK_SECRET
    // 2. On payment_intent.succeeded -> set booking status "confirmed",
    //    then trigger confirmation email (see utils/email.js)
    // 3. On payment_intent.payment_failed -> release the slot (delete or
    //    mark cancelled so the unique constraint frees up)
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
