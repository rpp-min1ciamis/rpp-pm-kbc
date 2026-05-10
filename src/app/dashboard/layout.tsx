"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [logo, setLogo] = useState<string>("");
  const [namaMadrasah, setNamaMadrasah] = useState<string>("MIN 1 CIAMIS");

  useEffect(() => {
    setMounted(true);
    const user = sessionStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }
    // Load logo & nama from settings
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
    // Listen for cross-tab updates
    const onStorage = (e: StorageEvent) => {
      if (e.key === "rpp-settings" && e.newValue) {
        try {
          const s = JSON.parse(e.newValue);
          if (s.logo !== undefined) setLogo(s.logo || "");
          if (s.namaMadrasah) setNamaMadrasah(s.namaMadrasah);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", onStorage);
    // Also listen for same-tab updates via a custom event
    const onCustom = () => {
      const stored2 = localStorage.getItem("rpp-settings");
      if (stored2) {
        try {
          const s = JSON.parse(stored2);
          if (s.logo !== undefined) setLogo(s.logo || "");
          if (s.namaMadrasah) setNamaMadrasah(s.namaMadrasah);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("rpp-settings-updated", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("rpp-settings-updated", onCustom);
    };
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { href: "/dashboard", label: "Buat RPP Baru", icon: "plus" },
    { href: "/riwayat", label: "Penyimpanan RPP", icon: "folder" },
    { href: "/pengaturan", label: "Pengaturan", icon: "gear" },
  ];

  function handleLogout() {
    sessionStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#eef2f7]">
      {/* Top Navbar */}
      <header className="bg-gradient-to-r from-blue-800 via-blue-700 to-teal-700 shadow-lg sticky top-0 z-50">
        {/* Main nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-white/30">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-white text-sm font-bold leading-tight">APLIKASI GENERATE RPP KBC</p>
                  <p className="text-blue-200 text-[10px]">{namaMadrasah}</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-blue-200 text-xs">
                Copyright: agusarifien ©2026
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold rounded-lg border border-red-400/30 transition"
              >
                KELUAR
              </button>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-0">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "border-white text-white"
                      : "border-transparent text-blue-200 hover:text-blue-100 hover:border-blue-300"
                  }`}
                >
                  {tab.icon === "plus" && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                  {tab.icon === "folder" && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  )}
                  {tab.icon === "gear" && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Active tab underline */}
        <div className="h-0.5 bg-gradient-to-r from-blue-400 to-teal-400" />
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
