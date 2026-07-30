"use client";

const labels: Record<number, string> = {
  1: "Irrelevant",
  2: "Somewhat Irrelevant",
  3: "Relevant",
  4: "Important",
  5: "Very Important",
};

export default function RatingScale({
  name,
  question,
  value,
  onChange,
}: {
  name: string;
  question: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="mb-2 text-sm font-medium">{question}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            title={labels[n]}
            onClick={() => onChange(n)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition ${
              value === n
                ? "border-blue-700 bg-blue-700 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-blue-400"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={value || ""} />
    </div>
  );
}
