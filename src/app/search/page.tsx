"use client";

import { useState } from "react";
import { formatDate } from "@/lib/dates";

type Req = {
  id: string;
  employeeName: string;
  courseTitle: string;
  status: string;
  proposedStart: string;
  proposedEnd: string;
  rejectionReason: string | null;
};

type Rec = {
  id: string;
  employeeName: string;
  courseTitle: string;
  trainerName: string;
  trainingStart: string;
  trainingEnd: string;
  staffRatingSubmittedAt: string | null;
  superiorEvaluated: boolean;
};

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu Kelulusan",
  APPROVED: "Diluluskan",
  REJECTED: "Ditolak",
};

const statusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function SearchPage() {
  const [name, setName] = useState("");
  const [requests, setRequests] = useState<Req[]>([]);
  const [records, setRecords] = useState<Rec[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/search?name=${encodeURIComponent(name)}`);
    const body = await res.json();
    setRequests(body.requests);
    setRecords(body.records);
    setYear(body.year);
    setSearched(true);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card">
        <h1 className="mb-1 text-lg font-semibold">🔍 Semak Rekod Latihan</h1>
        <p className="mb-4 text-sm text-slate-500">
          Masukkan nama penuh anda untuk menyemak permohonan dan rekod
          latihan tahun ini.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama penuh"
            className="input"
          />
          <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
            {loading ? "Mencari..." : "Cari"}
          </button>
        </form>
      </div>

      {searched && (
        <>
          <section className="card">
            <h2 className="mb-3 font-semibold">Permohonan Latihan (TRF)</h2>
            {requests.length === 0 ? (
              <p className="text-sm text-slate-400">Tiada permohonan dijumpai.</p>
            ) : (
              <div className="space-y-2">
                {requests.map((r) => (
                  <div key={r.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{r.courseTitle}</p>
                        <p className="text-slate-500">
                          {formatDate(r.proposedStart)} – {formatDate(r.proposedEnd)}
                        </p>
                        {r.rejectionReason && (
                          <p className="mt-1 text-red-600">Sebab: {r.rejectionReason}</p>
                        )}
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs ${statusColor[r.status]}`}>
                        {statusLabel[r.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <h2 className="mb-3 font-semibold">Rekod Latihan {year} (menghadiri)</h2>
            {records.length === 0 ? (
              <p className="text-sm text-slate-400">Tiada rekod latihan tahun ini.</p>
            ) : (
              <div className="space-y-2">
                {records.map((r) => (
                  <div key={r.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                    <p className="font-medium">
                      {r.courseTitle} <span className="text-slate-400">({r.trainerName})</span>
                    </p>
                    <p className="text-slate-500">
                      {formatDate(r.trainingStart)} – {formatDate(r.trainingEnd)}
                    </p>
                    <p className="mt-1 flex gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          r.staffRatingSubmittedAt ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        Penilaian Staf {r.staffRatingSubmittedAt ? "✓" : "belum dibuat"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          r.superiorEvaluated ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        Penilaian Superior {r.superiorEvaluated ? "✓" : "belum dibuat"}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
