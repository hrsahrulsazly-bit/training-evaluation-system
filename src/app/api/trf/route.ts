import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trfSchema } from "@/lib/validation";

export async function GET() {
  const superiors = await prisma.user.findMany({
    where: { role: { in: ["SUPERIOR", "ADMIN"] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  const branches = await prisma.branch.findMany({ orderBy: { name: "asc" } });
  const courses = await prisma.course.findMany({ orderBy: { title: "asc" } });
  return NextResponse.json({ superiors, branches, courses });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = trfSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const request = await prisma.trainingRequest.create({
    data: {
      employeeName: data.employeeName,
      position: data.position,
      branch: data.branch,
      hodId: data.hodId,
      courseTitle: data.courseTitle,
      trainerName: data.trainerName || null,
      proposedStart: new Date(data.proposedStart),
      proposedEnd: new Date(data.proposedEnd),
      justification: data.justification,
    },
  });

  return NextResponse.json({ id: request.id }, { status: 201 });
}
