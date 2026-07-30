"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApproveRejectButtons({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  async function decide(status: "APPROVED" | "REJECTED") {
    setLoading(status);
    const res = await fetch(`/api/trf/${id}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectionReason: reason }),
    });
    setLoading(null);
    if (res.ok) {
      router.refresh();
    }
  }

  if (showReject) {
    return (
      <div className="flex flex-col gap-2">
        <input
          placeholder="Sebab penolakan"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="input text-xs"
        />
        <div className="flex gap-2">
          <button
            onClick={() => decide("REJECTED")}
            disabled={loading !== null}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading === "REJECTED" ? "..." : "Sahkan Tolak"}
          </button>
          <button
            onClick={() => setShowReject(false)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50"
          >
            Batal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => decide("APPROVED")}
        disabled={loading !== null}
        className="rounded-md bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading === "APPROVED" ? "..." : "Luluskan"}
      </button>
      <button
        onClick={() => setShowReject(true)}
        disabled={loading !== null}
        className="rounded-md bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 disabled:opacity-50"
      >
        Tolak
      </button>
    </div>
  );
}
