"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Options = {
  superiors: { id: string; name: string }[];
  branches: { id: string; name: string }[];
  courses: { id: string; title: string }[];
  trainers: { id: string; name: string }[];
};

const emptyForm = {
  employeeName: "",
  position: "",
  branch: "",
  hodId: "",
  courseTitle: "",
  trainerName: "",
  trainingStart: "",
  trainingEnd: "",
};

export default function BulkAddPage() {
  const router = useRouter();
  const [options, setOptions] = useState<Options | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/lookups")
      .then((r) => r.json())
      .then(setOptions);
  }, []);

  function update<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const res = await fetch("/api/admin/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (!res.ok) {
      setMessage("Gagal menambah rekod. Sila semak semua medan.");
      return;
    }
    setMessage("Rekod latihan berjaya ditambah.");
    setForm(emptyForm);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl card">
      <h1 className="mb-1 text-lg font-semibold">+ Tambah Latihan (Bulk)</h1>
      <p className="mb-6 text-sm text-slate-500">
        Untuk latihan yang telah diluluskan tanpa melalui TRF. Rekod ini terus
        sedia untuk pautan penilaian staf dan penilaian 3-bulan superior.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Pekerja">
            <input required value={form.employeeName} onChange={(e) => update("employeeName", e.target.value)} className="input" />
          </Field>
          <Field label="Jawatan">
            <input required value={form.position} onChange={(e) => update("position", e.target.value)} className="input" />
          </Field>
          <Field label="Cawangan">
            <select required value={form.branch} onChange={(e) => update("branch", e.target.value)} className="input">
              <option value="">-- Pilih --</option>
              {options?.branches.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Superior / HOD">
            <select required value={form.hodId} onChange={(e) => update("hodId", e.target.value)} className="input">
              <option value="">-- Pilih --</option>
              {options?.superiors.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Tajuk Kursus">
            <input required list="course-list" value={form.courseTitle} onChange={(e) => update("courseTitle", e.target.value)} className="input" />
            <datalist id="course-list">
              {options?.courses.map((c) => <option key={c.id} value={c.title} />)}
            </datalist>
          </Field>
          <Field label="Nama Trainer">
            <input required list="trainer-list" value={form.trainerName} onChange={(e) => update("trainerName", e.target.value)} className="input" />
            <datalist id="trainer-list">
              {options?.trainers.map((t) => <option key={t.id} value={t.name} />)}
            </datalist>
          </Field>
          <Field label="Tarikh Mula">
            <input type="date" required value={form.trainingStart} onChange={(e) => update("trainingStart", e.target.value)} className="input" />
          </Field>
          <Field label="Tarikh Akhir">
            <input type="date" required value={form.trainingEnd} onChange={(e) => update("trainingEnd", e.target.value)} className="input" />
          </Field>
        </div>
        {message && <p className="text-sm text-slate-600">{message}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Menyimpan..." : "Tambah Rekod"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
