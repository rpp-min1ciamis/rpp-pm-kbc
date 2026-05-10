import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  TableLayoutType,
} from "docx";
import type { RppOutput, PengalamanPerPertemuan, FaseInti } from "./rpp-types";

/* ============================================================
 * Build a real .docx from RppOutput
 * ========================================================== */

const BORDER = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "333333" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "333333" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "333333" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "333333" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
} as const;

function h1(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 32, font: "Times New Roman" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
  });
}

function h2(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, font: "Times New Roman" })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000", space: 4 } },
  });
}

function h3(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, font: "Times New Roman" })],
    spacing: { before: 160, after: 80 },
  });
}

function para(text: string, opts?: { bold?: boolean; indent?: number }): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: opts?.bold, size: 22, font: "Times New Roman" })],
    spacing: { after: 60 },
    indent: opts?.indent ? { left: opts.indent } : undefined,
  });
}

function boldPara(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22, font: "Times New Roman" }),
      new TextRun({ text: value, size: 22, font: "Times New Roman" }),
    ],
    spacing: { after: 60 },
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Times New Roman" })],
    bullet: { level: 0 },
    spacing: { after: 40 },
  });
}

function numbered(text: string, num: number): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `${num}. ${text}`, size: 22, font: "Times New Roman" })],
    spacing: { after: 40 },
    indent: { left: 360 },
  });
}

function simpleTable(data: string[][]): Table {
  const rows = data.map(
    (rowData, ri) =>
      new TableRow({
        children: rowData.map(
          (cell) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: cell, bold: ri === 0, size: ri === 0 ? 20 : 22, font: "Times New Roman" })],
                }),
              ],
              width: { size: Math.floor(100 / rowData.length), type: WidthType.PERCENTAGE },
            }),
        ),
        tableHeader: ri === 0,
      }),
  );

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: BORDER,
  });
}

/* ============================================================
 * Main export function
 * ========================================================== */

