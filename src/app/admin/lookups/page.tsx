"use client";

import { useEffect, useState } from "react";

type Item = { id: string; name?: string; title?: string; email?: string };
type Data = {
  branches: Item[];
  courses: Item[];
  trainers: Item[];
  superiors: Item[];
};

export default function LookupsPage() {
  const [data, setData] = useState<Data | null>(null);
  const [newBranch, setNewBranch] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newTrainer, setNewTrainer] = useState("");
  const [newSuperior, setNewSuperior] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/lookups");
    setData(await res.json());
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/lookups")
      .then((r) => r.json())
      .then((body) => {
        if (!ignore) setData(body);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function addLookup(type: "branch" | "course" | "trainer", value: string, reset: () => void) {
    if (!value.trim()) return;
    await fetch("/api/admin/lookups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, value }),
    });
    reset();
    load();
  }

  async function removeLookup(type: "branch" | "course" | "trainer", id: string) {
    await fetch("/api/admin/lookups", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    });
    load();
  }

  async function addSuperior() {
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSuperior),
    });
    if (!res.ok) {
      const body = await res.json();
      setError(body.error?.fieldErrors?.password?.[0] ?? body.error ?? "Gagal");
      return;
    }
    setNewSuperior({ name: "", email: "", password: "" });
    load();
  }

  async function removeSuperior(id: string) {
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  if (!data) return <p className="text-slate-400">Memuatkan...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">🗂️ Urus Senarai</h1>

      <LookupCard
        title="Cawangan / Jabatan"
        items={data.branches.map((b) => ({ id: b.id, label: b.name! }))}
        value={newBranch}
        onChange={setNewBranch}
        onAdd={() => addLookup("branch", newBranch, () => setNewBranch(""))}
        onRemove={(id) => removeLookup("branch", id)}
      />
      <LookupCard
        title="Kursus"
        items={data.courses.map((c) => ({ id: c.id, label: c.title! }))}
        value={newCourse}
        onChange={setNewCourse}
        onAdd={() => addLookup("course", newCourse, () => setNewCourse(""))}
        onRemove={(id) => removeLookup("course", id)}
      />
      <LookupCard
        title="Trainer"
        items={data.trainers.map((t) => ({ id: t.id, label: t.name! }))}
        value={newTrainer}
        onChange={setNewTrainer}
        onAdd={() => addLookup("trainer", newTrainer, () => setNewTrainer(""))}
        onRemove={(id) => removeLookup("trainer", id)}
      />

      <section className="card">
        <h2 className="mb-3 font-semibold">Akaun Superior</h2>
        <div className="mb-4 grid gap-2 sm:grid-cols-4">
          <input placeholder="Nama" value={newSuperior.name} onChange={(e) => setNewSuperior((s) => ({ ...s, name: e.target.value }))} className="input" />
          <input placeholder="Email" value={newSuperior.email} onChange={(e) => setNewSuperior((s) => ({ ...s, email: e.target.value }))} className="input" />
          <input placeholder="Kata Laluan" type="password" value={newSuperior.password} onChange={(e) => setNewSuperior((s) => ({ ...s, password: e.target.value }))} className="input" />
          <button onClick={addSuperior} className="btn-primary">Tambah Superior</button>
        </div>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <ul className="divide-y divide-slate-100 text-sm">
          {data.superiors.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-2">
              <span>{s.name} <span className="text-slate-400">({s.email})</span></span>
              <button onClick={() => removeSuperior(s.id)} className="text-xs text-red-600 hover:underline">Padam</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function LookupCard({
  title,
  items,
  value,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  items: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="card">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <div className="mb-3 flex gap-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} className="input" placeholder={`Tambah ${title.toLowerCase()} baharu`} />
        <button onClick={onAdd} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">Tambah</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <span key={i.id} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs">
            {i.label}
            <button onClick={() => onRemove(i.id)} className="text-slate-400 hover:text-red-600">✕</button>
          </span>
        ))}
      </div>
    </section>
  );
}
