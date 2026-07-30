import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6, "Kata laluan sekurang-kurangnya 6 aksara"),
});

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email sudah wujud" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "SUPERIOR" },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  await prisma.user.delete({ where: { id: body.id as string } });
  return NextResponse.json({ ok: true });
}
