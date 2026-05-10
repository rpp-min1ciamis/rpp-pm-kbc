"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MODEL_PEMBELAJARAN,
  PANCA_CINTA,
  PancaCintaKey,
  RppInput,
} from "@/lib/rpp-types";

const STEPS = [
  { n: 1, t: "Identitas Dasar" },
  { n: 2, t: "Kurikulum & Pembelajaran" },
  { n: 3, t: "Integrasi KBC / Panca Cinta" },
  { n: 4, t: "Pengalaman Belajar" },
  { n: 5, t: "Asesmen" },
  { n: 6, t: "Rubrik Penilaian" },
  { n: 7, t: "LKPD Generator" },
  { n: 8, t: "Soal Otomatis" },
];

const initial: RppInput = {
  namaSekolah: "",
  namaGuru: "",
  nipGuru: "",
  namaKepsek: "",
  nipKepsek: "",
  mapel: "",
  kelas: "VII",
  semester: "Ganjil",
  fase: "D",
  tahunPelajaran: "2025/2026",
  materiPokok: "",
  tujuanPembelajaran: "", // ← menggantikan topik
  alokasiWaktu: "2 x 40 menit",
  jumlahPertemuan: "1 Pertemuan",
  model: "Problem Based Learning (PBL)",
  capaianPembelajaran: "",
  tujuanPembelajaranDetail: "",
  dimensiProfil: "",
  lintasDisiplin: "",
  praktikPedagogis: "",
  lingkunganPembelajaran: "",
  pemanfaatanDigital: "",
  kemitraanPembelajaran: "",
  pancaCinta: ["allah", "ilmu", "sesama"],
  jumlahSoal: 10,
};

