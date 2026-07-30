import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name")?.trim();
  if (!name || name.length < 2) {
    return NextResponse.json({ requests: [], records: [] });
  }

  const year = new Date().getFullYear();
  const yearStart = new Date(`${year}-01-01`);
  const yearEnd = new Date(`${year}-12-31T23:59:59`);

  const [requests, records] = await Promise.all([
    prisma.trainingRequest.findMany({
      where: { employeeName: { contains: name, mode: "insensitive" } },
      orderBy: { requestedAt: "desc" },
      take: 50,
    }),
    prisma.trainingRecord.findMany({
      where: {
        employeeName: { contains: name, mode: "insensitive" },
        trainingStart: { gte: yearStart, lte: yearEnd },
      },
      orderBy: { trainingStart: "desc" },
      take: 50,
    }),
  ]);

  return NextResponse.json({ requests, records, year });
}
