import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { staffRatingSchema } from "@/lib/validation";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const record = await prisma.trainingRecord.findUnique({
    where: { ratingToken: token },
  });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    employeeName: record.employeeName,
    courseTitle: record.courseTitle,
    trainerName: record.trainerName,
    trainingStart: record.trainingStart,
    trainingEnd: record.trainingEnd,
    alreadySubmitted: !!record.staffRatingSubmittedAt,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const record = await prisma.trainingRecord.findUnique({
    where: { ratingToken: token },
  });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (record.staffRatingSubmittedAt) {
    return NextResponse.json({ error: "Already submitted" }, { status: 409 });
  }

  const body = await req.json();
  const parsed = staffRatingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  await prisma.trainingRecord.update({
    where: { ratingToken: token },
    data: {
      ...data,
      staffRatingSubmittedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
