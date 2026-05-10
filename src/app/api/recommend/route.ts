import { NextRequest } from "next/server";
import type { PancaCintaKey } from "@/lib/rpp-types";

export const dynamic = "force-dynamic";

/* ============================================================
 * AI Recommendation Engine
 * Menganalisis mapel, materi, dan tujuan untuk merekomendasikan
 * Topik KBC dan Dimensi Profil Lulusan yang paling relevan.
 * ========================================================== */

interface RecommendRequest {
  mapel: string;
  materi: string;
  tujuan: string;
  kelas: string;
}

interface RecommendResponse {
  ok: boolean;
  pancaCinta: PancaCintaKey[];
  dimensi: string[];
  alasan: string;
}

// ---- Keyword -> Panca Cinta mapping ----

const KBC_KEYWORDS: Record<PancaCintaKey, RegExp[]> = {
  allah: [
    /doa|ibadah|sholat|shalat|puasa|zakat|haji|iman|takwa|akhlak|rasul|nabi|islam|quran|qur'an|hadis|fikih|aqidah|akidah|tauhid|syukur|taubat|tawadhu|ikhlas|sabar|tawakkal|sunnah|wajib|haram|halal|surga|neraka|malaikat|kitab|akhirat|mu'?min|muslim|musyawarah|ukhuw|silaturah/i,
    /agama|pai|ski|sejarah kebudayaan islam|bahasa arab/i,
  ],
  ilmu: [
    /belajar|pelajar|ilmu|pengetahuan|sains|riset|eksperimen|analisis|literasi|baca|tulis|hitung|data|konsep|teori|rumus|definisi|kaidah|tanda baca|kalimat|paragraf|teks|ejaan|diksi|struktur|komposisi|metodologi|penelitian/i,
    /matematika|ipa|fisika|kimia|biologi|bahasa|sastra/i,
  ],
  diri: [
    /percaya diri|mandiri|tanggung jawab|disiplin|jujur|integritas|kesehatan|kebersihan|olahraga|gizi|nutrisi|mental|emosi|motivasi|potensi|bakat|minat|cita-cita|karakter|refleksi diri|identitas|harga diri/i,
    /pjok|bimbingan|konseling|seni/i,
  ],
  sesama: [
    /diskusi|kerja ?sama|kolaborasi|kelompok|tim|gotong ?royong|toleransi|empati|tolong|peduli|berbagi|komunikasi|presentasi|pendapat|musyawarah|negosiasi|konflik|damai|adil|kesetaraan|hak|kewajiban|demokrasi|sosial|masyarakat|keluarga|teman|sahabat/i,
    /ips|ppkn|pkn|pancasila|sosiologi/i,
  ],
  lingkungan: [
    /lingkungan|alam|ekosistem|polusi|pencemaran|sampah|daur ulang|hutan|laut|air|udara|tanah|bumi|iklim|cuaca|bencana|konservasi|pelestarian|biodiversitas|energi|terbarukan|kebersihan|hijau|tanaman|hewan|tumbuhan|flora|fauna|geografi|peta|wilayah|negara|bangsa|nasional|nusantara|indonesia|budaya|tradisi|adat|seni|kerajinan|batik|tari/i,
    /ips|geografi|biologi|seni budaya|pkn|ppkn/i,
  ],
};

// ---- Keyword -> Dimensi Profil mapping ----

const DIMENSI_KEYWORDS: Record<string, RegExp> = {
  "Keimanan & Ketakwaan": /doa|ibadah|iman|takwa|akhlak|agama|islam|allah|rasul|sholat|quran|hadis|fikih|aqidah|syukur|taubat/i,
  "Kewarganegaraan": /pancasila|warga|negara|hak|kewajiban|demokrasi|nasional|bangsa|konstitusi|hukum|peraturan|masyarakat|gotong royong|toleransi|bhinneka/i,
  "Bernalar Kritis": /analisis|evaluasi|kritik|argumen|logis|bukti|data|perbandingan|sebab|akibat|hipotesis|eksperimen|menilai|membandingkan|menyimpulkan|memecahkan|masalah|solusi|hots/i,
  "Kreativitas": /kreatif|inovasi|ide|gagasan|cipta|rancang|desain|karya|seni|imajinasi|produk|proyek|eksperimen|modifikasi|original|baru|unik/i,
  "Kolaborasi": /kelompok|tim|kerja ?sama|kolaborasi|diskusi|musyawarah|bersama|gotong|berbagi|negosiasi|kesepakatan|presentasi kelompok/i,
  "Kemandirian": /mandiri|individu|tanggung jawab|disiplin|inisiatif|mengatur|merencanakan|evaluasi diri|refleksi|target|tujuan pribadi/i,
  "Kesehatan": /kesehatan|olahraga|gizi|nutrisi|kebersihan|penyakit|imunisasi|sanitasi|sehat|bugar|mental|fisik|pjok|jasmani|rohani/i,
  "Komunikasi": /komunikasi|presentasi|berbicara|menulis|membaca|menyimak|bahasa|lisan|tulisan|media|digital|informasi|literasi|publika|pidato|debat/i,
};

