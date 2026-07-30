"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RatingScale from "@/components/rating-scale";

const questions = [
  { key: "supQ1", label: "The employee is able to apply the acquired knowledge in their work" },
  { key: "supQ2", label: "Improvement in work performance" },
  { key: "supQ3", label: "Improvement in skills" },
  { key: "supQ4", label: "Improvement in productivity" },
  { key: "supQ5", label: "Overall evaluation" },
] as const;

export default function SuperiorRatingForm({ recordId }: { recordId: string }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.keys(values).length < questions.length) {
      setError("Sila lengkapkan semua penilaian.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/superior/rate/${recordId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, supComment: comment }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError("Gagal menghantar penilaian. Sila cuba lagi.");
      return;
    }
    router.push("/superior");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {questions.map((q) => (
        <RatingScale
          key={q.key}
          name={q.key}
          question={q.label}
          value={values[q.key] ?? 0}
          onChange={(v) => setValues((s) => ({ ...s, [q.key]: v }))}
        />
      ))}
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Ulasan Tambahan</span>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? "Menghantar..." : "Hantar Penilaian"}
      </button>
    </form>
  );
}
