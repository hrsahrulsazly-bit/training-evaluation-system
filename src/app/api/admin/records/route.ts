import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const branch = searchParams.get("branch")?.trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const records = await prisma.trainingRecord.findMany({
    where: {
      ...(q ? { employeeName: { contains: q, mode: "insensitive" as const } } : {}),
      ...(branch ? { branch } : {}),
      ...(from || to
        ? {
            trainingStart: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: { hod: { select: { name: true } } },
    orderBy: { trainingStart: "desc" },
    take: 200,
  });

  return NextResponse.json({ records });
}
