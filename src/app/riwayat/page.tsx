"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RppItem {
  id: number;
  judul: string;
  namaGuru: string;
  namaSekolah: string;
  mapel: string;
  kelas: string;
  fase: string;
  model: string;
  createdAt: string;
  output?: any;
  input?: any;
}

export default function RiwayatPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<RppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const user = sessionStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }
    fetchRiwayat();
  }, [router]);

  async function fetchRiwayat() {
    try {
      const res = await fetch("/api/rpp");
      const data = await res.json();
      if (data.ok) setItems(data.items || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus RPP ini?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/rpp/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Riwayat RPP</h1>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
          {items.length} Tersimpan
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-lg font-bold text-slate-800">Belum ada RPP yang dibuat</h2>
          <p className="text-sm text-slate-500 mt-2">
            Mulai buat RPP pertama Anda dengan wizard generator.
          </p>
          <Link
            href="/dashboard"
            className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl shadow hover:bg-blue-700 transition"
          >
            🚀 Buat RPP Baru
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition"
            >
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400 px-5 py-4">
                <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">
                  {item.judul}
                </h3>
                <p className="text-blue-100 text-xs mt-1">
                  {item.mapel} • Kelas {item.kelas}
                </p>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {item.input?.alokasiWaktu || "2 x 35 Menit"} ({item.input?.jumlahPertemuan || "1 Pertemuan"})
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Model: {item.model.split(" ")[0]}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Dibuat: {new Date(item.createdAt).toLocaleDateString("id-ID")}
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="text-xs font-bold text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  {deleting === item.id ? "Menghapus..." : "Hapus"}
                </button>
                <Link
                  href={`/rpp/${item.id}`}
                  className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                >
                  Edit / Buat
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
