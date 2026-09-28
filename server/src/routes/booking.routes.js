import { Router } from "express";
import {
  getAvailableSlots,
  createBooking,
  stripeWebhook,
  getMyBookings,
  getBookingByToken,
  cancelBooking,
  rescheduleBooking,
  getBusinessBookings,
  updateBookingStatus,
} from "../controllers/booking.controller.js";
import { requireAuth, requireOwner } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/slots", getAvailableSlots);          // ?serviceId=&date= -> open slots
router.post("/", requireAuth, createBooking);      // concurrency-safe: relies on Prisma @@unique
router.post("/webhook", stripeWebhook);            // Stripe PaymentIntent events

router.get("/mine", requireAuth, getMyBookings);   // account dashboard path
router.get("/manage/:token", getBookingByToken);   // magic-link path (no auth)
router.get("/business", requireAuth, requireOwner, getBusinessBookings);

router.patch("/:id", requireAuth, requireOwner, updateBookingStatus);
router.post("/:id/cancel", cancelBooking);
router.post("/:id/reschedule", rescheduleBooking);

export default router;