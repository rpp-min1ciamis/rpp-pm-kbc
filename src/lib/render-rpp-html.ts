import type { RppOutput, PengalamanPerPertemuan } from "./rpp-types";

function esc(s: string): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}

function ul(items: string[]): string {
  return `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

function numberedList(items: string[]): string {
  return `<ol style="list-style: decimal; margin: 4px 0 8px 20px; padding-left: 0;">${items
    .map((i) => `<li style="margin-bottom: 4px; text-align: justify;">${esc(i)}</li>`)
    .join("")}</ol>`;
}

export function renderRppHtml(out: RppOutput): string {
  const id = out.identitas;
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // === A. IDENTITAS MODUL ===
  const identitasTable = `
    <table>
      <tbody>
        ${row("Madrasah", id.namaSekolah)}
        ${row("Guru", id.namaGuru)}
        ${row("Mata Pelajaran", id.mapel)}
        ${row("Kelas / Semester", `${id.kelas} / ${id.semester} (${id.semester === "Ganjil" ? "Ganjil" : "Genap"})`)}
        ${row("Materi Pokok", id.materiPokok)}
        ${row("Alokasi Waktu", id.alokasiWaktu)}
        ${row("Tahun Pelajaran", id.tahunPelajaran)}
        ${row("Model Pembelajaran", id.model)}
      </tbody>
    </table>`;

  // === B. IDENTIFIKASI & KBC ===
  const kbcTable = `
    <table>
      <thead><tr><th style="width:32%">Panca Cinta</th><th>Materi Insersi</th></tr></thead>
      <tbody>
        ${out.identifikasiKbc.topikKbc
          .map((t) => `<tr><td><b>${esc(t.panca)}</b></td><td>${esc(t.insersi)}</td></tr>`)
          .join("")}
      </tbody>
    </table>`;

  // === C. DESAIN PEMBELAJARAN ===

  // === D. PENGALAMAN BELAJAR ===
  const pengalamanBelajarHtml = out.pengalamanBelajar.map(renderPertemuan).join("");

  // === E. ASESMEN ===
  const asesmenHtml = `
    <h3>1. Asesmen Awal (Diagnostik)</h3>
    ${ul(out.asesmen.diagnostik)}
    <h3>2. Asesmen Proses (Formatif)</h3>
    ${ul(out.asesmen.formatif)}
    <h3>3. Asesmen Akhir (Sumatif)</h3>
    ${ul(out.asesmen.sumatif)}`;

  // === LAMPIRAN ===
  const rubrikH = `
    <table>
      <thead><tr><th>No.</th><th>Aspek Penilaian</th><th>Indikator Penilaian (Skor 4 = Sangat Baik, 3 = Baik, 2 = Cukup, 1 = Kurang)</th></tr></thead>
      <tbody>${out.lampiran.rubrikHolistik
        .map(
          (r, i) =>
            `<tr><td>${i + 1}</td><td><b>${esc(r.aspek)}</b></td><td>${esc(r.level4)}<br/>${esc(r.level3)}<br/>${esc(r.level2)}<br/>${esc(r.level1)}</td></tr>`,
        )
        .join("")}</tbody>
    </table>`;

  const rubrikA = `
    <table>
      <thead><tr><th>No.</th><th>Aspek Penilaian</th><th>Indikator Penilaian (Skor 4 = Sangat Baik, 3 = Baik, 2 = Cukup, 1 = Kurang)</th></tr></thead>
      <tbody>${out.lampiran.rubrikAnalitik
        .map(
          (r, i) =>
            `<tr><td>${i + 1}</td><td><b>${esc(r.aspek)}</b></td><td>${esc(r.level4)}<br/>${esc(r.level3)}<br/>${esc(r.level2)}<br/>${esc(r.level1)}</td></tr>`,
        )
        .join("")}</tbody>
    </table>`;

  const lkpdHtml = out.lampiran.lkpd
    .map(
      (l) =>
        `<p><b>${esc(l.judul)}</b></p>
      <p><b>Nama Kelompok:</b> ...................................................................</p>
      <p><b>Kelas:</b> ${esc(id.kelas)}</p>
      <p><b>Tujuan:</b> ${esc(l.tujuan)}</p>
      <p><b>Petunjuk:</b></p><ol>${l.petunjuk.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>
      <table><thead><tr>${l.tabelKolom.map((k) => `<th>${esc(k)}</th>`).join("")}</tr></thead>
      <tbody>${[1, 2, 3, 4, 5]
        .map((i) => `<tr><td>${i}</td>${l.tabelKolom.map((_, j) => (j > 0 ? `<td>&nbsp;</td>` : "")).join("")}</tr>`)
        .join("")}</tbody></table>
      <p><b>Refleksi Peserta Didik:</b></p><ol>${l.refleksi.map((r) => `<li>${esc(r)}</li>`).join("")}</ol>`,
    )
    .join("");

  const kisiKisi = `
    <table>
      <thead><tr><th>No.<br/>Soal</th><th>Indikator Pencapaian<br/>Tujuan Pembelajaran</th><th>Materi / Konsep</th><th>Ruh KBC</th></tr></thead>
      <tbody>${out.lampiran.kisiKisi
        .map(
          (k) =>
            `<tr><td style="text-align:center">${k.no}</td><td>${esc(k.indikator)}</td><td>${esc(k.materi)}</td><td>${esc(k.ruhKbc)}</td></tr>`,
        )
        .join("")}</tbody>
    </table>`;

  const soalHtml = out.lampiran.soal
    .map(
      (s) =>
        `<p><b>${s.no}.</b> ${esc(s.pertanyaan)}</p>
      <ol type="A" style="list-style: upper-alpha; margin: 2px 0 8px 32px;">
        <li>${esc(s.pilihan.A)}</li>
        <li>${esc(s.pilihan.B)}</li>
        <li>${esc(s.pilihan.C)}</li>
        <li>${esc(s.pilihan.D)}</li>
      </ol>`,
    )
    .join("");

  const kunciHtml = `
    <table>
      <thead><tr><th>No</th><th>Kunci</th><th>Pembahasan</th></tr></thead>
      <tbody>${out.lampiran.soal
        .map(
          (s) =>
            `<tr><td style="text-align:center">${s.no}</td><td style="text-align:center"><b>${esc(s.kunci)}</b></td><td>${esc(s.pembahasan)}</td></tr>`,
        )
        .join("")}</tbody>
    </table>`;

  // Tanda tangan hanya ditampilkan 1 kali (sebelum LAMPIRAN) via inline di bawah

  return `
    <h1>PERENCANAAN PEMBELAJARAN KBC</h1>
    <p class="center" style="font-size: 13pt; font-weight: bold;">Materi: ${esc(id.materiPokok)}</p>

    <h2>A. IDENTITAS MODUL</h2>
    ${identitasTable}

    <h2>B. IDENTIFIKASI &amp; KBC</h2>
    <ol>
      <li><b>Kesiapan Murid:</b> ${esc(out.identifikasiKbc.kesiapanMurid.join(" "))}</li>
      <li><b>Dimensi Profil Lulusan:</b> ${esc(out.identifikasiKbc.dimensiProfil.join(", "))}</li>
      <li><b>Topik KBC (Panca Cinta):</b> ${esc(out.identifikasiKbc.topikKbc.map((t) => t.panca).join(", "))}</li>
      <li><b>Materi Insersi KBC:</b>
        <ul>
          ${out.identifikasiKbc.topikKbc.map((t) => `<li><b>${esc(t.panca)}:</b> ${esc(t.insersi)}</li>`).join("")}
        </ul>
      </li>
    </ol>

    <h2>C. DESAIN PEMBELAJARAN</h2>
    <ol>
      <li><b>Capaian Pembelajaran (CP):</b> ${esc(out.desain.capaianPembelajaran)}</li>
      <li><b>Lintas Disiplin Ilmu:</b>
        <ul>
          ${out.desain.lintasDisiplin.map((d) => `<li><b>${esc(d.split(":")[0])}:</b> ${esc(d.split(":").slice(1).join(":"))}</li>`).join("")}
        </ul>
      </li>
      <li><b>Tujuan Pembelajaran:</b> ${esc(out.desain.tujuanPembelajaran.join(" "))}</li>
      <li><b>Praktik Pedagogis:</b> ${esc(out.desain.praktikPedagogis.join(" "))}</li>
      <li><b>Kemitraan Pembelajaran:</b> ${esc(out.desain.kemitraan.join(" "))}</li>
      <li><b>Lingkungan Pembelajaran:</b> ${esc(out.desain.lingkungan.join(" "))}</li>
      <li><b>Pemanfaatan Digital:</b> ${esc(out.desain.pemanfaatanDigital.join(" "))}</li>
    </ol>

    <h2>D. PENGALAMAN BELAJAR (Deep Learning)</h2>
    ${pengalamanBelajarHtml}

    <h2>E. ASESMEN</h2>
    ${asesmenHtml}

    <div class="sig">
      <table style="border: 0;">
        <tr>
          <td style="width:50%; border: 0;">
            Mengetahui,<br/>
            Kepala ${esc(id.namaSekolah)}<br/><br/><br/><br/>
            <b>${esc(id.namaKepsek || "....................")}</b><br/>
            NIP. ${esc(id.nipKepsek || "....................")}
          </td>
          <td style="width:50%; border: 0; text-align: right;">
            ${esc(today)}<br/>
            Guru ${esc(id.mapel)}<br/><br/><br/><br/>
            <b>${esc(id.namaGuru || "....................")}</b><br/>
            NIP. ${esc(id.nipGuru || "....................")}
          </td>
        </tr>
      </table>
    </div>

    <h2>LAMPIRAN</h2>
    <h3>1. Rubrik Penilaian</h3>
    <h4>a. Rubrik Penilaian Diskusi Kelompok (Holistik)</h4>
    ${rubrikH}
    <h4>b. Rubrik Penilaian (Analitik)</h4>
    ${rubrikA}

    <h3>2. Lembar Kerja Peserta Didik (LKPD)</h3>
    ${lkpdHtml}

    <h3>3. Instrumen Asesmen (Tes Tertulis Pilihan Ganda)</h3>
    <h4>Kisi-kisi Soal</h4>
    ${kisiKisi}
    <h4>Soal Pilihan Ganda</h4>
    <p><i>Pilihlah jawaban A, B, C, atau D yang paling tepat!</i></p>
    ${soalHtml}
    <h4>Kunci Jawaban</h4>
    ${kunciHtml}
  `;
}

function row(label: string, value: string): string {
  return `<tr><td style="width:32%"><b>${esc(label)}</b></td><td>${esc(value)}</td></tr>`;
}

/**
 * Render satu pertemuan dalam format tabel 3 kolom
 */
function renderPertemuan(pertemuan: PengalamanPerPertemuan): string {
  const pendahuluanRows = pertemuan.pendahuluan.map((k) => `<li>${esc(k)}</li>`).join("");

  const intiHtml = pertemuan.inti
    .map((f) => {
      const kegiatanList = f.kegiatan.map((k) => `<li>${esc(k)}</li>`).join("");
      return `
        <p><b>${esc(f.judul)} (${esc(f.waktu)})</b></p>
        <ol>${kegiatanList}</ol>
        <div class="kbc-box">
          <b>Penguatan Nilai KBC (Panca Cinta):</b> ${esc(f.penguatanKbc)}
        </div>
      `;
    })
    .join("");

  const penutupRows = pertemuan.penutup.map((k) => `<li>${esc(k)}</li>`).join("");
  const penutupKbc = `Kesimpulan dan refleksi menguatkan Cinta Ilmu atas pengetahuan yang didapat. Doa penutup menunjukkan rasa syukur dan kepatuhan (Cinta kepada Allah/Rasul-Nya). Apresiasi dan penguatan karakter menumbuhkan Cinta Diri dan Sesama.`;

  return `
    <h3>Pertemuan ${pertemuan.nomor} (${esc(pertemuan.alokasi)})</h3>
    <table class="pb-table">
      <thead>
        <tr>
          <th style="width:15%; text-align:center;">Tahap<br/>Pembelajaran</th>
          <th style="width:15%; text-align:center;">Alokasi<br/>Waktu</th>
          <th>Kegiatan Pembelajaran</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align:center; vertical-align: middle;"><b>PENDAHULUAN</b></td>
          <td style="text-align:center; vertical-align: middle;">${esc(pertemuan.waktuPendahuluan)}</td>
          <td>
            <ol>${pendahuluanRows}</ol>
            <div class="kbc-box">
              <b>Penguatan Nilai KBC (Panca Cinta):</b> Doa bersama menumbuhkan Cinta kepada Allah/Rasul-Nya. Apersepsi dan motivasi menguatkan Cinta Ilmu untuk belajar, berkomunikasi yang baik dan Cinta Diri dan Sesama untuk berinteraksi dengan hormat.
            </div>
          </td>
        </tr>
        <tr>
          <td style="text-align:center; vertical-align: middle;"><b>INTI</b></td>
          <td style="text-align:center; vertical-align: middle;">${esc(pertemuan.waktuInti)}</td>
          <td>${intiHtml}</td>
        </tr>
        <tr>
          <td style="text-align:center; vertical-align: middle;"><b>PENUTUP</b></td>
          <td style="text-align:center; vertical-align: middle;">${esc(pertemuan.waktuPenutup)}</td>
          <td>
            <ol>${penutupRows}</ol>
            <div class="kbc-box">
              <b>Penguatan Nilai KBC (Panca Cinta):</b> ${esc(penutupKbc)}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  `;
}
