import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { bulkTrainingSchema } from "@/lib/validation";
import { daysBetween } from "@/lib/dates";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const record = await prisma.trainingRecord.findUnique({ where: { id } });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ record });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = bulkTrainingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const trainingStart = new Date(data.trainingStart);
  const trainingEnd = new Date(data.trainingEnd);

  const existing = await prisma.trainingRecord.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.trainingRecord.update({
    where: { id },
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
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await prisma.trainingRecord.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
