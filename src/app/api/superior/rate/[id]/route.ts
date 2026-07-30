import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { superiorRatingSchema } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "SUPERIOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const record = await prisma.trainingRecord.findUnique({ where: { id } });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.user.role === "SUPERIOR" && record.hodId !== session.user.id) {
    return NextResponse.json({ error: "Not your record" }, { status: 403 });
  }
  if (record.superiorEvaluated) {
    return NextResponse.json({ error: "Already evaluated" }, { status: 409 });
  }

  const body = await req.json();
  const parsed = superiorRatingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  await prisma.trainingRecord.update({
    where: { id },
    data: {
      superiorEvaluated: true,
      supQ1: data.supQ1,
      supQ2: data.supQ2,
      supQ3: data.supQ3,
      supQ4: data.supQ4,
      supQ5: data.supQ5,
      supComment: data.supComment ?? null,
      supEvaluatedAt: new Date(),
      supEvaluatedById: session.user.id,
    },
  });

  return NextResponse.json({ ok: true });
}
