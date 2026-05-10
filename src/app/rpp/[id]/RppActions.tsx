"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RppActions({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function onDelete() {
    if (!confirm("Hapus RPP ini? Tindakan tidak dapat dibatalkan.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/rpp/${id}`, { method: "DELETE" });
      if (res.ok) router.push("/riwayat");
    } finally {
      setBusy(false);
    }
  }

  async function onDownloadDocx() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/rpp/${id}/docx`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Gagal download DOCX");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : `RPP-${id}.docx`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      alert("Gagal download: " + (err as Error).message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Print / PDF */}
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg bg-white border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print / PDF
      </button>

      {/* Download DOCX */}
      <button
        type="button"
        onClick={onDownloadDocx}
        disabled={downloading}
        className="rounded-lg bg-blue-600 border border-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-wait"
      >
        {downloading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Membuat DOCX...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download DOCX
          </>
        )}
      </button>

      {/* Hapus */}
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition flex items-center gap-1.5 disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Hapus
      </button>
    </div>
  );
}
