import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [branches, courses, trainers, superiors, users] = await Promise.all([
    prisma.branch.findMany({ orderBy: { name: "asc" } }),
    prisma.course.findMany({ orderBy: { title: "asc" } }),
    prisma.trainer.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: "SUPERIOR" },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: { in: ["SUPERIOR", "ADMIN"] } },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
  ]);

  return NextResponse.json({ branches, courses, trainers, superiors, users });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const type = body.type as "branch" | "course" | "trainer";
  const value = (body.value as string)?.trim();
  if (!value) return NextResponse.json({ error: "Value required" }, { status: 400 });

  if (type === "branch") {
    await prisma.branch.upsert({ where: { name: value }, update: {}, create: { name: value } });
  } else if (type === "course") {
    await prisma.course.upsert({ where: { title: value }, update: {}, create: { title: value } });
  } else if (type === "trainer") {
    await prisma.trainer.upsert({ where: { name: value }, update: {}, create: { name: value } });
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const type = body.type as "branch" | "course" | "trainer";
  const id = body.id as string;

  if (type === "branch") await prisma.branch.delete({ where: { id } });
  else if (type === "course") await prisma.course.delete({ where: { id } });
  else if (type === "trainer") await prisma.trainer.delete({ where: { id } });
  else return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  return NextResponse.json({ ok: true });
}
