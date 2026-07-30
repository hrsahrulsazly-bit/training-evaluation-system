import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/dates";
import SuperiorRatingForm from "./form";

export default async function SuperiorRatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await prisma.trainingRecord.findUnique({ where: { id } });
  if (!record) notFound();

  if (record.superiorEvaluated) {
    return (
      <div className="mx-auto max-w-xl card text-center">
        <p className="text-slate-600">Latihan ini sudah dinilai.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="card">
        <h1 className="text-lg font-semibold">
          Penilaian Keberkesanan Latihan
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {record.employeeName} — {record.courseTitle}
          <br />
          Tarikh latihan: {formatDate(record.trainingStart)} –{" "}
          {formatDate(record.trainingEnd)}
        </p>
      </div>
      <div className="card">
        <SuperiorRatingForm recordId={record.id} />
      </div>
    </div>
  );
}
