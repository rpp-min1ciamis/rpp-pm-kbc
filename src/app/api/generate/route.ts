import { NextRequest } from "next/server";
import { db } from "@/db";
import { ensureSchema } from "@/db/ensure-schema";
import { rpps } from "@/db/schema";
import { generateRpp } from "@/lib/rpp-generator";
import type { RppInput } from "@/lib/rpp-types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const input = (await req.json()) as RppInput;

    if (!input?.namaSekolah || !input?.mapel || !input?.materiPokok) {
      return Response.json(
        { ok: false, error: "Data wajib (Sekolah, Mapel, Materi Pokok) belum diisi." },
        { status: 400 },
      );
    }

    const output = generateRpp(input);
    const judul = `${input.mapel} — ${input.materiPokok} (${input.kelas})`;

    const inserted = await db
      .insert(rpps)
      .values({
        judul,
        namaGuru: input.namaGuru || "-",
        namaSekolah: input.namaSekolah,
        mapel: input.mapel,
        kelas: input.kelas,
        fase: input.fase,
        model: input.model,
        input: input as unknown as Record<string, unknown>,
        output: output as unknown as Record<string, unknown>,
      })
      .returning({ id: rpps.id });

    return Response.json({ ok: true, id: inserted[0].id, output });
  } catch (err) {
    console.error(err);
    return Response.json(
      { ok: false, error: (err as Error).message ?? "Gagal generate RPP" },
      { status: 500 },
    );
  }
}
