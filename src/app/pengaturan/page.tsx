"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const THEMES = [
  { name: "Hijau Muda", color: "#22c55e" },
  { name: "Toska (Teal)", color: "#14b8a6" },
  { name: "Cyan Cerah", color: "#06b6d4" },
  { name: "Biru Langit", color: "#3b82f6" },
  { name: "Indigo Lembut", color: "#6366f1" },
  { name: "Rose Memukau", color: "#f43f5e" },
  { name: "Amber Hangat", color: "#f59e0b" },
];

interface Settings {
  namaMadrasah: string;
  logo: string;
  namaGuru: string;
  nipGuru: string;
  namaKepsek: string;
  nipKepsek: string;
  tahunPelajaran: string;
  theme: string;
}

const defaultSettings: Settings = {
  namaMadrasah: "MIN 1 CIAMIS",
  logo: "",
  namaGuru: "",
  nipGuru: "",
  namaKepsek: "",
  nipKepsek: "",
  tahunPelajaran: "2025/2026",
  theme: "Biru Langit",
};

export default function PengaturanPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [logoFileName, setLogoFileName] = useState<string>("");
  const [logoError, setLogoError] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const user = sessionStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }
    const stored = localStorage.getItem("rpp-settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
    const fname = localStorage.getItem("rpp-logo-name");
    if (fname) setLogoFileName(fname);
  }, [router]);

  function handleSave() {
    localStorage.setItem("rpp-settings", JSON.stringify(settings));
    if (logoFileName) localStorage.setItem("rpp-logo-name", logoFileName);
    // Notify same-tab listeners (navbar) to refresh logo/nama
    window.dispatchEvent(new Event("rpp-settings-updated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLogoError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!/^image\/(png|jpe?g|svg\+xml|webp)$/.test(file.type)) {
      setLogoError("Format harus PNG, JPG, SVG, atau WEBP.");
      return;
    }
    // Max 1 MB
    if (file.size > 1024 * 1024) {
      setLogoError("Ukuran maksimal 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      update("logo", dataUrl);
      setLogoFileName(file.name);
    };
    reader.onerror = () => setLogoError("Gagal membaca file.");
    reader.readAsDataURL(file);
  }

  function handleLogoRemove() {
    update("logo", "");
    setLogoFileName("");
    localStorage.removeItem("rpp-logo-name");
  }

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Pengaturan Aplikasi</h1>
      <p className="text-sm text-slate-500 mb-6">
        Data ini akan digunakan otomatis pada setiap pembuatan RPP.
      </p>

      <div className="space-y-5">
        {/* Identitas Madrasah */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Identitas Madrasah
            </h2>
          </div>
          <div className="p-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Nama Madrasah</label>
              <input
                value={settings.namaMadrasah}
                onChange={(e) => update("namaMadrasah", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                Logo Madrasah <span className="font-normal text-slate-400">(PNG/JPG/SVG, maks 1 MB)</span>
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="cursor-pointer px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 inline-flex items-center gap-1.5 transition">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Pilih File
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-slate-500 truncate max-w-[160px]" title={logoFileName}>
                  {logoFileName || "Tidak ada file yang dipilih"}
                </span>
                {settings.logo ? (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white rounded border border-slate-200 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={settings.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={handleLogoRemove}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold"
                      title="Hapus logo"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-slate-50 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              {logoError && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{logoError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tema Tampilan */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Tema Tampilan Aplikasi
            </h2>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => update("theme", t.name)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition ${
                    settings.theme === t.name
                      ? "border-blue-600 bg-blue-50"
                      : "border-transparent hover:border-slate-200"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full shadow-sm"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className={`text-[10px] font-medium ${settings.theme === t.name ? "text-blue-700" : "text-slate-500"}`}>
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Pendidik */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Data Pendidik (Guru)
            </h2>
          </div>
          <div className="p-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Nama Guru</label>
              <input
                value={settings.namaGuru}
                onChange={(e) => update("namaGuru", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">NIP Guru</label>
              <input
                value={settings.nipGuru}
                onChange={(e) => update("nipGuru", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Data Kepala Madrasah */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Data Kepala Madrasah
            </h2>
          </div>
          <div className="p-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Nama Kepala Madrasah</label>
              <input
                value={settings.namaKepsek}
                onChange={(e) => update("namaKepsek", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">NIP Kepala Madrasah</label>
              <input
                value={settings.nipKepsek}
                onChange={(e) => update("nipKepsek", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Tahun Pelajaran */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Tahun Pelajaran
            </h2>
          </div>
          <div className="p-5">
            <div className="max-w-xs">
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Tahun Pelajaran (Aktif)</label>
              <input
                value={settings.tahunPelajaran}
                onChange={(e) => update("tahunPelajaran", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between">
          <p />
          <button
            onClick={handleSave}
            className={`px-6 py-3 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition ${
              saved
                ? "bg-green-600 text-white"
                : "bg-blue-700 text-white hover:bg-blue-800"
            }`}
          >
            {saved ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Tersimpan!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
