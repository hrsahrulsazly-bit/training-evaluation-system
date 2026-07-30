import nodemailer from "nodemailer";

function getTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error(
      "GMAIL_USER / GMAIL_APP_PASSWORD are not set. Add a Gmail App Password to send email."
    );
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendMail(to: string, subject: string, html: string) {
  const transport = getTransport();
  await transport.sendMail({
    from: `"Training Evaluation System" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

export function superiorReminderEmail(params: {
  superiorName: string;
  employeeName: string;
  courseTitle: string;
  loginUrl: string;
}) {
  const { superiorName, employeeName, courseTitle, loginUrl } = params;
  return `
    <p>Salam ${superiorName},</p>
    <p>Sudah 3 bulan sejak <strong>${employeeName}</strong> menghadiri latihan
    <strong>${courseTitle}</strong>. Sila log masuk untuk menilai keberkesanan
    latihan tersebut terhadap prestasi kerja mereka.</p>
    <p><a href="${loginUrl}">Log Masuk ke Training Evaluation System</a></p>
  `;
}

export function trfDecisionEmailSubject(status: "APPROVED" | "REJECTED") {
  return status === "APPROVED"
    ? "Permohonan Latihan Anda Diluluskan"
    : "Permohonan Latihan Anda Ditolak";
}
