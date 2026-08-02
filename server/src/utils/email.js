import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// TODO: build out these three — this is the automation feature you wanted
// to practice. Each should include the /manage/:token link.
//
// export async function sendConfirmationEmail(booking) { ... }
// export async function sendReminderEmail(booking) { ... }   // triggered by a scheduled job, not on request
// export async function sendCancellationEmail(booking) { ... }

export async function sendEmail({ to, subject, html }) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}
