import cron from "node-cron";
import { prisma } from "../config/db.js";
import { sendReminderEmail } from "../utils/email.js";

// Runs every hour, looks for confirmed bookings starting in roughly 24h
// that haven't had a reminder sent yet.
export function startReminderJob() {
  cron.schedule("0 * * * *", async () => {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const upcoming = await prisma.booking.findMany({
      where: {
        status: "confirmed",
        startAt: { gte: windowStart, lte: windowEnd },
        reminderSentAt: null,
      },
    });

    for (const booking of upcoming) {
      const [client, service, business] = await Promise.all([
        prisma.user.findUnique({ where: { id: booking.clientUserId } }),
        prisma.service.findUnique({ where: { id: booking.serviceId } }),
        prisma.business.findUnique({ where: { id: booking.businessId } }),
      ]);

      await sendReminderEmail({ ...booking, clientEmail: client.email }, service, business);

      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSentAt: new Date() },
      });
    }

    if (upcoming.length) {
      console.log(`Sent ${upcoming.length} reminder email(s)`);
    }
  });
}