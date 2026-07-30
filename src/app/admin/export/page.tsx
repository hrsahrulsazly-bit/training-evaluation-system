"use client";

import { useState } from "react";

export default function ExportPage() {
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function buildQuery() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (branch) params.set("branch", branch);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return params.toString();
  }

  return (
    <div className="mx-auto max-w-2xl card">
      <h1 className="mb-1 text-lg font-semibold">📤 Eksport Audit</h1>
      <p className="mb-6 text-sm text-slate-500">
        Tapis rekod latihan dan muat turun dalam format Excel untuk tujuan
        audit. Untuk borang individu, gunakan butang &quot;PDF&quot; di jadual
        rekod dalam Admin Dashboard.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Nama Pekerja (opsyenal)</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Cawangan (opsyenal)</span>
          <input value={branch} onChange={(e) => setBranch(e.target.value)} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Dari Tarikh</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Hingga Tarikh</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
        </label>
      </div>
      <a
        href={`/api/export/excel?${buildQuery()}`}
        className="btn-primary mt-6 block text-center"
      >
        ⬇️ Muat Turun Excel
      </a>
    </div>
  );
}
