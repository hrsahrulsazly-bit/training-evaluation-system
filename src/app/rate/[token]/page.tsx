"use client";

import { useEffect, useState, use as usePromise } from "react";
import RatingScale from "@/components/rating-scale";
import { formatDate } from "@/lib/dates";

type RecordInfo = {
  employeeName: string;
  courseTitle: string;
  trainerName: string;
  trainingStart: string;
  trainingEnd: string;
  alreadySubmitted: boolean;
};

const scaleQuestions = [
  { key: "q5Importance", label: "Kepentingan latihan ini kepada tugas anda." },
  { key: "q6Materials", label: "Keberkesanan bahan yang disampaikan." },
  { key: "q7Presenter", label: "Keberkesanan penyampaian trainer." },
  { key: "q8Adequacy", label: "Kecukupan bahan yang disediakan." },
  { key: "q9Expectation", label: "Latihan ini memenuhi jangkaan saya." },
  { key: "q10Overall", label: "Penilaian keseluruhan sesi latihan ini." },
] as const;

export default function RatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = usePromise(params);
  const [info, setInfo] = useState<RecordInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q1Content, setQ1Content] = useState("");
  const [q2Related, setQ2Related] = useState<"Yes" | "No" | "">("");
  const [q2Suggestion, setQ2Suggestion] = useState("");
  const [q3Effective, setQ3Effective] = useState<"Yes" | "No" | "">("");
  const [q3Further, setQ3Further] = useState("");
  const [q4Comment, setQ4Comment] = useState("");
  const [scales, setScales] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch(`/api/rate/${token}`)
      .then(async (r) => {
        if (!r.ok) {
          setNotFound(true);
          return;
        }
        const data = await r.json();
        setInfo(data);
        if (data.alreadySubmitted) setSubmitted(true);
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!q2Related || !q3Effective || Object.keys(scales).length < scaleQuestions.length) {
      setError("Sila lengkapkan semua soalan.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/rate/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q1Content,
        q2Related,
        q2Suggestion,
        q3Effective,
        q3Further,
        q4Comment,
        ...scales,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError("Gagal menghantar. Sila cuba lagi.");
      return;
    }
    setSubmitted(true);
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-lg card text-center text-slate-500">
        Pautan tidak sah atau telah tamat tempoh.
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg card text-center">
        <div className="text-3xl mb-2">✅</div>
        <p className="font-medium text-green-700">Terima kasih! Penilaian anda telah direkodkan.</p>
      </div>
    );
  }

  if (!info) return <p className="text-center text-slate-400">Memuatkan...</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="card">
        <h1 className="text-lg font-semibold">Borang Penilaian Latihan</h1>
        <p className="mt-1 text-sm text-slate-500">
          {info.employeeName} — {info.courseTitle} ({info.trainerName})
          <br />
          {formatDate(info.trainingStart)} – {formatDate(info.trainingEnd)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card space-y-4">
          <h2 className="font-semibold text-blue-700">Part A: Learning Outcome</h2>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Q1: Apa yang anda pelajari dari kursus ini?
            </span>
            <textarea
              required
              rows={3}
              value={q1Content}
              onChange={(e) => setQ1Content(e.target.value)}
              className="input"
            />
          </label>

          <div>
            <span className="mb-1 block text-sm font-medium">
              Q2: Berkaitan dengan tugas semasa anda?
            </span>
            <div className="flex gap-4">
              {(["Yes", "No"] as const).map((v) => (
                <label key={v} className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="q2Related"
                    checked={q2Related === v}
                    onChange={() => setQ2Related(v)}
                  />
                  {v}
                </label>
              ))}
            </div>
            {q2Related === "No" && (
              <input
                placeholder="Cadangan tindakan"
                value={q2Suggestion}
                onChange={(e) => setQ2Suggestion(e.target.value)}
                className="input mt-2"
              />
            )}
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium">
              Q3: Keberkesanan Latihan?
            </span>
            <div className="flex gap-4">
              {(["Yes", "No"] as const).map((v) => (
                <label key={v} className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="q3Effective"
                    checked={q3Effective === v}
                    onChange={() => setQ3Effective(v)}
                  />
                  {v}
                </label>
              ))}
            </div>
            {q3Effective === "No" && (
              <input
                placeholder="Latihan lanjut diperlukan?"
                value={q3Further}
                onChange={(e) => setQ3Further(e.target.value)}
                className="input mt-2"
              />
            )}
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Q4: Ulasan</span>
            <textarea
              rows={2}
              value={q4Comment}
              onChange={(e) => setQ4Comment(e.target.value)}
              className="input"
            />
          </label>
        </div>

        <div className="card space-y-3">
          <h2 className="font-semibold text-green-700">Part B: Rating Scale</h2>
          {scaleQuestions.map((q, i) => (
            <RatingScale
              key={q.key}
              name={q.key}
              question={`Q${i + 5}: ${q.label}`}
              value={scales[q.key] ?? 0}
              onChange={(v) => setScales((s) => ({ ...s, [q.key]: v }))}
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Menghantar..." : "✅ Hantar Borang"}
        </button>
      </form>
    </div>
  );
}
