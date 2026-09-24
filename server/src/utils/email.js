import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export async function sendConfirmationEmail(booking, service, business) {
  const manageUrl = `${CLIENT_URL}/manage/${booking.manageToken}`;
  const when = new Date(booking.startAt).toLocaleString();

  return resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: booking.clientEmail, // see note below re: where this comes from
    subject: `Booking confirmed — ${service.name} at ${business.name}`,
    html: `
      <h2>You're booked!</h2>
      <p><strong>${service.name}</strong> at <strong>${business.name}</strong></p>
      <p>${when}</p>
      <p>Deposit paid: $${(booking.depositAmountCents / 100).toFixed(2)}</p>
      <p><a href="${manageUrl}">Manage or cancel this booking</a></p>
    `,
  });
}

export async function sendCancellationEmail(booking, service, business) {
  const when = new Date(booking.startAt).toLocaleString();

  return resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: booking.clientEmail,
    subject: `Booking cancelled — ${service.name} at ${business.name}`,
    html: `
      <h2>Your booking has been cancelled</h2>
      <p><strong>${service.name}</strong> at <strong>${business.name}</strong></p>
      <p>${when}</p>
      <p>If this wasn't you, or you'd like to rebook, visit ${business.name} on SlotSync.</p>
    `,
  });
}

export async function sendReminderEmail(booking, service, business) {
  const when = new Date(booking.startAt).toLocaleString();
  const manageUrl = `${CLIENT_URL}/manage/${booking.manageToken}`;

  return resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: booking.clientEmail,
    subject: `Reminder: ${service.name} tomorrow at ${business.name}`,
    html: `
      <h2>See you soon!</h2>
      <p>Just a reminder — you have <strong>${service.name}</strong> at
      <strong>${business.name}</strong> coming up.</p>
      <p>${when}</p>
      <p><a href="${manageUrl}">Manage or cancel this booking</a></p>
    `,
  });
}