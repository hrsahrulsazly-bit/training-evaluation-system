"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";

type Options = {
  superiors: { id: string; name: string }[];
  branches: { id: string; name: string }[];
  courses: { id: string; title: string }[];
  trainers: { id: string; name: string }[];
};

type Form = {
  employeeName: string;
  position: string;
  branch: string;
  hodId: string;
  courseTitle: string;
  trainerName: string;
  trainingStart: string;
  trainingEnd: string;
};

const toDateInput = (d: string) => d.slice(0, 10);

export default function EditRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const router = useRouter();
  const [options, setOptions] = useState<Options | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/lookups").then((r) => r.json()),
      fetch(`/api/admin/records/${id}`).then((r) => (r.ok ? r.json() : null)),
    ]).then(([opts, recBody]) => {
      setOptions(opts);
      if (!recBody) {
        setNotFound(true);
        return;
      }
      const r = recBody.record;
      setForm({
        employeeName: r.employeeName,
        position: r.position,
        branch: r.branch,
        hodId: r.hodId,
        courseTitle: r.courseTitle,
        trainerName: r.trainerName,
        trainingStart: toDateInput(r.trainingStart),
        trainingEnd: toDateInput(r.trainingEnd),
      });
    });
  }, [id]);

  function update<K extends keyof Form>(key: K, value: string) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSubmitting(true);
    setMessage(null);
    const res = await fetch(`/api/admin/records/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (!res.ok) {
      setMessage("Gagal mengemaskini rekod. Sila semak semua medan.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  if (notFound) {
    return <div className="mx-auto max-w-2xl card text-center text-slate-500">Rekod tidak dijumpai.</div>;
  }

  if (!options || !form) return <p className="text-center text-slate-400">Memuatkan...</p>;

  return (
    <div className="mx-auto max-w-2xl card">
      <h1 className="mb-1 text-lg font-semibold">✏️ Edit Rekod Latihan</h1>
      <p className="mb-6 text-sm text-slate-500">
        Kemaskini butiran latihan ini. Jika latihan tidak jadi, guna butang Padam
        di jadual rekod sebaliknya.
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
              {options.branches.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Superior / HOD">
            <select required value={form.hodId} onChange={(e) => update("hodId", e.target.value)} className="input">
              <option value="">-- Pilih --</option>
              {options.superiors.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Tajuk Kursus">
            <input required list="course-list" value={form.courseTitle} onChange={(e) => update("courseTitle", e.target.value)} className="input" />
            <datalist id="course-list">
              {options.courses.map((c) => <option key={c.id} value={c.title} />)}
            </datalist>
          </Field>
          <Field label="Nama Trainer">
            <input required list="trainer-list" value={form.trainerName} onChange={(e) => update("trainerName", e.target.value)} className="input" />
            <datalist id="trainer-list">
              {options.trainers.map((t) => <option key={t.id} value={t.name} />)}
            </datalist>
          </Field>
          <Field label="Tarikh Mula">
            <input type="date" required value={form.trainingStart} onChange={(e) => update("trainingStart", e.target.value)} className="input" />
          </Field>
          <Field label="Tarikh Akhir">
            <input type="date" required value={form.trainingEnd} onChange={(e) => update("trainingEnd", e.target.value)} className="input" />
          </Field>
        </div>
        {message && <p className="text-sm text-red-600">{message}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Batal
          </button>
        </div>
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
