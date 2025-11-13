import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!process.env.SMTP_URL) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport(process.env.SMTP_URL);
  }
  return transporter;
}

export async function sendEmail(opts: { to: string; subject: string; text: string }) {
  const t = getTransporter();
  if (!t) return { skipped: true };
  const from = process.env.MAIL_FROM || "greensiliconvalley27@gmail.com";
  await t.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text
  });
  return { ok: true };
}


