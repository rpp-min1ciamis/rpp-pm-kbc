import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "RPP PM-KBC | Generator RPP Kurikulum Merdeka + Panca Cinta",
  description:
    "Aplikasi AI untuk membuat RPP otomatis sesuai Kurikulum Merdeka Deep Learning yang terintegrasi Kurikulum Berbasis Cinta (Panca Cinta) untuk guru madrasah/sekolah.",
  keywords: [
    "RPP",
    "Kurikulum Merdeka",
    "Deep Learning",
    "KBC",
    "Panca Cinta",
    "Madrasah",
    "Kemenag",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 text-slate-900 antialiased">
        <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-md print:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-md">
                R
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold tracking-tight text-slate-900">RPP PM-KBC</p>
                <p className="text-[11px] text-slate-500">Pembelajaran Mendalam · Kurikulum Berbasis Cinta</p>
              </div>
            </Link>
            <nav className="hidden items-center gap-1 sm:gap-2">
              {/* Removed buttons as requested */}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 print:max-w-none print:p-0">
          {children}
        </main>
        <footer className="mt-12 border-t border-slate-200/60 bg-white/60 py-6 text-center text-xs text-slate-500 print:hidden">
          © {new Date().getFullYear()} RPP PM-KBC · Dibuat untuk guru madrasah & sekolah Indonesia
        </footer>
      </body>
    </html>
  );
}
