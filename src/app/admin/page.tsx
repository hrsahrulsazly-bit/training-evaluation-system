import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RecordsTable from "./records-table";

export default async function AdminDashboard() {
  const [pendingCount, dueCount, recordCount] = await Promise.all([
    prisma.trainingRequest.count({ where: { status: "PENDING" } }),
    prisma.trainingRecord.count({
      where: { superiorEvaluated: false, reminderDueAt: { lte: new Date() } },
    }),
    prisma.trainingRecord.count(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold">🛠️ Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="TRF Menunggu Kelulusan" value={pendingCount} />
        <Stat label="Perlu Dinilai Superior" value={dueCount} />
        <Stat label="Jumlah Rekod Latihan" value={recordCount} />
        <Link
          href="/admin/bulk-add"
          className="card flex items-center justify-center text-center font-medium text-blue-700 hover:bg-blue-50"
        >
          + Tambah Latihan (Bulk)
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/superior" className="btn-primary">
          Lulus Permohonan TRF
        </Link>
        <Link
          href="/admin/lookups"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
        >
          Urus Senarai (Cawangan/Kursus/Trainer/Superior)
        </Link>
        <Link
          href="/admin/export"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
        >
          Eksport Audit (PDF/Excel)
        </Link>
      </div>

      <section className="card">
        <h2 className="mb-3 font-semibold">Rekod Latihan &amp; Pautan Penilaian</h2>
        <RecordsTable />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center">
      <div className="text-3xl font-bold text-blue-700">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}
