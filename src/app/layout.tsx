import type { Metadata } from "next";
import "./globals.css";
import { auth, signOut } from "@/lib/auth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Training Evaluation System",
  description: "GHCL Training Request, Rating & Evaluation System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <Link href="/" className="font-semibold text-lg">
              📋 Training Evaluation System
            </Link>
            <nav className="flex items-center gap-1 text-sm flex-wrap">
              <Link href="/trf" className="rounded px-3 py-1.5 hover:bg-white/15">
                Mohon Latihan
              </Link>
              <Link href="/search" className="rounded px-3 py-1.5 hover:bg-white/15">
                Semak Rekod
              </Link>
              {session?.user?.role === "SUPERIOR" || session?.user?.role === "ADMIN" ? (
                <Link href="/superior" className="rounded px-3 py-1.5 hover:bg-white/15">
                  Penilaian Superior
                </Link>
              ) : null}
              {session?.user?.role === "ADMIN" ? (
                <Link href="/admin" className="rounded px-3 py-1.5 hover:bg-white/15">
                  Admin
                </Link>
              ) : null}
              {session?.user ? (
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button className="rounded px-3 py-1.5 bg-red-500/90 hover:bg-red-500">
                    Logout ({session.user.name})
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="rounded px-3 py-1.5 bg-white/15 hover:bg-white/25"
                >
                  Log Masuk
                </Link>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
        <footer className="text-center text-xs text-slate-400 py-6">
          Training Evaluation System
        </footer>
      </body>
    </html>
  );
}
