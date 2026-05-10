import {
  IdentifikasiKbcItem,
  KisiKisiItem,
  LkpdActivity,
  PANCA_CINTA,
  PancaCintaKey,
  RppInput,
  RppOutput,
  RubrikItem,
  FaseInti,
  PengalamanPerPertemuan,
  SoalItem,
} from "./rpp-types";

/* ============================================================
 * Helper utilities
 * ========================================================== */

function ensure(text: string, fallback: string): string {
  return text && text.trim().length > 0 ? text.trim() : fallback;
}

function lines(text: string): string[] {
  return text
    .split(/\r?\n|•|;|,(?=\s)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

/**
 * Parse "6 x 35 Menit" → { totalJP: 6, menitPerJP: 35, totalMenit: 210 }
 */
function parseAlokasiWaktu(raw: string): { totalJP: number; menitPerJP: number; totalMenit: number } {
  const match = raw.match(/(\d+)\s*x\s*(\d+)/);
  if (match) {
    const jp = parseInt(match[1], 10);
    const menit = parseInt(match[2], 10);
    return { totalJP: jp, menitPerJP: menit, totalMenit: jp * menit };
  }
  return { totalJP: 2, menitPerJP: 35, totalMenit: 70 };
}

/**
 * Parse "3 Pertemuan" → 3
 */
function parseJumlahPertemuan(raw: string): number {
  const match = raw.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

function getMapelKategori(mapel: string): "agama" | "bahasa" | "ipa" | "ips" | "matematika" | "umum" {
  const m = mapel.toLowerCase();
  if (/(akidah|fikih|fiqh|qur'?an|hadis|aqidah|ski|sejarah kebudayaan islam|bahasa arab|pai|agama|akhlak)/.test(m))
    return "agama";
  if (/(bahasa|indonesia|inggris|english|sastra)/.test(m)) return "bahasa";
  if (/(ipa|fisika|kimia|biologi|sains|natural)/.test(m)) return "ipa";
  if (/(ips|ekonomi|sosiologi|sejarah|geografi|ppkn|pkn|pancasila)/.test(m)) return "ips";
  if (/(matematika|math)/.test(m)) return "matematika";
  return "umum";
}

/* ============================================================
 * Panca Cinta integration phrases (formal Kemenag style)
 * ========================================================== */

const PANCA_INSERSI: Record<PancaCintaKey, string[]> = {
  allah: [
    "Membiasakan musyawarah untuk mencapai kesepakatan sebagai salah satu bentuk ajaran Islam yang mengedepankan kebaikan bersama dan menghindari perselisihan.",
    "Menyadari bahwa setiap ilmu pengetahuan adalah bagian dari ayat-ayat Allah yang wajib dipelajari.",
    "Mengawali dan mengakhiri pembelajaran dengan doa sebagai bentuk syukur kepada Allah Swt.",
    "Meneladani akhlak Rasulullah Saw. dalam menyikapi perbedaan pendapat selama diskusi.",
  ],
  ilmu: [
    "Mengembangkan kemampuan berbahasa Indonesia yang baik dan benar, termasuk kaidah penulisan, agar komunikasi menjadi efektif dan pesan tersampaikan dengan jelas.",
    "Membiasakan literasi membaca, menulis, dan berpikir kritis dalam setiap aktivitas belajar.",
    "Menghargai proses berpikir ilmiah dan kejujuran akademik dalam menyusun kesimpulan.",
  ],
  diri: [
    "Mengembangkan sikap saling menghargai, mendengarkan, dan menyampaikan pendapat dengan sopan saat berdiskusi demi kepentingan bersama dan menjaga silaturahmi.",
    "Melatih kemandirian dan tanggung jawab dalam menyelesaikan tugas individu maupun kelompok.",
    "Menjaga adab belajar serta menumbuhkan kesadaran diri akan potensi yang dimiliki.",
  ],
  sesama: [
    "Mengembangkan sikap saling menghargai, mendengarkan, dan menyampaikan pendapat dengan sopan saat berdiskusi demi kepentingan bersama dan menjaga silaturahmi.",
    "Menumbuhkan empati dan kerja sama dalam menyelesaikan masalah bersama.",
    "Mendorong sikap tolong-menolong serta menjaga adab komunikasi yang santun dengan sesama.",
  ],
  lingkungan: [
    "Menumbuhkan kesadaran menjaga kebersihan kelas dan lingkungan madrasah.",
    "Menanamkan rasa cinta tanah air melalui apresiasi terhadap kekayaan budaya bangsa.",
    "Mengintegrasikan nilai pelestarian lingkungan sebagai amanah dari Allah Swt.",
  ],
};

/* ============================================================
 * Auto-generate KBC topic narratives from Tujuan Pembelajaran
 * ========================================================== */

function generateKbcNarratives(
  tujuan: string,
  materi: string,
  mapel: string,
  pancaKeys: PancaCintaKey[],
): IdentifikasiKbcItem[] {
  const tujuanLower = tujuan.toLowerCase();

  const themes: string[] = [];
  if (/menjelaskan|memahami|mengetahui|mendeskripsikan/.test(tujuanLower)) themes.push("pemahaman konsep");
  if (/menganalisis|mengidentifikasi|membedakan|mengklasifikasi/.test(tujuanLower)) themes.push("analisis mendalam");
  if (/menerapkan|menggunakan|mempraktikkan|membuat/.test(tujuanLower)) themes.push("penerapan praktis");
  if (/menciptakan|merancang|menghasilkan|menyusun/.test(tujuanLower)) themes.push("kreativitas");
  if (/menilai|mengevaluasi|mengkritisi|membandingkan/.test(tujuanLower)) themes.push("evaluasi kritis");
  if (/berdiskusi|berkolaborasi|bekerja sama|berkelompok/.test(tujuanLower)) themes.push("kolaborasi");
  if (/menulis|menyusun|mengarang|membuat karangan/.test(tujuanLower)) themes.push("literasi menulis");
  if (/menghitung|menyelesaikan|mengukur|mengolah data/.test(tujuanLower)) themes.push("pemecahan masalah");

  if (themes.length === 0) themes.push("eksplorasi materi");

  const narratives: IdentifikasiKbcItem[] = pancaKeys.map((key) => {
    const label = PANCA_CINTA.find((p) => p.key === key)!.label;
    const pool = PANCA_INSERSI[key];

    let idx = 0;
    if (themes[0] === "pemahaman konsep") idx = 1;
    else if (themes[0] === "analisis mendalam") idx = 2;
    else if (themes[0] === "penerapan praktis") idx = 3;
    else if (themes[0] === "kreativitas") idx = 0;
    else if (themes[0] === "evaluasi kritis") idx = 2;
    else if (themes[0] === "kolaborasi") idx = 2;
    else if (themes[0] === "literasi menulis") idx = 1;
    else if (themes[0] === "pemecahan masalah") idx = 0;

    const base = pool[idx % pool.length];

    const narrative = `Dalam pembelajaran ${materi} pada mata pelajaran ${mapel}, peserta didik mengintegrasikan nilai "${label}" melalui kegiatan ${themes[0]}. Secara spesifik, mereka ${base.toLowerCase().replace(/^./, (c) => c.toLowerCase())} yang berkaitan dengan tujuan pembelajaran: "${tujuan.substring(0, 80)}${tujuan.length > 80 ? "..." : ""}". Hal ini menunjukkan bahwa pembelajaran tidak hanya mencapai kompetensi akademik, tetapi juga menanamkan nilai-nilai Panca Cinta secara bermakna.`;

    return { panca: label, insersi: narrative };
  });

  return narratives;
}

/* ============================================================
 * Sintaks model pembelajaran
 * ========================================================== */

interface SintaksTemplate {
  no: string;
  namaFase: string;
  namaSintaks: string;
}

function getSintaksModel(model: string): SintaksTemplate[] {
  const m = model.toLowerCase();
  if (m.includes("project") || m.includes("pjbl")) {
    return [
      { no: "1", namaFase: "Memahami", namaSintaks: "Penentuan pertanyaan mendasar & Menyusun perencanaan proyek" },
      { no: "2", namaFase: "Mengaplikasi", namaSintaks: "Menyusun jadwal pelaksanaan proyek & Memantau peserta didik dan kemajuan proyek" },
      { no: "3", namaFase: "Merefleksi", namaSintaks: "Menguji hasil dan presentasi & Mengevaluasi pengalaman belajar" },
    ];
  }
  if (m.includes("discovery")) {
    return [
      { no: "1", namaFase: "Memahami", namaSintaks: "Stimulation (Pemberian rangsangan) & Problem statement (Identifikasi masalah)" },
      { no: "2", namaFase: "Mengaplikasi", namaSintaks: "Data collection (Pengumpulan data) & Data processing (Pengolahan data)" },
      { no: "3", namaFase: "Merefleksi", namaSintaks: "Verification (Pembuktian) & Generalization (Menarik kesimpulan)" },
    ];
  }
  if (m.includes("inquiry")) {
    return [
      { no: "1", namaFase: "Memahami", namaSintaks: "Orientasi & Merumuskan masalah" },
      { no: "2", namaFase: "Mengaplikasi", namaSintaks: "Merumuskan hipotesis & Mengumpulkan data" },
      { no: "3", namaFase: "Merefleksi", namaSintaks: "Menguji hipotesis & Merumuskan kesimpulan" },
    ];
  }
  if (m.includes("cooperative")) {
    return [
      { no: "1", namaFase: "Memahami", namaSintaks: "Menyampaikan tujuan dan memotivasi peserta didik & Menyajikan informasi" },
      { no: "2", namaFase: "Mengaplikasi", namaSintaks: "Mengorganisasikan peserta didik dalam kelompok belajar & Membimbing kelompok bekerja dan belajar" },
      { no: "3", namaFase: "Merefleksi", namaSintaks: "Evaluasi & Memberikan penghargaan" },
    ];
  }
  if (m.includes("contextual") || m.includes("ctl")) {
    return [
      { no: "1", namaFase: "Memahami", namaSintaks: "Konstruktivisme & Inkuiri" },
      { no: "2", namaFase: "Mengaplikasi", namaSintaks: "Bertanya (Questioning) & Masyarakat belajar (Learning community)" },
      { no: "3", namaFase: "Merefleksi", namaSintaks: "Pemodelan (Modelling) & Refleksi & penilaian autentik" },
    ];
  }
  if (m.includes("direct")) {
    return [
      { no: "1", namaFase: "Memahami", namaSintaks: "Menyampaikan tujuan dan menyiapkan peserta didik & Mendemonstrasikan pengetahuan/keterampilan" },
      { no: "2", namaFase: "Mengaplikasi", namaSintaks: "Membimbing pelatihan & Mengecek pemahaman dan memberikan umpan balik" },
      { no: "3", namaFase: "Merefleksi", namaSintaks: "Memberi kesempatan latihan lanjutan" },
    ];
  }
  // Default PBL
  return [
    { no: "1", namaFase: "Memahami", namaSintaks: "Orientasi peserta didik pada masalah & Mengorganisasikan peserta didik untuk belajar" },
    { no: "2", namaFase: "Mengaplikasi", namaSintaks: "Membimbing penyelidikan individu maupun kelompok" },
    { no: "3", namaFase: "Merefleksi", namaSintaks: "Mengembangkan dan menyajikan hasil karya & Menganalisis dan mengevaluasi proses pemecahan masalah" },
  ];
}

/* ============================================================
 * Identifikasi & KBC
 * ========================================================== */

function buildIdentifikasi(input: RppInput): RppOutput["identifikasiKbc"] {
  const dimensiInput = lines(input.dimensiProfil);
  const defaultDimensi = [
    "Beriman, bertakwa kepada Tuhan Yang Maha Esa, dan berakhlak mulia",
    "Berkebinekaan global",
    "Bergotong royong",
    "Mandiri",
    "Bernalar kritis",
    "Kreatif",
  ];
  const dimensiProfil = dimensiInput.length > 0 ? dimensiInput : defaultDimensi;

  const tujuan = ensure(input.tujuanPembelajaran, "Peserta didik mampu memahami dan menerapkan konsep yang dipelajari.");
  const topikKbc = generateKbcNarratives(
    tujuan,
    input.materiPokok,
    input.mapel,
    input.pancaCinta.length > 0 ? input.pancaCinta : (["allah", "ilmu", "sesama"] as PancaCintaKey[]),
  );

  const materiInsersi = input.pancaCinta.flatMap((key) =>
    PANCA_INSERSI[key].slice(0, 2).map((s) => `${PANCA_CINTA.find((p) => p.key === key)!.label}: ${s}`),
  );

  return {
    kesiapanMurid: [
      `Peserta didik kelas ${input.kelas} secara umum telah memiliki pengalaman belajar terkait ${input.materiPokok} pada jenjang sebelumnya.`,
      "Sebagian peserta didik memiliki gaya belajar visual, auditori, dan kinestetik yang beragam sehingga pembelajaran dirancang multimoda.",
      "Kesiapan peserta didik dipetakan melalui asesmen diagnostik di awal pembelajaran untuk menentukan strategi diferensiasi yang tepat.",
    ],
    dimensiProfil,
    topikKbc,
    materiInsersi,
  };
}

/* ============================================================
 * Desain pembelajaran
 * ========================================================== */

function buildDesain(input: RppInput): RppOutput["desain"] {
  const tujuan = ensure(
    input.tujuanPembelajaran,
    `Peserta didik mampu memahami dan menerapkan konsep ${input.materiPokok} secara bermakna melalui pembelajaran berbasis Panca Cinta.`,
  );

  const cp = ensure(
    input.capaianPembelajaran,
    `Fase ${input.fase}: Peserta didik mampu memahami konsep ${input.materiPokok} secara komprehensif, ` +
      `menerapkannya dalam konteks pembelajaran ${input.mapel} yang bermakna. ` +
      `Tujuan: ${tujuan.substring(0, 100)}${tujuan.length > 100 ? "..." : ""}`,
  );

  const lintas = lines(input.lintasDisiplin);
  const lintasDefault = ["Pendidikan Agama Islam", "Bahasa Indonesia", "PPKn", "IPS", "Seni Budaya"];

  const tp = lines(input.tujuanPembelajaranDetail);
  const tpDefault = [
    `Melalui kegiatan pembelajaran ${input.model}, peserta didik diharapkan dapat memahami konsep ${input.materiPokok} dengan baik.`,
    `Peserta didik mampu menganalisis materi melalui kegiatan diskusi dan presentasi.`,
    `Peserta didik mampu menyajikan hasil pemikiran tentang ${input.materiPokok} secara lisan maupun tulisan.`,
    `Peserta didik mampu mengintegrasikan nilai Panca Cinta dalam aktivitas belajar dan kehidupan sehari-hari.`,
  ];

  const pedagogis = lines(input.praktikPedagogis);
  const pedagogisDefault = [
    `Pembelajaran berbasis masalah (${input.model}) yang berpusat pada peserta didik.`,
    "Pembelajaran kolaboratif melalui diskusi kelompok, diferensiasi dalam penyampaian materi (visual, auditori).",
    "Penggunaan pertanyaan pemantik untuk stimulasi berpikir kritis.",
  ];

  const kemitraan = lines(input.kemitraanPembelajaran);
  const kemitraanDefault = [
    "Mendorong interaksi positif antar peserta didik melalui kerja kelompok.",
    "Membangun suasana kelas yang kolaboratif, serta komunikasi dengan orang tua/wali untuk mendukung pengembangan karakter.",
  ];

  const lingkungan = lines(input.lingkunganPembelajaran);
  const lingkunganDefault = [
    "Ruang kelas yang diatur fleksibel untuk diskusi kelompok, dilengkapi media visual (papan tulis, proyektor).",
    "Suasana belajar yang kondusif, aman, dan memotivasi untuk berpendapat.",
  ];

  const digital = lines(input.pemanfaatanDigital);
  const digitalDefault = [
    "Penggunaan proyektor untuk menampilkan materi dan contoh-contoh yang relevan.",
    "Pemanfaatan gawai (jika memungkinkan dan relevan dengan pengawasan guru) untuk mencari informasi sederhana terkait topik diskusi.",
  ];

  return {
    capaianPembelajaran: cp,
    lintasDisiplin: lintas.length ? lintas : lintasDefault,
    tujuanPembelajaran: tp.length ? tp : tpDefault,
    praktikPedagogis: pedagogis.length ? pedagogis : pedagogisDefault,
    kemitraan: kemitraan.length ? kemitraan : kemitraanDefault,
    lingkungan: lingkungan.length ? lingkungan : lingkunganDefault,
    pemanfaatanDigital: digital.length ? digital : digitalDefault,
  };
}

/* ============================================================
 * Pengalaman Belajar (Deep Learning) — PER PERT EMUAN
 * ========================================================== */

function generatePertemuan(
  nomor: number,
  jpPerPertemuan: number,
  menitPerJP: number,
  pancaList: PancaCintaKey[],
  materi: string,
  mapel: string,
  kelas: string,
  model: string,
  dimensiList: string[],
): PengalamanPerPertemuan {
  const totalMenit = jpPerPertemuan * menitPerJP;
  const waktuPendahuluan = 10;
  const waktuPenutup = 10;
  const waktuInti = totalMenit - waktuPendahuluan - waktuPenutup;
  const waktuFase = Math.round(waktuInti / 3);

  const pancaLabels = pancaList.map((k) => PANCA_CINTA.find((p) => p.key === k)!.label);
  const sintaksModel = getSintaksModel(model);

  // === PENDAHULUAN ===
  const pendahuluan: string[] = [
    `Guru membuka pelajaran dengan salam dan menanyakan kabar peserta didik.`,
    `Peserta didik berdoa bersama dipimpin oleh ketua kelas (${pancaLabels[0] || "Cinta kepada Allah/Rasul-Nya"}).`,
    `Guru mengecek kehadiran peserta didik.`,
  ];

  if (nomor === 1) {
    pendahuluan.push(
      `Guru melakukan apersepsi dengan bertanya: "Apakah kalian pernah mengalami situasi yang berkaitan dengan ${materi}? Bagaimana perasaan kalian saat itu?"`,
      `Guru memotivasi peserta didik tentang pentingnya kemampuan yang dipelajari dalam kehidupan sehari-hari (${pancaLabels.slice(0, 2).join(", ")}).`,
      `Guru menyampaikan tujuan pembelajaran yang akan dicapai.`,
    );
  } else if (nomor === 2) {
    pendahuluan.push(
      `Guru melakukan apersepsi dengan mengingatkan kembali materi pada pertemuan sebelumnya tentang ${materi}.`,
      `Guru memotivasi peserta didik untuk melanjutkan aktivitas yang belum selesai dan menyampaikan tujuan pertemuan ini.`,
    );
  } else {
    pendahuluan.push(
      `Guru melakukan apersepsi dengan bertanya: "Apa yang masih perlu kita perbaiki dari pertemuan sebelumnya?"`,
      `Guru memotivasi peserta didik untuk menyelesaikan seluruh rangkaian pembelajaran dan menyampaikan tujuan pertemuan ini.`,
    );
  }

  // === INTI ===
  function generateKegiatanFase(faseIdx: number): string[] {
    const kegiatan: string[] = [];

    if (faseIdx === 0) {
      kegiatan.push(
        `Guru menampilkan sebuah masalah atau studi kasus sederhana yang memerlukan pemikiran kritis untuk menemukan solusi terkait ${materi} (Dimensi ${dimensiList[0]}).`,
        `Peserta didik mengamati dan memahami masalah yang disajikan oleh guru.`,
        `Guru membagi peserta didik ke dalam beberapa kelompok kecil.`,
        `Guru menjelaskan konsep ${materi} dengan contoh-contoh yang mudah dipahami. (Cinta Ilmu)`,
      );
    } else if (faseIdx === 1) {
      kegiatan.push(
        `Setiap kelompok berdiskusi untuk mencari solusi atas masalah yang diberikan guru, bertukar pendapat, dan berusaha mencapai kesepakatan terbaik. (Dimensi ${dimensiList[1] || "Kolaborasi"} & ${dimensiList[2] || "Komunikasi"})`,
        `Peserta didik dalam setiap kelompok menuliskan ide-ide mereka dan hasil kesepakatan yang dicapai dalam lembar kerja. (LKPD 1)`,
        `Setiap kelompok juga diminta untuk mengerjakan latihan tambahan terkait ${materi} pada LKPD. (LKPD 2, Cinta Ilmu)`,
      );
    } else {
      kegiatan.push(
        `Setiap kelompok mempresentasikan hasil diskusi dan kesepakatan yang telah mereka buat di depan kelas. (Dimensi ${dimensiList[2] || "Komunikasi"})`,
        `Kelompok lain diberi kesempatan untuk memberikan tanggapan atau pertanyaan dengan sopan.`,
        `Guru memberikan umpan balik dan penguatan mengenai jalannya diskusi yang baik serta sikap saling menghargai.`,
      );
    }

    return kegiatan;
  }

  function generatePenguatanKbc(faseIdx: number): string {
    if (faseIdx === 0) {
      return `Pemahaman masalah dan pembentukan kelompok melatih ${pancaLabels[0] || "Cinta Diri dan Sesama"} dalam berinteraksi. Penjelasan materi tentang ${materi} adalah bentuk dari Cinta Ilmu untuk berpengetahuan yang benar.`;
    } else if (faseIdx === 1) {
      return `Kegiatan diskusi kelompok dan mencapai kesepakatan menumbuhkan ${pancaLabels.slice(1, 3).join(" dan ")} serta nilai musyawarah sebagai implementasi Cinta kepada Allah/Rasul-Nya. Ketelitian dalam menuliskan hasil menunjukkan Cinta Ilmu.`;
    } else {
      return `Presentasi dan umpan balik melatih komunikasi yang baik (${pancaLabels[1] || "Cinta Diri dan Sesama"}) dan saling menghargai. Penguatan dari guru menegaskan kembali pentingnya berilmu (Cinta Ilmu) dan berakhlak mulia (${pancaLabels[0] || "Cinta kepada Allah/Rasul-Nya"}).`;
    }
  }

  const inti: FaseInti[] = sintaksModel.map((s, i) => ({
    judul: `${s.no}. ${s.namaFase} (${s.namaSintaks})`,
    waktu: `? ${waktuFase} menit`,
    kegiatan: generateKegiatanFase(i),
    penguatanKbc: generatePenguatanKbc(i),
  }));

  // === PENUTUP ===
  const penutup: string[] = [
    `Peserta didik bersama guru menyimpulkan materi yang telah dipelajari tentang ${materi}.`,
  ];

  if (nomor === 1) {
    penutup.push(
      `Guru melakukan refleksi pembelajaran: "Apa hal baru yang kalian pelajari hari ini?", "Bagaimana perasaan kalian setelah berdiskusi dan menemukan solusi?"`,
      `Guru memberikan penguatan nilai-nilai karakter terkait pentingnya ${mapel} dan adab dalam belajar.`,
      `Guru memberikan apresiasi kepada seluruh peserta didik atas partisipasi aktif mereka.`,
      `Peserta didik menutup pelajaran dengan doa bersama (Cinta kepada Allah/Rasul-Nya).`,
    );
  } else if (nomor === 2) {
    penutup.push(
      `Guru memberikan tugas atau arahan untuk pertemuan selanjutnya terkait kelanjutan ${materi}.`,
      `Guru memberikan penguatan nilai karakter dan apresiasi atas keaktifan peserta didik.`,
      `Peserta didik menutup pelajaran dengan doa bersama (Cinta kepada Allah/Rasul-Nya).`,
    );
  } else {
    penutup.push(
      `Guru melakukan refleksi akhir: "Apa hal terpenting yang kalian pelajari selama rangkaian pembelajaran ini?", "Bagaimana kalian akan menerapkan ilmu ini dalam kehidupan sehari-hari?"`,
      `Guru memberikan penguatan nilai karakter, apresiasi, dan motivasi untuk terus belajar.`,
      `Guru memberikan apresiasi kepada seluruh peserta didik atas partisipasi aktif selama pertemuan.`,
      `Peserta didik menutup pelajaran dengan doa bersama (Cinta kepada Allah/Rasul-Nya).`,
    );
  }

  const alokasiStr = `${jpPerPertemuan} x ${menitPerJP} Menit`;

  return {
    nomor,
    alokasi: alokasiStr,
    pendahuluan,
    waktuPendahuluan: `? ${waktuPendahuluan} menit`,
    inti,
    waktuInti: `? ${waktuInti} menit`,
    penutup,
    waktuPenutup: `? ${waktuPenutup} menit`,
  };
}

function buildPengalamanBelajar(input: RppInput): PengalamanPerPertemuan[] {
  const totalJP = parseAlokasiWaktu(input.alokasiWaktu).totalJP;
  const menitPerJP = parseAlokasiWaktu(input.alokasiWaktu).menitPerJP;
  const jumlahPertemuan = parseJumlahPertemuan(input.jumlahPertemuan);
  const jpPerPertemuan = Math.floor(totalJP / jumlahPertemuan);

  const pancaList = input.pancaCinta.length > 0 ? input.pancaCinta : (["allah", "ilmu", "sesama"] as PancaCintaKey[]);
  const dimensiInput = lines(input.dimensiProfil);
  const dimensiList = dimensiInput.length > 0 ? dimensiInput : ["Kreativitas", "Kolaborasi", "Komunikasi"];

  const meetings: PengalamanPerPertemuan[] = [];
  for (let i = 1; i <= jumlahPertemuan; i++) {
    meetings.push(
      generatePertemuan(
        i,
        jpPerPertemuan,
        menitPerJP,
        pancaList,
        input.materiPokok,
        input.mapel,
        input.kelas,
        input.model,
        dimensiList,
      ),
    );
  }

  return meetings;
}

/* ============================================================
 * Asesmen
 * ========================================================== */

function buildAsesmen(input: RppInput): RppOutput["asesmen"] {
  return {
    diagnostik: [
      `Observasi awal saat apersepsi: Guru mengamati partisipasi dan pengetahuan awal peserta didik melalui pertanyaan lisan terkait pengalaman mereka tentang ${input.materiPokok}.`,
      `Tanya jawab singkat: "Apa yang kalian ketahui tentang ${input.materiPokok}?" atau "Pernahkah kalian mengalami situasi yang berkaitan dengan ${input.materiPokok}? Bagaimana cara kalian menyelesaikannya?"`,
    ],
    formatif: [
      `Observasi selama kegiatan diskusi kelompok (menggunakan rubrik penilaian diskusi): Mengamati partisipasi aktif, sikap santun, kemampuan menyampaikan dan menanggapi pendapat, serta kerja sama dalam kelompok.`,
      `Penilaian hasil kerja kelompok pada LKPD 1 dan LKPD 2.`,
    ],
    sumatif: [
      `Penilaian presentasi hasil diskusi kelompok (holistik).`,
      `Tes tertulis (pilihan ganda) untuk mengukur pemahaman peserta didik tentang konsep ${input.materiPokok}.`,
    ],
  };
}

/* ============================================================
 * Rubrik
 * ========================================================== */

function buildRubrik(input: RppInput): { holistik: RubrikItem[]; analitik: RubrikItem[] } {
  const holistik: RubrikItem[] = [
    {
      aspek: "Partisipasi Aktif dan Kolaborasi",
      level4: "4: Selalu aktif, memberikan ide orisinal, dan mendukung anggota kelompok lain.",
      level3: "3: Cukup aktif, memberikan beberapa ide, dan bekerja sama dengan baik.",
      level2: "2: Kurang aktif, hanya sesekali berpendapat, dan perlu dorongan.",
      level1: "1: Tidak aktif, cenderung diam, dan tidak berkontribusi.",
    },
    {
      aspek: "Sikap Saat Berdiskusi",
      level4: "4: Sangat santun, selalu menghargai pendapat teman, dan mendengarkan dengan seksama.",
      level3: "3: Santun, cukup menghargai pendapat teman, dan mendengarkan.",
      level2: "2: Kadang kurang santun atau kurang menghargai pendapat teman.",
      level1: "1: Sering memotong pembicaraan atau tidak menghargai pendapat teman.",
    },
    {
      aspek: "Kualitas Ide/Pendapat",
      level4: "4: Menyampaikan ide yang logis, relevan, dan memberikan solusi yang efektif.",
      level3: "3: Menyampaikan ide yang cukup logis dan relevan.",
      level2: "2: Ide kurang logis atau kurang relevan dengan masalah.",
      level1: "1: Ide tidak logis atau tidak sesuai dengan masalah.",
    },
    {
      aspek: "Mencapai Kesepakatan",
      level4: "4: Kelompok berhasil mencapai kesepakatan yang jelas dan dapat diterima semua anggota.",
      level3: "3: Kelompok mencapai kesepakatan tetapi masih ada sedikit perbedaan pendapat.",
      level2: "2: Kelompok kesulitan mencapai kesepakatan yang solid.",
      level1: "1: Kelompok tidak dapat mencapai kesepakatan.",
    },
  ];

  const kategori = getMapelKategori(input.mapel);
  let analitik: RubrikItem[];
  switch (kategori) {
    case "bahasa":
      analitik = [
        { aspek: "Penempatan Tanda Kutip", level4: "4: Semua tanda kutip ditempatkan dengan tepat di awal dan akhir kalimat langsung.", level3: "3: Sebagian besar tanda kutip ditempatkan dengan tepat.", level2: "2: Ada beberapa kesalahan penempatan tanda kutip.", level1: "1: Banyak kesalahan dalam penempatan tanda kutip." },
        { aspek: "Penulisan Kalimat Langsung", level4: "4: Kalimat langsung ditulis dengan benar (huruf kapital di awal, tanda baca di dalam kutipan, dsb).", level3: "3: Sebagian besar kalimat langsung ditulis dengan benar, ada sedikit kesalahan kecil.", level2: "2: Ada beberapa kesalahan penulisan dalam kalimat langsung (kapitalisasi, tanda baca lain).", level1: "1: Banyak kesalahan dalam penulisan kalimat langsung." },
        { aspek: "Kesesuaian Kalimat", level4: "4: Kalimat langsung yang ditulis sangat sesuai dengan konteks diskusi/percakapan.", level3: "3: Kalimat langsung yang ditulis cukup sesuai dengan konteks.", level2: "2: Kalimat langsung yang ditulis kurang sesuai atau kurang jelas.", level1: "1: Kalimat langsung yang ditulis tidak sesuai atau tidak relevan." },
      ];
      break;
    case "ipa":
      analitik = [
        { aspek: "Ketepatan Eksperimen", level4: "4: Prosedur dijalankan tepat dan aman.", level3: "3: Prosedur dijalankan dengan baik.", level2: "2: Prosedur cukup tepat.", level1: "1: Prosedur banyak menyimpang." },
        { aspek: "Analisis Hasil", level4: "4: Analisis tajam, didukung data lengkap.", level3: "3: Analisis baik dan didukung data.", level2: "2: Analisis cukup.", level1: "1: Analisis kurang mendalam." },
        { aspek: "Kesimpulan", level4: "4: Kesimpulan tepat, ringkas, dan menjawab tujuan.", level3: "3: Kesimpulan tepat.", level2: "2: Kesimpulan cukup tepat.", level1: "1: Kesimpulan kurang tepat." },
      ];
      break;
    case "matematika":
      analitik = [
        { aspek: "Pemahaman Konsep", level4: "4: Konsep dipahami secara utuh.", level3: "3: Konsep dipahami baik.", level2: "2: Konsep cukup dipahami.", level1: "1: Konsep kurang dipahami." },
        { aspek: "Strategi Pemecahan Masalah", level4: "4: Strategi tepat dan efisien.", level3: "3: Strategi tepat.", level2: "2: Strategi cukup tepat.", level1: "1: Strategi kurang tepat." },
        { aspek: "Ketepatan Perhitungan", level4: "4: Perhitungan benar seluruhnya.", level3: "3: Sebagian besar benar.", level2: "2: Cukup benar.", level1: "1: Banyak kesalahan." },
      ];
      break;
    case "agama":
      analitik = [
        { aspek: "Penguasaan Dalil/Ayat", level4: "4: Menyebutkan dalil tepat dan menjelaskan kandungannya.", level3: "3: Menyebutkan dalil dengan tepat.", level2: "2: Menyebutkan dalil cukup tepat.", level1: "1: Kurang tepat menyebutkan dalil." },
        { aspek: "Penerapan Nilai", level4: "4: Menunjukkan penerapan nilai dalam kehidupan.", level3: "3: Menunjukkan upaya penerapan nilai.", level2: "2: Cukup menunjukkan penerapan.", level1: "1: Belum menunjukkan penerapan." },
        { aspek: "Akhlak dan Adab", level4: "4: Menunjukkan akhlak mulia secara konsisten.", level3: "3: Menunjukkan akhlak baik.", level2: "2: Akhlak cukup baik.", level1: "1: Perlu pembinaan akhlak." },
      ];
      break;
    case "ips":
      analitik = [
        { aspek: "Kedalaman Analisis Sosial", level4: "4: Analisis kontekstual dan mendalam.", level3: "3: Analisis baik.", level2: "2: Analisis cukup.", level1: "1: Analisis dangkal." },
        { aspek: "Penggunaan Data/Fakta", level4: "4: Data lengkap dan kredibel.", level3: "3: Data cukup lengkap.", level2: "2: Data sebagian.", level1: "1: Data minim." },
        { aspek: "Argumentasi", level4: "4: Argumen logis dan didukung bukti.", level3: "3: Argumen logis.", level2: "2: Argumen cukup.", level1: "1: Argumen kurang logis." },
      ];
      break;
    default:
      analitik = [
        { aspek: "Penguasaan Materi", level4: "4: Menguasai materi secara komprehensif.", level3: "3: Menguasai materi dengan baik.", level2: "2: Cukup menguasai materi.", level1: "1: Kurang menguasai materi." },
        { aspek: "Keterampilan Komunikasi", level4: "4: Menyampaikan dengan jelas dan runtut.", level3: "3: Menyampaikan dengan baik.", level2: "2: Cukup jelas.", level1: "1: Kurang jelas." },
        { aspek: "Kreativitas", level4: "4: Ide kreatif dan orisinal.", level3: "3: Ide kreatif.", level2: "2: Ide cukup kreatif.", level1: "1: Ide kurang kreatif." },
      ];
  }
  return { holistik, analitik };
}

function rubrik(aspek: string, l4: string, l3: string, l2: string, l1: string): RubrikItem {
  return {
    aspek,
    level4: `4: ${l4}.`,
    level3: `3: ${l3}.`,
    level2: `2: ${l2}.`,
    level1: `1: ${l1}.`,
  };
}

/* ============================================================
 * LKPD
 * ========================================================== */

function buildLkpd(input: RppInput): LkpdActivity[] {
  return [
    {
      judul: `LKPD 1: ${input.materiPokok}`,
      tipe: "Kelompok",
      tujuan: `Peserta didik mampu memahami dan menerapkan konsep ${input.materiPokok} secara berkelompok.`,
      petunjuk: [
        `Diskusikan bersama teman kelompokmu tentang ${input.materiPokok}.`,
        `Tuliskan ide-ide atau saran dari setiap anggota kelompok di kolom "Ide/Saran".`,
        `Pilih 3 ide terbaik yang kalian sepakati sebagai solusi.`,
        `Tuliskan 3 kesepakatan kelompokmu di kolom "Kesepakatan Kelompok".`,
      ],
      aktivitas: [
        `Carilah informasi tentang ${input.materiPokok} dari buku siswa, internet, atau sumber lain.`,
        `Identifikasi minimal 3 hal penting dari ${input.materiPokok}.`,
        `Diskusikan keterkaitan materi dengan nilai Panca Cinta.`,
        `Susunlah ringkasan hasil diskusi dalam bentuk peta konsep.`,
      ],
      tabelKolom: ["No", "Ide/Saran Anggota Kelompok", "Alasan / Manfaat Ide"],
      refleksi: [
        "Apa yang paling menarik dari kegiatan ini?",
        "Hal baru apa yang kalian pelajari hari ini?",
        "Bagaimana kalian menerapkan nilai Panca Cinta dalam diskusi?",
      ],
    },
    {
      judul: `LKPD 2: ${input.materiPokok}`,
      tipe: "Individu",
      tujuan: `Peserta didik mampu menerapkan konsep ${input.materiPokok} secara mandiri melalui latihan.`,
      petunjuk: [
        `Dari hasil diskusi kelompokmu di LKPD 1, tuliskan pemahamanmu tentang ${input.materiPokok}.`,
        `Perhatikan dengan seksama setiap instruksi yang diberikan.`,
        `Tuliskan jawaban pada kolom yang tersedia.`,
      ],
      aktivitas: [
        `Tulislah pemahamanmu tentang ${input.materiPokok} dengan bahasa sendiri.`,
        `Berikan 2 contoh penerapan ${input.materiPokok} dalam kehidupan sehari-hari.`,
        `Tulislah refleksi singkat tentang nilai Panca Cinta yang kamu pelajari hari ini.`,
      ],
      tabelKolom: ["No", "Pertanyaan", "Jawaban Peserta Didik", "Skor"],
      refleksi: [
        "Apa kesulitan yang kamu temui?",
        "Bagian mana yang paling kamu pahami?",
        "Apa rencana belajarmu selanjutnya?",
      ],
    },
  ];
}

/* ============================================================
 * Kisi-kisi & Soal
 * ========================================================== */

function buildKisiKisiAndSoal(input: RppInput): { kisiKisi: KisiKisiItem[]; soal: SoalItem[] } {
  const jumlah = Math.max(5, Math.min(20, input.jumlahSoal || 10));
  const ruhPool = input.pancaCinta.length
    ? input.pancaCinta.map((k) => PANCA_CINTA.find((p) => p.key === k)!.label)
    : ["Cinta Ilmu", "Cinta Sesama", "Cinta kepada Allah/Rasul-Nya"];
  const levels = ["C1 - Mengingat", "C2 - Memahami", "C3 - Menerapkan", "C4 - Menganalisis", "C5 - Mengevaluasi", "C6 - Mencipta"];

  const kisiKisi: KisiKisiItem[] = [];
  const soal: SoalItem[] = [];
  for (let i = 0; i < jumlah; i++) {
    const indik = `Peserta didik mampu ${["menjelaskan", "mengidentifikasi", "menganalisis", "menerapkan", "menyimpulkan", "mengevaluasi"][i % 6]} aspek ${i + 1} dari ${input.materiPokok}.`;
    const lvl = levels[Math.min(levels.length - 1, Math.floor(i / 2))];
    const ruh = ruhPool[i % ruhPool.length];
    kisiKisi.push({
      no: i + 1,
      indikator: indik,
      materi: `${input.materiPokok} — sub-topik ${i + 1}`,
      ruhKbc: ruh,
      level: lvl,
    });

    soal.push(buildSoal(i + 1, input, lvl, ruh));
  }
  return { kisiKisi, soal };
}

function buildSoal(no: number, input: RppInput, level: string, ruh: string): SoalItem {
  const verbs = ["dimaksud dengan", "ciri utama dari", "manfaat mempelajari", "bentuk penerapan", "kesimpulan tepat tentang"];
  const verb = verbs[no % verbs.length];
  const pertanyaan = `Berdasarkan pembelajaran ${input.materiPokok}, apakah yang ${verb} aspek ke-${no}? (${level})`;
  const jawaban = ["A", "B", "C", "D"][no % 4] as "A" | "B" | "C" | "D";
  const benar = `Pernyataan yang menggambarkan ${input.materiPokok} secara tepat sesuai dengan konsep yang telah dipelajari.`;
  const pengecoh1 = `Pernyataan yang sebagian benar tetapi kurang lengkap mengenai ${input.materiPokok}.`;
  const pengecoh2 = `Pernyataan yang tidak relevan dengan konsep ${input.materiPokok}.`;
  const pengecoh3 = `Pernyataan yang menyesatkan dan bertentangan dengan ${input.materiPokok}.`;
  const map: Record<"A" | "B" | "C" | "D", string> = { A: pengecoh1, B: pengecoh2, C: pengecoh3, D: pengecoh3 };
  map[jawaban] = benar;
  return {
    no,
    pertanyaan,
    pilihan: { A: map.A, B: map.B, C: map.C, D: map.D },
    kunci: jawaban,
    pembahasan: `Jawaban yang tepat adalah pilihan ${jawaban} karena selaras dengan konsep ${input.materiPokok} dan mencerminkan nilai ${ruh} sebagai bagian dari Panca Cinta.`,
  };
}

/* ============================================================
 * MAIN
 * ========================================================== */

export function generateRpp(input: RppInput): RppOutput {
  const identifikasiKbc = buildIdentifikasi(input);
  const desain = buildDesain(input);
  const pengalamanBelajar = buildPengalamanBelajar(input);
  const asesmen = buildAsesmen(input);
  const { holistik, analitik } = buildRubrik(input);
  const lkpd = buildLkpd(input);
  const { kisiKisi, soal } = buildKisiKisiAndSoal(input);

  return {
    identitas: {
      namaSekolah: input.namaSekolah,
      mapel: input.mapel,
      kelas: input.kelas,
      semester: input.semester,
      fase: input.fase,
      tahunPelajaran: input.tahunPelajaran,
      materiPokok: input.materiPokok,
      alokasiWaktu: input.alokasiWaktu,
      jumlahPertemuan: input.jumlahPertemuan,
      model: input.model,
      namaGuru: input.namaGuru,
      nipGuru: input.nipGuru,
      namaKepsek: input.namaKepsek,
      nipKepsek: input.nipKepsek,
    },
    identifikasiKbc,
    desain,
    pengalamanBelajar,
    asesmen,
    lampiran: {
      rubrikHolistik: holistik,
      rubrikAnalitik: analitik,
      lkpd,
      kisiKisi,
      soal,
    },
  };
}