export default function WizardClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<RppInput>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof RppInput>(key: K, value: RppInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function togglePanca(key: PancaCintaKey) {
    setForm((f) => ({
      ...f,
      pancaCinta:
        f.pancaCinta.includes(key)
          ? f.pancaCinta.filter((k) => k !== key)
          : [...f.pancaCinta, key],
    }));
  }

  const canNext = useMemo(() => {
    if (step === 1) {
      return (
        form.namaSekolah.trim() &&
        form.namaGuru.trim() &&
        form.mapel.trim() &&
        form.materiPokok.trim() &&
        form.tujuanPembelajaran.trim()
      );
    }
    if (step === 3) return form.pancaCinta.length > 0;
    return true;
  }, [step, form]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Gagal generate");
      router.push(`/rpp/${data.id}`);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Generator RPP PM-KBC
        </h1>
        <p className="text-sm text-slate-600">
          Isi data berikut. Field yang kosong akan diisi otomatis oleh AI
          berdasarkan mapel & materi. <strong>Tujuan Pembelajaran</strong> akan
          digunakan AI untuk menghasilkan narasi topik KBC secara otomatis.
        </p>
      </div>

      {/* Stepper */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {STEPS.map((s) => (
            <button
              key={s.n}
              type="button"
              onClick={() => setStep(s.n)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                step === s.n
                  ? "border-emerald-600 bg-emerald-600 text-white shadow"
                  : step > s.n
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  step === s.n
                    ? "bg-white text-emerald-700"
                    : step > s.n
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200"
                }`}
              >
                {s.n}
              </span>
              <span className="hidden sm:inline">{s.t}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        {step === 1 && <Step1 form={form} update={update} />}
        {step === 2 && <Step2 form={form} update={update} />}
        {step === 3 && <Step3 form={form} togglePanca={togglePanca} />}
        {step === 4 && <StepInfo title="Pengalaman Belajar (Deep Learning)" desc="AI akan otomatis menyusun PENDAHULUAN, INTI sesuai sintaks model pembelajaran yang dipilih, dan PENUTUP — lengkap dengan kegiatan guru, kegiatan peserta didik, integrasi Panca Cinta, dimensi profil lulusan, estimasi waktu, dan penguatan karakter." />}
        {step === 5 && <StepInfo title="Asesmen Otomatis" desc="AI akan menghasilkan Asesmen Diagnostik (observasi awal & tanya jawab), Asesmen Formatif (observasi proses, LKPD, aktivitas kelompok), dan Asesmen Sumatif (presentasi & tes tertulis)." />}
        {step === 6 && <StepInfo title="Rubrik Penilaian" desc="Rubrik Holistik (partisipasi, kolaborasi, sikap diskusi, kualitas ide, kesepakatan) dan Rubrik Analitik yang otomatis menyesuaikan dengan kategori mata pelajaran (Bahasa, IPA, Matematika, IPS, Agama, dll)." />}
        {step === 7 && <StepInfo title="LKPD Generator" desc="Otomatis menghasilkan LKPD 1 (Aktivitas Kelompok) dan LKPD 2 (Latihan Individu) yang berisi tujuan, petunjuk, aktivitas, tabel jawaban, dan refleksi siswa sesuai materi." />}
        {step === 8 && <Step8 form={form} update={update} />}

        {error && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            ← Sebelumnya
          </button>
          <div className="text-xs text-slate-500">
            Langkah {step} dari {STEPS.length}
          </div>
          {step < STEPS.length ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
              disabled={!canNext}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
            >
              Berikutnya →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60"
            >
              {loading ? "#ang membuat RPP..." : "✨ Generate RPP"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable inputs ---------- */

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      )}
    </label>
  );
}

function inputCls() {
  return "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
}

/* ---------- Steps ---------- */

function Step1({
  form,
  update,
}: {
  form: RppInput;
  update: <K extends keyof RppInput>(k: K, v: RppInput[K]) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-slate-900">
        1. Identitas Dasar
      </h2>
      <p className="mb-5 text-sm text-slate-600">
        Data yang akan dicantumkan pada bagian A. Identitas Modul.
      </p>

      {/* ⭐ Tujuan Pembelajaran — highlighted */}
      <div className="mb-5 rounded-xl border-2 border-emerald-200 bg-emerald-50/60 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            ⭐ AI Auto-Narrative
          </span>
          <span className="text-xs text-emerald-800 font-medium">
            Narasi KBC otomatis dibuat dari input ini
          </span>
        </div>
        <Field label="Tujuan Pembelajaran" required hint="Tuliskan tujuan pembelajaran yang ingin dicapai. AI akan otomatis menganalisis dan menghasilkan narasi topik Panca Cinta (KBC) yang relevan untuk setiap dimensi cinta.">
          <textarea
            rows={4}
            className={inputCls()}
            value={form.tujuanPembelajaran}
            onChange={(e) =>
              update("tujuanPembelajaran", e.target.value)
            }
            placeholder="Contoh: Peserta didik mampu menganalisis struktur teks berita, mengidentifikasi fakta dan opini, serta menyusun teks berita sederhana tentang isu lingkungan sekitar dengan menerapkan nilai-nilai kepedulian terhadap lingkungan."
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama Madrasah/Sekolah" required>
          <input
            className={inputCls()}
            value={form.namaSekolah}
            onChange={(e) => update("namaSekolah", e.target.value)}
            placeholder="MTs Al-Hikmah"
          />
        </Field>
        <Field label="Nama Guru" required>
          <input
            className={inputCls()}
            value={form.namaGuru}
            onChange={(e) => update("namaGuru", e.target.value)}
            placeholder="Ahmad Fauzan, S.Pd"
          />
        </Field>
        <Field label="NIP Guru">
          <input
            className={inputCls()}
            value={form.nipGuru}
            onChange={(e) => update("nipGuru", e.target.value)}
            placeholder="19850101 200912 1 001"
          />
        </Field>
        <Field label="Nama Kepala Madrasah/Sekolah">
          <input
            className={inputCls()}
            value={form.namaKepsek}
            onChange={(e) => update("namaKepsek", e.target.value)}
          />
        </Field>
        <Field label="NIP Kepala Sekolah">
          <input
            className={inputCls()}
            value={form.nipKepsek}
            onChange={(e) => update("nipKepsek", e.target.value)}
          />
        </Field>
        <Field label="Mata Pelajaran" required>
          <input
            className={inputCls()}
            value={form.mapel}
            onChange={(e) => update("mapel", e.target.value)}
            placeholder="Bahasa Indonesia / Akidah Akhlak / IPA"
          />
        </Field>
        <Field label="Kelas" required>
          <select
            className={inputCls()}
            value={form.kelas}
            onChange={(e) => update("kelas", e.target.value)}
          >
            {[
              "I",
              "II",
              "III",
              "IV",
              "V",
              "VI",
              "VII",
              "VIII",
              "IX",
              "X",
              "XI",
              "XII",
            ].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Semester">
          <select
            className={inputCls()}
            value={form.semester}
            onChange={(e) => update("semester", e.target.value)}
          >
            <option>Ganjil</option>
            <option>Genap</option>
          </select>
        </Field>
        <Field label="Fase">
          <select
            className={inputCls()}
            value={form.fase}
            onChange={(e) => update("fase", e.target.value)}
          >
            {["A", "B", "C", "D", "E", "F"].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Tahun Pelajaran">
          <input
            className={inputCls()}
            value={form.tahunPelajaran}
            onChange={(e) => update("tahunPelajaran", e.target.value)}
          />
        </Field>
        <Field label="Materi Pokok" required>
          <input
            className={inputCls()}
            value={form.materiPokok}
            onChange={(e) => update("materiPokok", e.target.value)}
            placeholder="Teks Berita / Musyawarah / Energi"
          />
        </Field>
        <Field label="Alokasi Waktu">
          <input
            className={inputCls()}
            value={form.alokasiWaktu}
            onChange={(e) => update("alokasiWaktu", e.target.value)}
            placeholder="2 x 40 menit"
          />
        </Field>
        <Field label="Jumlah Pertemuan">
          <input
            className={inputCls()}
            value={form.jumlahPertemuan}
            onChange={(e) =>
              update("jumlahPertemuan", e.target.value)
            }
          />
        </Field>
        <Field label="Model Pembelajaran">
          <select
            className={inputCls()}
            value={form.model}
            onChange={(e) => update("model", e.target.value)}
          >
            {MODEL_PEMBELAJARAN.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

function Step2({
  form,
  update,
}: {
  form: RppInput;
  update: <K extends keyof RppInput>(k: K, v: RppInput[K]) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-slate-900">
        2. Kurikulum & Pembelajaran
      </h2>
      <p className="mb-5 text-sm text-slate-600">
        Kosongkan untuk dibuat otomatis berdasarkan mapel dan materi.
      </p>
      <div className="grid gap-4">
        <Field label="Capaian Pembelajaran (CP)" hint="Pisahkan dengan baris baru atau kosongkan untuk auto-generate.">
          <textarea
            rows={3}
            className={inputCls()}
            value={form.capaianPembelajaran}
            onChange={(e) =>
              update("capaianPembelajaran", e.target.value)
            }
          />
        </Field>
        <Field label="Tujuan Pembelajaran (Detail)" hint="Satu tujuan per baris. Jika kosong, AI generate otomatis dari Tujuan Pembelajaran Langkah 1.">
          <textarea
            rows={3}
            className={inputCls()}
            value={form.tujuanPembelajaranDetail}
            onChange={(e) =>
              update("tujuanPembelajaranDetail", e.target.value)
            }
            placeholder="Peserta didik mampu menjelaskan konsep...&#10;Peserta didik mampu menganalisis...&#10;Peserta didik mampu menyajikan..."
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Dimensi Profil Lulusan">
            <textarea
              rows={3}
              className={inputCls()}
              value={form.dimensiProfil}
              onChange={(e) => update("dimensiProfil", e.target.value)}
              placeholder="Bernalar kritis, Mandiri, Kreatif, ..."
            />
          </Field>
          <Field label="Lintas Disiplin Ilmu">
            <textarea
              rows={3}
              className={inputCls()}
              value={form.lintasDisiplin}
              onChange={(e) => update("lintasDisiplin", e.target.value)}
              placeholder="PAI, PPKn, IPS, ..."
            />
          </Field>
          <Field label="Praktik Pedagogis">
            <textarea
              rows={3}
              className={inputCls()}
              value={form.praktikPedagogis}
              onChange={(e) =>
                update("praktikPedagogis", e.target.value)
              }
            />
          </Field>
          <Field label="Lingkungan Pembelajaran">
            <textarea
              rows={3}
              className={inputCls()}
              value={form.lingkunganPembelajaran}
              onChange={(e) =>
                update("lingkunganPembelajaran", e.target.value)
              }
            />
          </Field>
          <Field label="Pemanfaatan Digital">
            <textarea
              rows={3}
              className={inputCls()}
              value={form.pemanfaatanDigital}
              onChange={(e) =>
                update("pemanfaatanDigital", e.target.value)
              }
            />
          </Field>
          <Field label="Kemitraan Pembelajaran">
            <textarea
              rows={3}
              className={inputCls()}
              value={form.kemitraanPembelajaran}
              onChange={(e) =>
                update("kemitraanPembelajaran", e.target.value)
              }
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function Step3({
  form,
  togglePanca,
}: {
  form: RppInput;
  togglePanca: (k: PancaCintaKey) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-slate-900">
        3. Integrasi KBC / Panca Cinta
      </h2>
      <p className="mb-5 text-sm text-slate-600">
        Pilih nilai Panca Cinta yang akan diintegrasikan. AI akan otomatis
        menghasilkan narasi topik KBC berdasarkan{" "}
        <strong>Tujuan Pembelajaran</strong> yang Anda tulis di Langkah 1.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PANCA_CINTA.map((p) => {
          const active = form.pancaCinta.includes(p.key);
          return (
            <button
              type="button"
              key={p.key}
              onClick={() => togglePanca(p.key)}
              className={`rounded-xl border p-4 text-left transition ${
                active
                  ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200"
                  : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">
                  {p.key === "allah" && "🕌"}
                  {p.key === "ilmu" && "📚"}
                  {p.key === "diri" && "🧍"}
                  {p.key === "sesama" && "🤝"}
                  {p.key === "lingkungan" && "🌍"}
                </span>
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-md border ${
                    active
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {active ? "✓" : ""}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {p.label}
              </p>
            </button>
          );
        })}
      </div>
      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <strong>🤖 AI Auto-Narrative:</strong> Berdasarkan Tujuan Pembelajaran
        yang Anda masukkan, AI akan menghasilkan narasi topik KBC yang
        spesifik dan bermakna untuk setiap dimensi Panca Cinta yang dipilih.
        Narasi akan menjelaskan bagaimana tujuan pembelajaran terintegrasi
        dengan nilai-nilai Panca Cinta dalam konteks materi dan mata pelajaran.
      </div>
    </div>
  );
}

function Step8({
  form,
  update,
}: {
  form: RppInput;
  update: <K extends keyof RppInput>(k: K, v: RppInput[K]) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-slate-900">
        8. Soal Otomatis AI
      </h2>
      <p className="mb-5 text-sm text-slate-600">
        Tentukan jumlah soal pilihan ganda (5–20 soal). Kisi-kisi dan kunci
        jawaban dibuat otomatis.
      </p>
      <Field label={`Jumlah Soal: ${form.jumlahSoal}`}>
        <input
          type="range"
          min={5}
          max={20}
          step={1}
          value={form.jumlahSoal}
          onChange={(e) => update("jumlahSoal", Number(e.target.value))}
          className="w-full accent-emerald-600"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>5</span>
          <span>10</span>
          <span>15</span>
          <span>20</span>
        </div>
      </Field>
      <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <p className="font-semibold">✨ Siap untuk Generate!</p>
        <p className="mt-1 text-emerald-800">
          Klik tombol <b>Generate RPP</b> di bawah. AI akan membuat dokumen
          RPP lengkap dengan narasi KBC otomatis dari Tujuan Pembelajaran,
          sintaks Deep Learning, rubrik, LKPD, kisi-kisi, dan soal pilihan
          ganda.
        </p>
      </div>
    </div>
  );
}

function StepInfo({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-slate-900">{title}</h2>
      <p className="mb-5 text-sm text-slate-600">
        Bagian ini akan dihasilkan otomatis oleh AI.
      </p>
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 text-sm text-emerald-900">
        <div className="mb-2 text-2xl">🤖</div>
        <p>{desc}</p>
        <p className="mt-3 text-xs text-emerald-800">
          Tidak perlu mengisi apa pun — lanjutkan ke langkah berikutnya.
        </p>
      </div>
    </div>
  );
}
