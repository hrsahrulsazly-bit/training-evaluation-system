import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { bulkTrainingSchema } from "@/lib/validation";
import { addDays, daysBetween } from "@/lib/dates";

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = bulkTrainingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const trainingStart = new Date(data.trainingStart);
  const trainingEnd = new Date(data.trainingEnd);

  const record = await prisma.trainingRecord.create({
    data: {
      employeeName: data.employeeName,
      position: data.position,
      branch: data.branch,
      hodId: data.hodId,
      courseTitle: data.courseTitle,
      trainerName: data.trainerName,
      trainingStart,
      trainingEnd,
      trainingDays: daysBetween(trainingStart, trainingEnd),
      reminderDueAt: addDays(trainingEnd, 90),
    },
  });

  return NextResponse.json({ id: record.id, ratingToken: record.ratingToken }, { status: 201 });
}
