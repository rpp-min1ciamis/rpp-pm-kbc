"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const USERS = [
  { username: "admin", password: "admin123", nama: "Administrator" },
  { username: "guru", password: "guru123", nama: "Guru Madrasah" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState<string>("");
  const [namaMadrasah, setNamaMadrasah] = useState<string>("MIN 1 CIAMIS");

  useEffect(() => {
    const stored = localStorage.getItem("rpp-settings");
    if (stored) {
      try {
        const s = JSON.parse(stored);
        if (s.logo) setLogo(s.logo);
        if (s.namaMadrasah) setNamaMadrasah(s.namaMadrasah);
      } catch {
        // ignore
      }
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const user = USERS.find((u) => u.username === username && u.password === password);
      if (user) {
        sessionStorage.setItem("user", JSON.stringify(user));
        router.push("/dashboard");
      } else {
        setError("Username atau password salah!");
      }
      setLoading(false);
    }, 500);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-800 via-blue-800 to-blue-900 px-8 py-10 text-center">
          {/* Logos */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Logo Kemenag */}
            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 overflow-hidden p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://freeimghost.com/images/2026/05/08/logo-kemenag60fceb73d13a9d39.png"
                alt="Logo Kemenag"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Logo Madrasah (custom upload, jika ada) */}
            {logo && (
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-white/20 overflow-hidden p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt="Logo Madrasah" className="max-w-full max-h-full object-contain" />
              </div>
            )}
          </div>

          <h1 className="text-white text-xl sm:text-2xl font-extrabold tracking-tight leading-tight">
            SELAMAT DATANG DI<br />
            APLIKASI RPP KBC
          </h1>
          <p className="text-blue-200 text-sm mt-3">
            Silakan masuk untuk melanjutkan
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan Username"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan Password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              "Memproses..."
            ) : (
              <>
                MASUK APLIKASI
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">
            COPYRIGHT : AGUS ARIFIEN © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
