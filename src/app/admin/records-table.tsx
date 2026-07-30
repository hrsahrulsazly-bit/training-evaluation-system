"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/dates";

type Record = {
  id: string;
  employeeName: string;
  courseTitle: string;
  branch: string;
  trainingStart: string;
  trainingEnd: string;
  ratingToken: string;
  staffRatingSubmittedAt: string | null;
  superiorEvaluated: boolean;
  hod: { name: string };
};

export default function RecordsTable() {
  const [records, setRecords] = useState<Record[]>([]);
  const [q, setQ] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function load(query: string) {
    const res = await fetch(`/api/admin/records${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    const body = await res.json();
    setRecords(body.records);
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/records")
      .then((r) => r.json())
      .then((body) => {
        if (!ignore) setRecords(body.records);
      });
    return () => {
      ignore = true;
    };
  }, []);

  function copyLink(rec: Record) {
    const url = `${window.location.origin}/rate/${rec.ratingToken}`;
    navigator.clipboard.writeText(url);
    setCopiedId(rec.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <input
          placeholder="Cari nama pekerja..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(q)}
          className="input max-w-xs"
        />
        <button
          onClick={() => load(q)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
        >
          Cari
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="py-2 pr-3">Pekerja</th>
              <th className="py-2 pr-3">Kursus</th>
              <th className="py-2 pr-3">Tarikh</th>
              <th className="py-2 pr-3">Superior</th>
              <th className="py-2 pr-3">Status Penilaian</th>
              <th className="py-2 pr-3">Pautan</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="py-2 pr-3">{r.employeeName}</td>
                <td className="py-2 pr-3">{r.courseTitle}</td>
                <td className="py-2 pr-3 whitespace-nowrap">
                  {formatDate(r.trainingStart)} – {formatDate(r.trainingEnd)}
                </td>
                <td className="py-2 pr-3">{r.hod.name}</td>
                <td className="py-2 pr-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      r.staffRatingSubmittedAt
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    Staf {r.staffRatingSubmittedAt ? "✓" : "belum"}
                  </span>{" "}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      r.superiorEvaluated
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    Superior {r.superiorEvaluated ? "✓" : "belum"}
                  </span>
                </td>
                <td className="py-2 pr-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyLink(r)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                    >
                      {copiedId === r.id ? "Disalin!" : "Salin Pautan"}
                    </button>
                    <a
                      href={`/api/export/pdf?id=${r.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                    >
                      PDF
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  Tiada rekod.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
