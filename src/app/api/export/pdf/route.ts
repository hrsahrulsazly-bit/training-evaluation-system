import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { TrainingRecordPdf } from "@/lib/pdf-document";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const record = await prisma.trainingRecord.findUnique({
    where: { id },
    include: { hod: { select: { name: true } } },
  });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = await renderToBuffer(TrainingRecordPdf({ record }));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="training-record-${record.id}.pdf"`,
    },
  });
}
