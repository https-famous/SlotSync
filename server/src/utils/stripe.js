import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// TODO: helper to create a PaymentIntent for a booking's deposit, e.g.
// export async function createDepositIntent(booking) {
//   return stripe.paymentIntents.create({
//     amount: booking.depositAmountCents,
//     currency: "usd",
//     metadata: { bookingId: booking.id },
//   });
// }
