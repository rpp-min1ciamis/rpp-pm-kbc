export type PancaCintaKey =
  | "allah"
  | "ilmu"
  | "diri"
  | "sesama"
  | "lingkungan";

export const PANCA_CINTA: { key: PancaCintaKey; label: string }[] = [
  { key: "allah", label: "Cinta kepada Allah/Rasul-Nya" },
  { key: "ilmu", label: "Cinta Ilmu" },
  { key: "diri", label: "Cinta Diri" },
  { key: "sesama", label: "Cinta Sesama" },
  { key: "lingkungan", label: "Cinta Lingkungan/Bangsa" },
];

export const MODEL_PEMBELAJARAN = [
  "Problem Based Learning (PBL)",
  "Project Based Learning (PjBL)",
  "Discovery Learning",
  "Inquiry Learning",
  "Cooperative Learning",
  "Contextual Teaching and Learning (CTL)",
  "Direct Instruction",
] as const;

export type ModelPembelajaran = (typeof MODEL_PEMBELAJARAN)[number];

export interface RppInput {
  namaSekolah: string;
  namaGuru: string;
  nipGuru: string;
  namaKepsek: string;
  nipKepsek: string;
  mapel: string;
  kelas: string;
  semester: string;
  fase: string;
  tahunPelajaran: string;
  materiPokok: string;
  tujuanPembelajaran: string;
  alokasiWaktu: string;
  jumlahPertemuan: string;
  model: string;
  capaianPembelajaran: string;
  tujuanPembelajaranDetail: string;
  dimensiProfil: string;
  lintasDisiplin: string;
  praktikPedagogis: string;
  lingkunganPembelajaran: string;
  pemanfaatanDigital: string;
  kemitraanPembelajaran: string;
  pancaCinta: PancaCintaKey[];
  jumlahSoal: number;
}

export interface IdentifikasiKbcItem {
  panca: string;
  insersi: string;
}

export interface KisiKisiItem {
  no: number;
  indikator: string;
  materi: string;
  ruhKbc: string;
  level: string;
}

export interface LkpdActivity {
  judul: string;
  tipe: "Kelompok" | "Individu";
  tujuan: string;
  petunjuk: string[];
  aktivitas: string[];
  tabelKolom: string[];
  refleksi: string[];
}

export interface RubrikItem {
  aspek: string;
  level4: string;
  level3: string;
  level2: string;
  level1: string;
}

/**
 * Fase inti pada satu pertemuan (3 fase Deep Learning)
 */
export interface FaseInti {
  /** Contoh: "1. Memahami (Orientasi peserta didik pada masalah & Mengorganisasikan peserta didik untuk belajar)" */
  judul: string;
  waktu: string;
  /** Daftar kegiatan bernomor */
  kegiatan: string[];
  /** Penguatan KBC untuk fase ini */
  penguatanKbc: string;
}

export interface PengalamanPerPertemuan {
  nomor: number;
  /** Contoh: "2 x 35 Menit" */
  alokasi: string;
  pendahuluan: string[];
  waktuPendahuluan: string;
  inti: FaseInti[];
  waktuInti: string;
  penutup: string[];
  waktuPenutup: string;
}

export interface SoalItem {
  no: number;
  pertanyaan: string;
  pilihan: { A: string; B: string; C: string; D: string };
  kunci: "A" | "B" | "C" | "D";
  pembahasan: string;
}

export interface RppOutput {
  identitas: {
    namaSekolah: string;
    mapel: string;
    kelas: string;
    semester: string;
    fase: string;
    tahunPelajaran: string;
    materiPokok: string;
    alokasiWaktu: string;
    jumlahPertemuan: string;
    model: string;
    namaGuru: string;
    nipGuru: string;
    namaKepsek: string;
    nipKepsek: string;
  };
  identifikasiKbc: {
    kesiapanMurid: string[];
    dimensiProfil: string[];
    topikKbc: IdentifikasiKbcItem[];
    materiInsersi: string[];
  };
  desain: {
    capaianPembelajaran: string;
    lintasDisiplin: string[];
    tujuanPembelajaran: string[];
    praktikPedagogis: string[];
    kemitraan: string[];
    lingkungan: string[];
    pemanfaatanDigital: string[];
  };
  /** Array pengalaman belajar PER pertemuan */
  pengalamanBelajar: PengalamanPerPertemuan[];
  asesmen: {
    diagnostik: string[];
    formatif: string[];
    sumatif: string[];
  };
  lampiran: {
    rubrikHolistik: RubrikItem[];
    rubrikAnalitik: RubrikItem[];
    lkpd: LkpdActivity[];
    kisiKisi: KisiKisiItem[];
    soal: SoalItem[];
  };
}