export async function buildDocx(out: RppOutput): Promise<Buffer> {
  const id = out.identitas;
  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const children: (Paragraph | Table)[] = [];

  // ===== TITLE =====
  children.push(h1("PERENCANAAN PEMBELAJARAN KBC"));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Materi: ${id.materiPokok}`, bold: true, size: 26, font: "Times New Roman" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  );

  // ===== A. IDENTITAS MODUL =====
  children.push(h2("A. IDENTITAS MODUL"));
  children.push(
    simpleTable([
      ["Madrasah", id.namaSekolah],
      ["Guru", id.namaGuru],
      ["Mata Pelajaran", id.mapel],
      ["Kelas / Semester", `${id.kelas} / ${id.semester}`],
      ["Materi Pokok", id.materiPokok],
      ["Alokasi Waktu", id.alokasiWaktu],
      ["Tahun Pelajaran", id.tahunPelajaran],
      ["Model Pembelajaran", id.model],
    ]),
  );

  // ===== B. IDENTIFIKASI & KBC =====
  children.push(h2("B. IDENTIFIKASI & KBC"));
  children.push(boldPara("1. Kesiapan Murid", out.identifikasiKbc.kesiapanMurid.join(" ")));
  children.push(boldPara("2. Dimensi Profil Lulusan", out.identifikasiKbc.dimensiProfil.join(", ")));
  children.push(boldPara("3. Topik KBC (Panca Cinta)", out.identifikasiKbc.topikKbc.map((t) => t.panca).join(", ")));
  children.push(para("4. Materi Insersi KBC:", { bold: true }));
  for (const t of out.identifikasiKbc.topikKbc) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${t.panca}: `, bold: true, size: 22, font: "Times New Roman" }),
          new TextRun({ text: t.insersi, size: 22, font: "Times New Roman" }),
        ],
        spacing: { after: 60 },
        indent: { left: 360 },
      }),
    );
  }

  // ===== C. DESAIN PEMBELAJARAN =====
  children.push(h2("C. DESAIN PEMBELAJARAN"));
  children.push(boldPara("1. Capaian Pembelajaran (CP)", out.desain.capaianPembelajaran));
  children.push(para("2. Lintas Disiplin Ilmu:", { bold: true }));
  out.desain.lintasDisiplin.forEach((d) => children.push(bullet(d)));
  children.push(boldPara("3. Tujuan Pembelajaran", out.desain.tujuanPembelajaran.join(" ")));
  children.push(boldPara("4. Praktik Pedagogis", out.desain.praktikPedagogis.join(" ")));
  children.push(boldPara("5. Kemitraan Pembelajaran", out.desain.kemitraan.join(" ")));
  children.push(boldPara("6. Lingkungan Pembelajaran", out.desain.lingkungan.join(" ")));
  children.push(boldPara("7. Pemanfaatan Digital", out.desain.pemanfaatanDigital.join(" ")));

  // ===== D. PENGALAMAN BELAJAR =====
  children.push(h2("D. PENGALAMAN BELAJAR (Deep Learning)"));
  for (const pertemuan of out.pengalamanBelajar) {
    children.push(h3(`Pertemuan ${pertemuan.nomor} (${pertemuan.alokasi})`));
    renderPertemuanDocx(pertemuan, children);
  }

  // ===== E. ASESMEN =====
  children.push(h2("E. ASESMEN"));
  children.push(para("1. Asesmen Awal (Diagnostik):", { bold: true }));
  out.asesmen.diagnostik.forEach((a) => children.push(bullet(a)));
  children.push(para("2. Asesmen Proses (Formatif):", { bold: true }));
  out.asesmen.formatif.forEach((a) => children.push(bullet(a)));
  children.push(para("3. Asesmen Akhir (Sumatif):", { bold: true }));
  out.asesmen.sumatif.forEach((a) => children.push(bullet(a)));

  // ===== TANDA TANGAN =====
  children.push(
    new Paragraph({ text: "", spacing: { before: 400 } }),
  );
  children.push(
    simpleTable([
      [
        `Mengetahui,\nKepala ${id.namaSekolah}\n\n\n\n${id.namaKepsek || "....................."}\nNIP. ${id.nipKepsek || "....................."}`,
        `${today}\nGuru ${id.mapel}\n\n\n\n${id.namaGuru || "....................."}\nNIP. ${id.nipGuru || "....................."}`,
      ],
    ]),
  );

  // ===== LAMPIRAN =====
  children.push(h2("LAMPIRAN"));

  // 1. Rubrik Holistik
  children.push(h3("1. Rubrik Penilaian Diskusi Kelompok (Holistik)"));
  children.push(
    simpleTable([
      ["No.", "Aspek Penilaian", "Indikator Penilaian"],
      ...out.lampiran.rubrikHolistik.map((r, i) => [
        String(i + 1),
        r.aspek,
        `${r.level4}\n${r.level3}\n${r.level2}\n${r.level1}`,
      ]),
    ]),
  );

  // 2. Rubrik Analitik
  children.push(h3("2. Rubrik Penilaian (Analitik)"));
  children.push(
    simpleTable([
      ["No.", "Aspek Penilaian", "Indikator Penilaian"],
      ...out.lampiran.rubrikAnalitik.map((r, i) => [
        String(i + 1),
        r.aspek,
        `${r.level4}\n${r.level3}\n${r.level2}\n${r.level1}`,
      ]),
    ]),
  );

  // 3. LKPD
  children.push(h3("3. Lembar Kerja Peserta Didik (LKPD)"));
  for (const l of out.lampiran.lkpd) {
    children.push(para(l.judul, { bold: true }));
    children.push(boldPara("Tujuan", l.tujuan));
    children.push(para("Petunjuk:", { bold: true }));
    l.petunjuk.forEach((p, i) => children.push(numbered(p, i + 1)));
    children.push(para("Refleksi:", { bold: true }));
    l.refleksi.forEach((r) => children.push(bullet(r)));
  }

  // 4. Kisi-kisi Soal
  children.push(h3("4. Kisi-kisi Soal"));
  children.push(
    simpleTable([
      ["No.", "Indikator", "Materi/Konsep", "Ruh KBC"],
      ...out.lampiran.kisiKisi.map((k) => [String(k.no), k.indikator, k.materi, k.ruhKbc]),
    ]),
  );

  // 5. Soal Pilihan Ganda
  children.push(h3("5. Soal Pilihan Ganda"));
  children.push(para("Pilihlah jawaban A, B, C, atau D yang paling tepat!"));
  for (const s of out.lampiran.soal) {
    children.push(para(`${s.no}. ${s.pertanyaan}`, { bold: true }));
    children.push(para(`   A. ${s.pilihan.A}`, { indent: 360 }));
    children.push(para(`   B. ${s.pilihan.B}`, { indent: 360 }));
    children.push(para(`   C. ${s.pilihan.C}`, { indent: 360 }));
    children.push(para(`   D. ${s.pilihan.D}`, { indent: 360 }));
  }

  // 6. Kunci Jawaban
  children.push(h3("6. Kunci Jawaban"));
  children.push(
    simpleTable([
      ["No", "Kunci", "Pembahasan"],
      ...out.lampiran.soal.map((s) => [String(s.no), s.kunci, s.pembahasan]),
    ]),
  );

  // ===== BUILD =====
  const doc = new Document({
    sections: [{ properties: { page: { margin: { top: 1440, bottom: 1440, left: 1134, right: 1134 } } }, children }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

/* ============================================================
 * Pengalaman Belajar per pertemuan → DOCX paragraphs
 * ========================================================== */

function renderPertemuanDocx(p: PengalamanPerPertemuan, out: (Paragraph | Table)[]) {
  // Table: Tahap | Waktu | Kegiatan
  const rows: TableRow[] = [];

  // Header row
  rows.push(
    new TableRow({
      children: ["Tahap Pembelajaran", "Alokasi Waktu", "Kegiatan Pembelajaran"].map(
        (h) =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, font: "Times New Roman" })], alignment: AlignmentType.CENTER })],
            width: h === "Kegiatan Pembelajaran" ? { size: 60, type: WidthType.PERCENTAGE } : { size: 20, type: WidthType.PERCENTAGE },
          }),
      ),
      tableHeader: true,
    }),
  );

  // Pendahuluan
  const pendahuluanParas: Paragraph[] = p.pendahuluan.map(
    (k, i) =>
      new Paragraph({
        children: [new TextRun({ text: `${i + 1}. ${k}`, size: 20, font: "Times New Roman" })],
        spacing: { after: 40 },
      }),
  );
  pendahuluanParas.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Penguatan Nilai KBC (Panca Cinta): ", bold: true, size: 20, font: "Times New Roman", color: "065F46" }),
        new TextRun({ text: "Doa bersama menumbuhkan Cinta kepada Allah/Rasul-Nya. Apersepsi dan motivasi menguatkan Cinta Ilmu.", size: 20, font: "Times New Roman", color: "065F46" }),
      ],
      spacing: { before: 80, after: 40 },
    }),
  );
  rows.push(
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "PENDAHULUAN", bold: true, size: 20, font: "Times New Roman" })], alignment: AlignmentType.CENTER })], verticalAlign: "center" as any }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: p.waktuPendahuluan, size: 20, font: "Times New Roman" })], alignment: AlignmentType.CENTER })], verticalAlign: "center" as any }),
        new TableCell({ children: pendahuluanParas }),
      ],
    }),
  );

  // Inti
  const intiParas: Paragraph[] = [];
  for (const f of p.inti) {
    intiParas.push(
      new Paragraph({
        children: [new TextRun({ text: `${f.judul} (${f.waktu})`, bold: true, size: 22, font: "Times New Roman" })],
        spacing: { before: 80, after: 60 },
      }),
    );
    f.kegiatan.forEach((k, i) => {
      intiParas.push(
        new Paragraph({
          children: [new TextRun({ text: `${i + 1}. ${k}`, size: 20, font: "Times New Roman" })],
          spacing: { after: 40 },
        }),
      );
    });
    intiParas.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Penguatan Nilai KBC (Panca Cinta): ", bold: true, size: 20, font: "Times New Roman", color: "065F46" }),
          new TextRun({ text: f.penguatanKbc, size: 20, font: "Times New Roman", color: "065F46" }),
        ],
        spacing: { before: 60, after: 60 },
      }),
    );
  }
  rows.push(
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "INTI", bold: true, size: 20, font: "Times New Roman" })], alignment: AlignmentType.CENTER })], verticalAlign: "center" as any }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: p.waktuInti, size: 20, font: "Times New Roman" })], alignment: AlignmentType.CENTER })], verticalAlign: "center" as any }),
        new TableCell({ children: intiParas }),
      ],
    }),
  );

  // Penutup
  const penutupParas: Paragraph[] = p.penutup.map(
    (k, i) =>
      new Paragraph({
        children: [new TextRun({ text: `${i + 1}. ${k}`, size: 20, font: "Times New Roman" })],
        spacing: { after: 40 },
      }),
  );
  penutupParas.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Penguatan Nilai KBC (Panca Cinta): ", bold: true, size: 20, font: "Times New Roman", color: "065F46" }),
        new TextRun({ text: "Kesimpulan dan refleksi menguatkan Cinta Ilmu. Doa penutup menunjukkan rasa syukur (Cinta kepada Allah/Rasul-Nya).", size: 20, font: "Times New Roman", color: "065F46" }),
      ],
      spacing: { before: 80, after: 40 },
    }),
  );
  rows.push(
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "PENUTUP", bold: true, size: 20, font: "Times New Roman" })], alignment: AlignmentType.CENTER })], verticalAlign: "center" as any }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: p.waktuPenutup, size: 20, font: "Times New Roman" })], alignment: AlignmentType.CENTER })], verticalAlign: "center" as any }),
        new TableCell({ children: penutupParas }),
      ],
    }),
  );

  out.push(
    new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      borders: BORDER,
    }),
  );
}
