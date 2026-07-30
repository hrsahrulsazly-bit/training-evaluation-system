import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addDays, daysBetween } from "@/lib/dates";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "SUPERIOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const status = body.status as "APPROVED" | "REJECTED";
  const rejectionReason = body.rejectionReason as string | undefined;

  if (status !== "APPROVED" && status !== "REJECTED") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const trf = await prisma.trainingRequest.findUnique({ where: { id } });
  if (!trf) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (trf.status !== "PENDING") {
    return NextResponse.json({ error: "Already decided" }, { status: 409 });
  }
  if (session.user.role === "SUPERIOR" && trf.hodId !== session.user.id) {
    return NextResponse.json({ error: "Not your request" }, { status: 403 });
  }

  const updated = await prisma.trainingRequest.update({
    where: { id },
    data: {
      status,
      rejectionReason: status === "REJECTED" ? rejectionReason ?? null : null,
      decidedAt: new Date(),
      decidedById: session.user.id,
    },
  });

  if (status === "APPROVED") {
    const trainingDays = daysBetween(trf.proposedStart, trf.proposedEnd);
    await prisma.trainingRecord.create({
      data: {
        requestId: trf.id,
        employeeName: trf.employeeName,
        position: trf.position,
        branch: trf.branch,
        hodId: trf.hodId,
        courseTitle: trf.courseTitle,
        trainerName: trf.trainerName ?? "",
        trainingStart: trf.proposedStart,
        trainingEnd: trf.proposedEnd,
        trainingDays,
        reminderDueAt: addDays(trf.proposedEnd, 90),
      },
    });
  }

  return NextResponse.json({ ok: true, id: updated.id });
}