function scorePancaCinta(text: string): PancaCintaKey[] {
  const scores: Record<PancaCintaKey, number> = {
    allah: 0,
    ilmu: 0,
    diri: 0,
    sesama: 0,
    lingkungan: 0,
  };

  for (const [key, patterns] of Object.entries(KBC_KEYWORDS)) {
    for (const pattern of patterns) {
      const matches = text.match(new RegExp(pattern, "gi"));
      if (matches) {
        scores[key as PancaCintaKey] += matches.length;
      }
    }
  }

  // Sort by score descending, pick those with score > 0, minimum 2
  const sorted = (Object.entries(scores) as [PancaCintaKey, number][])
    .sort(([, a], [, b]) => b - a);

  const result: PancaCintaKey[] = [];
  for (const [key, score] of sorted) {
    if (score > 0 || result.length < 2) {
      result.push(key);
    }
  }
  // Always include allah for madrasah context
  if (!result.includes("allah")) {
    result.unshift("allah");
  }
  // Always include ilmu
  if (!result.includes("ilmu")) {
    result.push("ilmu");
  }

  return result.slice(0, 5);
}

function scoreDimensi(text: string): string[] {
  const scores: [string, number][] = [];

  for (const [dimensi, pattern] of Object.entries(DIMENSI_KEYWORDS)) {
    const matches = text.match(new RegExp(pattern, "gi"));
    scores.push([dimensi, matches ? matches.length : 0]);
  }

  scores.sort(([, a], [, b]) => b - a);

  const result: string[] = [];
  for (const [dimensi, score] of scores) {
    if (score > 0 || result.length < 2) {
      result.push(dimensi);
    }
    if (result.length >= 4) break;
  }

  return result;
}

function generateAlasan(
  mapel: string,
  materi: string,
  panca: PancaCintaKey[],
  dimensi: string[],
): string {
  const pancaLabels: Record<PancaCintaKey, string> = {
    allah: "Cinta kepada Allah/Rasul-Nya",
    ilmu: "Cinta Ilmu",
    diri: "Cinta Diri",
    sesama: "Cinta Sesama",
    lingkungan: "Cinta Lingkungan/Bangsa",
  };

  const pancaNames = panca.map((k) => pancaLabels[k]).join(", ");

  return `Berdasarkan analisis mapel "${mapel}" dan materi "${materi}", AI merekomendasikan integrasi ${pancaNames} karena materi ini berkaitan erat dengan nilai-nilai tersebut. Dimensi profil lulusan yang relevan: ${dimensi.join(", ")} — sesuai kompetensi yang dikembangkan dalam pembelajaran ini.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RecommendRequest;

    const combinedText = [
      body.mapel || "",
      body.materi || "",
      body.tujuan || "",
      body.kelas || "",
    ].join(" ");

    if (combinedText.trim().length < 3) {
      return Response.json(
        {
          ok: false,
          error: "Isi minimal Mata Pelajaran atau Materi Pokok terlebih dahulu.",
        },
        { status: 400 },
      );
    }

    // Simulate AI processing delay for UX
    await new Promise((r) => setTimeout(r, 800));

    const pancaCinta = scorePancaCinta(combinedText);
    const dimensi = scoreDimensi(combinedText);
    const alasan = generateAlasan(body.mapel, body.materi, pancaCinta, dimensi);

    return Response.json({
      ok: true,
      pancaCinta,
      dimensi,
      alasan,
    } satisfies RecommendResponse);
  } catch (err) {
    return Response.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
