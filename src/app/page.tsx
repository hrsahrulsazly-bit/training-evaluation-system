import Link from "next/link";

const cards = [
  {
    href: "/trf",
    title: "Mohon Latihan (TRF)",
    desc: "Isi Training Request Form untuk memohon latihan. Permohonan akan dihantar kepada superior anda untuk kelulusan.",
    emoji: "📝",
  },
  {
    href: "/search",
    title: "Semak Rekod Latihan",
    desc: "Cari rekod latihan anda tahun ini — permohonan, status, dan penilaian.",
    emoji: "🔍",
  },
  {
    href: "/login",
    title: "Penilaian Superior / Admin",
    desc: "Log masuk untuk meluluskan permohonan, menilai keberkesanan latihan, atau mengurus sistem.",
    emoji: "🔐",
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Training Evaluation System</h1>
        <p className="text-slate-500">
          Permohonan latihan, penilaian latihan, dan penilaian keberkesanan
          latihan — dalam satu sistem.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-300"
          >
            <div className="text-3xl mb-2">{c.emoji}</div>
            <div className="font-semibold mb-1">{c.title}</div>
            <div className="text-sm text-slate-500">{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
