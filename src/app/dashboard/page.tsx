"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PANCA_CINTA, MODEL_PEMBELAJARAN, PancaCintaKey } from "@/lib/rpp-types";

const DIMENSI_PROFIL = [
  "Keimanan & Ketakwaan",
  "Kewarganegaraan",
  "Bernalar Kritis",
  "Kreativitas",
  "Kolaborasi",
  "Kemandirian",
  "Kesehatan",
  "Komunikasi",
];

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  // Form state
  const [mapel, setMapel] = useState("");
  const [kelas, setKelas] = useState("");
  const [semester, setSemester] = useState("");
  const [model, setModel] = useState<string>(MODEL_PEMBELAJARAN[0]);
  const [alokasi, setAlokasi] = useState("2 x 35 Menit");
  const [jumlah, setJumlah] = useState("3");
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split("T")[0]);
  const [materi, setMateri] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [pancaCinta, setPancaCinta] = useState<PancaCintaKey[]>(["allah", "ilmu", "sesama"]);
  const [dimensi, setDimensi] = useState<string[]>(["Bernalar Kritis", "Komunikasi"]);
  const [error, setError] = useState("");

  // Rekomendasi AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAlasan, setAiAlasan] = useState("");
  const [aiError, setAiError] = useState("");

  // Tujuan Pembelajaran AI state
  const [tujuanLoading, setTujuanLoading] = useState(false);
  const [tujuanGenerated, setTujuanGenerated] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = sessionStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }
    // Load saved settings
    const saved = localStorage.getItem("rpp-settings");
    if (saved) {
      try {
        const s = JSON.parse(saved);
        setSettings(s);
        if (s.namaGuru) {
          // Pre-fill from settings if available
        }
      } catch {
        // ignore
      }
    }
  }, [router]);

  function togglePanca(key: PancaCintaKey) {
    setPancaCinta((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function toggleDimensi(label: string) {
    setDimensi((prev) =>
      prev.includes(label) ? prev.filter((d) => d !== label) : [...prev, label]
    );
  }

  async function handleGenerateTujuan() {
    if (!mapel || !materi) {
      setError("Isi Mata Pelajaran dan Materi Pokok terlebih dahulu.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setTujuanLoading(true);
    try {
      const res = await fetch("/api/generate-tujuan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapel, materi, kelas, model }),
      });
      const data = await res.json();
      if (data.ok) {
        setTujuan(data.tujuan);
        setTujuanGenerated(true);
      } else {
        setError(data.error || "Gagal generate tujuan pembelajaran.");
        setTimeout(() => setError(""), 3000);
      }
    } catch (e) {
      setError((e as Error).message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setTujuanLoading(false);
    }
  }

  async function handleRecommendAI() {
    if (!mapel && !materi) {
      setAiError("Isi minimal Mata Pelajaran atau Materi Pokok terlebih dahulu.");
      setTimeout(() => setAiError(""), 3000);
      return;
    }
    setAiLoading(true);
    setAiError("");
    setAiAlasan("");

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapel, materi, tujuan, kelas }),
      });
      const data = await res.json();

      if (data.ok) {
        // Apply AI recommendations
        setPancaCinta(data.pancaCinta);
        setDimensi(data.dimensi);
        setAiAlasan(data.alasan);
      } else {
        setAiError(data.error || "Gagal mendapatkan rekomendasi.");
      }
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    if (!mapel || !kelas || !materi) {
      setError("Harap lengkapi Mapel, Kelas, dan Materi Pokok.");
      return;
    }

    // Auto-generate tujuan jika belum diisi
    let tujuanFinal = tujuan;
    if (!tujuanFinal.trim()) {
      setTujuanLoading(true);
      try {
        const res = await fetch("/api/generate-tujuan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mapel, materi, kelas, model }),
        });
        const data = await res.json();
        if (data.ok) {
          tujuanFinal = data.tujuan;
          setTujuan(tujuanFinal);
          setTujuanGenerated(true);
        }
      } catch {
        // proceed with empty tujuan — generator will handle default
      } finally {
        setTujuanLoading(false);
      }
    }
    setError("");
    setLoading(true);

    try {
      const body = {
        namaSekolah: settings?.namaMadrasah || "MIN 1 CIAMIS",
        namaGuru: settings?.namaGuru || "Guru",
        nipGuru: settings?.nipGuru || "-",
        namaKepsek: settings?.namaKepsek || "Kepala Madrasah",
        nipKepsek: settings?.nipKepsek || "-",
        mapel,
        kelas,
        semester,
        fase: getFase(kelas),
        tahunPelajaran: settings?.tahunPelajaran || "2025/2026",
        materiPokok: materi,
        tujuanPembelajaran: tujuanFinal,
        alokasiWaktu: alokasi,
        jumlahPertemuan: `${jumlah} Pertemuan`,
        model,
        capaianPembelajaran: "",
        tujuanPembelajaranDetail: "",
        dimensiProfil: dimensi.join(", "),
        lintasDisiplin: "",
        praktikPedagogis: "",
        lingkunganPembelajaran: "",
        pemanfaatanDigital: "",
        kemitraanPembelajaran: "",
        pancaCinta,
        jumlahSoal: 10,
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(`/rpp/${data.id}`);
      } else {
        setError(data.error || "Gagal generate RPP");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function getFase(k: string): string {
    if (["I", "II"].includes(k)) return "A";
    if (["III", "IV"].includes(k)) return "B";
    if (["V", "VI"].includes(k)) return "C";
    if (["VII", "VIII", "IX"].includes(k)) return "D";
    if (["X", "XI", "XII"].includes(k)) return "E";
    return "D";
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
          Generator RPP Digital
        </h1>
        <p className="text-blue-700 font-bold mt-1">{settings?.namaMadrasah || "MIN 1 CIAMIS"}</p>
        <p className="text-sm text-slate-500 mt-2">
          Sistem penyusunan RPP otomatis berbasis AI. Pastikan Data Madrasah di menu &quot;Pengaturan&quot; sudah benar sebelum membuat RPP.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-3">
          <h2 className="text-white font-bold text-lg text-center">
            Formulir RPP Baru
          </h2>
          <p className="text-blue-100 text-xs text-center mt-0.5">
            Identitas Madrasah & Guru diambil dari menu Pengaturan
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Row 1 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Pilih Mapel</label>
              <select
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                <option value="">-- Pilih Mapel --</option>
                <option>Al-Qur&#39;an Hadits</option>
                <option>Akidah Akhlak</option>
                <option>Fiqih</option>
                <option>Sejarah Kebudayaan Islam</option>
                <option>Pendidikan Pancasila</option>
                <option>Bahasa Indonesia</option>
                <option>Bahasa Arab</option>
                <option>Matematika</option>
                <option>IPAS</option>
                <option>Seni Budaya</option>
                <option>PJOK</option>
                <option>Bahasa Inggris</option>
                <option>Bahasa Sunda</option>
                <option>Koding AI</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Materi Pokok (Tema)</label>
              <input
                type="text"
                value={materi}
                onChange={(e) => setMateri(e.target.value)}
                placeholder="Permasalahan komunikasi digital, Interpretasi..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Kelas</label>
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                <option value="">-- Pilih Kelas --</option>
                {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"].map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                <option value="">-- Pilih Semester --</option>
                <option value="Ganjil">1 (Ganjil)</option>
                <option value="Genap">2 (Genap)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Model Pembelajaran</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                {MODEL_PEMBELAJARAN.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Alokasi Waktu</label>
                <select
                  value={alokasi}
                  onChange={(e) => setAlokasi(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={`${n} x 35 Menit`}>{n} x 35 Menit</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Jml. Pertemuan</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Tanggal Pembuatan RPP</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-600">
                  Tujuan Pembelajaran
                  <span className="text-slate-400 font-normal ml-1">
                    — AI akan mengisi otomatis jika dikosongkan
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateTujuan}
                  disabled={tujuanLoading}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                    tujuanLoading
                      ? "bg-blue-100 text-blue-400 cursor-wait"
                      : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                  }`}
                >
                  {tujuanLoading ? (
                    <>
                      <div className="w-3 h-3 border-[1.5px] border-blue-400 border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate AI
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <textarea
                  value={tujuan}
                  onChange={(e) => {
                    setTujuan(e.target.value);
                    setTujuanGenerated(false);
                  }}
                  rows={3}
                  placeholder="Kosongkan untuk auto-generate, atau ketik manual..."
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none transition ${
                    tujuanGenerated
                      ? "bg-green-50 border-green-300"
                      : "bg-slate-50 border-slate-200"
                  }`}
                />
                {tujuanGenerated && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      AI Generated
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                💡 Klik &quot;Generate AI&quot; atau kosongkan — AI otomatis membuat tujuan saat Generate RPP berdasarkan Mapel & Materi Pokok.
              </p>
            </div>
          </div>

          {/* Integrasi KBC */}
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl border border-blue-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0 1 1 0 002 0zm-1 2a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" />
                  </svg>
                  Integrasi KBC & Profil Lulusan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gunakan AI untuk menyesuaikan topik dengan materi pokok & tujuan
                </p>
              </div>
              <button
                type="button"
                onClick={handleRecommendAI}
                disabled={aiLoading}
                className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  aiLoading
                    ? "bg-blue-100 text-blue-400 border-blue-200 cursor-wait"
                    : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-400 active:scale-95"
                }`}
              >
                {aiLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Rekomendasi AI
                  </>
                )}
              </button>
            </div>

            {/* AI Error */}
            {aiError && (
              <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {aiError}
              </div>
            )}

            {/* AI Alasan (recommendation result) */}
            {aiAlasan && (
              <div className="mb-3 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 flex gap-2">
                <svg className="w-4 h-4 shrink-0 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span className="font-bold text-green-700">✨ Rekomendasi AI diterapkan!</span>
                  <p className="mt-1 leading-relaxed">{aiAlasan}</p>
                </div>
              </div>
            )}

            {/* TOPIC KBC */}
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-700 mb-2">
                TOPIC KBC (KURIKULUM BERBASIS CINTA)
              </p>
              <div className="flex flex-wrap gap-2">
                {PANCA_CINTA.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => togglePanca(p.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      pancaCinta.includes(p.key)
                        ? "bg-blue-600 text-white border-blue-600 shadow"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {pancaCinta.includes(p.key) && "✓ "}
                    {p.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => togglePanca("lingkungan")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    pancaCinta.includes("lingkungan")
                      ? "bg-blue-600 text-white border-blue-600 shadow"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {pancaCinta.includes("lingkungan") && "✓ "}
                  Cinta Tanah Air
                </button>
              </div>
            </div>

            {/* DIMENSI PROFIL */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">
                DIMENSI PROFIL LULUSAN
              </p>
              <div className="flex flex-wrap gap-2">
                {DIMENSI_PROFIL.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDimensi(d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      dimensi.includes(d)
                        ? "bg-blue-600 text-white border-blue-600 shadow"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {dimensi.includes(d) && "✓ "}
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menggenerate RPP...
              </>
            ) : (
              <>
                Generate RPP KBC
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
