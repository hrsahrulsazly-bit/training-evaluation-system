"use client";

import { useEffect, useState } from "react";

type Options = {
  superiors: { id: string; name: string }[];
  branches: { id: string; name: string }[];
  courses: { id: string; title: string }[];
};

const emptyForm = {
  employeeName: "",
  position: "",
  branch: "",
  hodId: "",
  courseTitle: "",
  trainerName: "",
  proposedStart: "",
  proposedEnd: "",
  justification: "",
};

export default function TrfPage() {
  const [options, setOptions] = useState<Options | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/trf")
      .then((r) => r.json())
      .then(setOptions);
  }, []);

  function update<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    const res = await fetch("/api/trf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json();
      setErrors(body.error?.fieldErrors ?? {});
      return;
    }
    setSuccess(true);
    setForm(emptyForm);
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <h1 className="text-lg font-semibold text-green-800">
          Permohonan Berjaya Dihantar
        </h1>
        <p className="mt-2 text-sm text-green-700">
          Permohonan latihan anda telah dihantar untuk kelulusan superior.
          Anda boleh menyemak status di halaman &quot;Semak Rekod&quot;.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Mohon Latihan Lain
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-lg font-semibold">📝 Training Request Form (TRF)</h1>
      <p className="mb-6 text-sm text-slate-500">
        Isi maklumat di bawah untuk memohon latihan. Permohonan akan dihantar
        kepada superior yang dipilih untuk kelulusan.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Pekerja" error={errors.employeeName}>
            <input
              required
              value={form.employeeName}
              onChange={(e) => update("employeeName", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Jawatan" error={errors.position}>
            <input
              required
              value={form.position}
              onChange={(e) => update("position", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Cawangan / Jabatan" error={errors.branch}>
            <select
              required
              value={form.branch}
              onChange={(e) => update("branch", e.target.value)}
              className="input"
            >
              <option value="">-- Pilih Cawangan --</option>
              {options?.branches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Superior / HOD" error={errors.hodId}>
            <select
              required
              value={form.hodId}
              onChange={(e) => update("hodId", e.target.value)}
              className="input"
            >
              <option value="">-- Pilih Superior --</option>
              {options?.superiors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tajuk Kursus" error={errors.courseTitle}>
            <input
              required
              list="course-list"
              value={form.courseTitle}
              onChange={(e) => update("courseTitle", e.target.value)}
              className="input"
            />
            <datalist id="course-list">
              {options?.courses.map((c) => (
                <option key={c.id} value={c.title} />
              ))}
            </datalist>
          </Field>
          <Field label="Nama Trainer (jika diketahui)">
            <input
              value={form.trainerName}
              onChange={(e) => update("trainerName", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Tarikh Mula Dicadang" error={errors.proposedStart}>
            <input
              type="date"
              required
              value={form.proposedStart}
              onChange={(e) => update("proposedStart", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Tarikh Akhir Dicadang" error={errors.proposedEnd}>
            <input
              type="date"
              required
              value={form.proposedEnd}
              onChange={(e) => update("proposedEnd", e.target.value)}
              className="input"
            />
          </Field>
        </div>
        <Field label="Justifikasi / Sebab Memohon" error={errors.justification}>
          <textarea
            required
            rows={4}
            value={form.justification}
            onChange={(e) => update("justification", e.target.value)}
            className="input"
          />
        </Field>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {submitting ? "Menghantar..." : "Hantar Permohonan"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error?.[0] && <span className="mt-1 block text-xs text-red-600">{error[0]}</span>}
    </label>
  );
}
