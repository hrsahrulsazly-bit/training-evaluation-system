import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail, superiorReminderEmail } from "@/lib/mailer";

// Called daily by Vercel Cron (see vercel.json). Finds training records
// where the 3-month follow-up window has opened, the superior hasn't
// rated it yet, and no reminder has been sent yet — then emails the
// responsible superior a login link.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await prisma.trainingRecord.findMany({
    where: {
      superiorEvaluated: false,
      reminderSentAt: null,
      reminderDueAt: { lte: new Date() },
    },
    include: { hod: true },
  });

  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  let sent = 0;
  const failures: string[] = [];

  for (const record of due) {
    try {
      await sendMail(
        record.hod.email,
        "Penilaian Keberkesanan Latihan Diperlukan",
        superiorReminderEmail({
          superiorName: record.hod.name,
          employeeName: record.employeeName,
          courseTitle: record.courseTitle,
          loginUrl: `${baseUrl}/login?callbackUrl=/superior/rate/${record.id}`,
        })
      );
      await prisma.trainingRecord.update({
        where: { id: record.id },
        data: { reminderSentAt: new Date() },
      });
      sent++;
    } catch {
      failures.push(record.id);
    }
  }

  return NextResponse.json({ checked: due.length, sent, failures });
}
