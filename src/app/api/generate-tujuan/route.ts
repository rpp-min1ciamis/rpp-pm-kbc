import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/* ============================================================
 * AI Tujuan Pembelajaran Generator
 * Menghasilkan tujuan pembelajaran otomatis berdasarkan
 * mapel, materi pokok, kelas, model, dan fase.
 * ========================================================== */

interface GenerateTujuanRequest {
  mapel: string;
  materi: string;
  kelas: string;
  model: string;
}

function getMapelCategory(mapel: string): string {
  const m = mapel.toLowerCase();
  if (/(akidah|fikih|fiqh|qur'?an|hadis|aqidah|ski|bahasa arab|pai|agama|akhlak)/.test(m)) return "agama";
  if (/(bahasa indonesia|bahasa inggris|sastra)/.test(m)) return "bahasa";
  if (/(ipa|fisika|kimia|biologi|sains)/.test(m)) return "ipa";
  if (/(ips|ekonomi|sosiologi|sejarah|geografi|ppkn|pkn|pancasila)/.test(m)) return "ips";
  if (/(matematika|math)/.test(m)) return "matematika";
  if (/(seni|budaya|sbdp|musik|tari|rupa)/.test(m)) return "seni";
  if (/(pjok|olahraga|penjas)/.test(m)) return "pjok";
  return "umum";
}

function getFase(kelas: string): string {
  if (["I", "II"].includes(kelas)) return "A";
  if (["III", "IV"].includes(kelas)) return "B";
  if (["V", "VI"].includes(kelas)) return "C";
  if (["VII", "VIII", "IX"].includes(kelas)) return "D";
  return "E";
}

function getJenjangBahasa(kelas: string): string {
  const jenjang = ["I", "II", "III", "IV", "V", "VI"];
  if (jenjang.includes(kelas)) return "MI/SD";
  return "MTs/SMP";
}

function generateTujuan(req: GenerateTujuanRequest): string {
  const { mapel, materi, kelas, model } = req;
  const kategori = getMapelCategory(mapel);
  const fase = getFase(kelas);
  const jenjang = getJenjangBahasa(kelas);
  const modelShort = model.split("(")[0].trim();
  const materiLower = materi.toLowerCase();

  // ---- Detect action verbs from materi ----
  const hasAnalisis = /analisis|analisa|bandingkan|klasifikasi|identifikasi|bedakan/.test(materiLower);
  const hasPenerapan = /terapkan|gunakan|praktik|buat|susun|rancang|tulis/.test(materiLower);
  const hasDiskusi = /diskusi|musyawarah|debat|presentasi|kelompok/.test(materiLower);
  const hasEksperimen = /eksperimen|percobaan|pengamatan|observasi|laboratorium/.test(materiLower);

  // ---- Build contextual Tujuan Pembelajaran ----
  const parts: string[] = [];

  // Opening — always include understanding
  switch (kategori) {
    case "agama":
      parts.push(
        `Melalui kegiatan pembelajaran ${modelShort}, peserta didik kelas ${kelas} diharapkan dapat memahami konsep ${materi} sesuai dengan ajaran Islam yang benar`,
        `mampu menjelaskan dalil dan hikmah yang terkandung dalam ${materi} dengan bahasa yang santun dan mudah dipahami`,
      );
      if (hasDiskusi) {
        parts.push(`mampu berdiskusi tentang ${materi} dengan sikap saling menghargai pendapat (Cinta Diri dan Sesama)`);
      }
      parts.push(
        `serta mampu menerapkan nilai-nilai ${materi} dalam kehidupan sehari-hari sebagai wujud ketakwaan kepada Allah Swt. (Cinta kepada Allah/Rasul-Nya)`,
      );
      break;

    case "bahasa":
      parts.push(
        `Melalui kegiatan pembelajaran ${modelShort}, peserta didik kelas ${kelas} diharapkan dapat memahami ${materi} dengan baik`,
      );
      if (hasDiskusi) {
        parts.push(`mampu berdiskusi untuk mencapai kesepakatan dengan sikap saling menghargai pendapat (Cinta Diri dan Sesama)`);
      }
      if (hasPenerapan || /tanda|kutip|baca|tulis|kalimat|paragraf|teks|karangan|puisi|pantun/.test(materiLower)) {
        parts.push(`mampu menggunakan kaidah kebahasaan yang tepat terkait ${materi} sebagai wujud dari ketelitian dalam berbahasa (Cinta Ilmu)`);
      }
      parts.push(
        `serta mampu berkomunikasi yang baik sesuai ajaran (Cinta kepada Allah/Rasul-Nya)`,
      );
      break;

    case "ipa":
      parts.push(
        `Melalui kegiatan pembelajaran ${modelShort}, peserta didik kelas ${kelas} diharapkan dapat menjelaskan konsep ${materi} berdasarkan pengamatan dan data`,
      );
      if (hasEksperimen) {
        parts.push(`mampu melakukan percobaan/pengamatan terkait ${materi} dengan prosedur yang tepat dan aman`);
      }
      parts.push(
        `mampu menganalisis hubungan antar konsep ${materi} dalam kehidupan sehari-hari`,
        `serta mampu menyajikan hasil pemikiran tentang ${materi} secara lisan maupun tulisan dengan mengintegrasikan nilai Panca Cinta`,
      );
      break;

    case "matematika":
      parts.push(
        `Melalui kegiatan pembelajaran ${modelShort}, peserta didik kelas ${kelas} diharapkan dapat memahami konsep ${materi} secara tepat`,
        `mampu menyelesaikan masalah yang berkaitan dengan ${materi} menggunakan strategi yang efisien`,
        `mampu mengkomunikasikan proses dan hasil penyelesaian masalah ${materi} secara lisan maupun tulisan`,
        `serta mampu mengintegrasikan nilai kejujuran dan ketelitian (Cinta Ilmu) dalam setiap proses perhitungan`,
      );
      break;

    case "ips":
      parts.push(
        `Melalui kegiatan pembelajaran ${modelShort}, peserta didik kelas ${kelas} diharapkan dapat memahami konsep ${materi} dalam konteks kehidupan bermasyarakat`,
        `mampu menganalisis permasalahan sosial yang berkaitan dengan ${materi}`,
      );
      if (hasDiskusi) {
        parts.push(`mampu berdiskusi dan bermusyawarah tentang solusi permasalahan terkait ${materi} (Cinta Sesama)`);
      }
      parts.push(
        `serta mampu menumbuhkan sikap peduli terhadap lingkungan dan bangsa (Cinta Lingkungan/Bangsa)`,
      );
      break;

    case "seni":
      parts.push(
        `Melalui kegiatan pembelajaran ${modelShort}, peserta didik kelas ${kelas} diharapkan dapat mengapresiasi dan memahami ${materi}`,
        `mampu mengekspresikan ide kreatif melalui karya ${materi} dengan percaya diri (Cinta Diri)`,
        `serta mampu menghargai keragaman budaya dan karya seni (Cinta Lingkungan/Bangsa)`,
      );
      break;

    case "pjok":
      parts.push(
        `Melalui kegiatan pembelajaran ${modelShort}, peserta didik kelas ${kelas} diharapkan dapat memahami dan mempraktikkan ${materi} dengan teknik yang benar`,
        `mampu menunjukkan sikap sportivitas dan kerja sama dalam aktivitas ${materi} (Cinta Sesama)`,
        `serta mampu menerapkan pola hidup sehat sebagai wujud Cinta Diri dan syukur kepada Allah Swt.`,
      );
      break;

    default:
      parts.push(
        `Melalui kegiatan pembelajaran ${modelShort}, peserta didik kelas ${kelas} diharapkan dapat memahami konsep ${materi} secara mendalam`,
        `mampu menganalisis dan menerapkan ${materi} dalam berbagai konteks`,
        `mampu menyajikan hasil belajar tentang ${materi} secara lisan dan tulisan`,
        `serta mampu mengintegrasikan nilai-nilai Panca Cinta dalam aktivitas belajar dan kehidupan sehari-hari`,
      );
  }

  return parts.join(", ") + ".";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateTujuanRequest;

    if (!body.mapel && !body.materi) {
      return Response.json(
        { ok: false, error: "Isi Mata Pelajaran dan Materi Pokok terlebih dahulu." },
        { status: 400 },
      );
    }

    // Simulate brief AI processing
    await new Promise((r) => setTimeout(r, 600));

    const tujuan = generateTujuan(body);

    return Response.json({ ok: true, tujuan });
  } catch (err) {
    return Response.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
