import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/dates";
import ApproveRejectButtons from "./approve-reject-buttons";
import Link from "next/link";

export default async function SuperiorDashboard() {
  const session = await auth();
  const userId = session!.user.id;
  const isAdmin = session!.user.role === "ADMIN";

  const pendingRequests = await prisma.trainingRequest.findMany({
    where: isAdmin ? { status: "PENDING" } : { status: "PENDING", hodId: userId },
    orderBy: { requestedAt: "asc" },
  });

  const dueForRating = await prisma.trainingRecord.findMany({
    where: {
      superiorEvaluated: false,
      reminderDueAt: { lte: new Date() },
      ...(isAdmin ? {} : { hodId: userId }),
    },
    orderBy: { reminderDueAt: "asc" },
  });

  const upcoming = await prisma.trainingRecord.findMany({
    where: {
      superiorEvaluated: false,
      reminderDueAt: { gt: new Date() },
      ...(isAdmin ? {} : { hodId: userId }),
    },
    orderBy: { reminderDueAt: "asc" },
    take: 10,
  });

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold">🧑‍💼 Penilaian Superior</h1>

      <section className="card">
        <h2 className="mb-3 font-semibold">
          Permohonan Menunggu Kelulusan ({pendingRequests.length})
        </h2>
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-slate-500">Tiada permohonan menunggu.</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-slate-200 p-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {r.employeeName} — {r.position}
                    </p>
                    <p className="text-slate-500">
                      {r.courseTitle} · {formatDate(r.proposedStart)} –{" "}
                      {formatDate(r.proposedEnd)} · {r.branch}
                    </p>
                    <p className="mt-1 text-slate-600">{r.justification}</p>
                  </div>
                  <ApproveRejectButtons id={r.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">
          Latihan Perlu Dinilai Sekarang (3 bulan telah berlalu) (
          {dueForRating.length})
        </h2>
        {dueForRating.length === 0 ? (
          <p className="text-sm text-slate-500">Tiada latihan perlu dinilai buat masa ini.</p>
        ) : (
          <div className="space-y-2">
            {dueForRating.map((rec) => (
              <div
                key={rec.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {rec.employeeName} — {rec.courseTitle}
                  </p>
                  <p className="text-slate-500">
                    Latihan tamat {formatDate(rec.trainingEnd)}
                  </p>
                </div>
                <Link
                  href={`/superior/rate/${rec.id}`}
                  className="rounded-md bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700"
                >
                  Nilai Sekarang
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">Akan Datang ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500">Tiada.</p>
        ) : (
          <ul className="space-y-1 text-sm text-slate-600">
            {upcoming.map((rec) => (
              <li key={rec.id}>
                {rec.employeeName} — {rec.courseTitle} (penilaian dibuka{" "}
                {formatDate(rec.reminderDueAt)})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
