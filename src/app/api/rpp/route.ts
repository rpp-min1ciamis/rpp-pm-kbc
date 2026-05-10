import { db } from "@/db";
import { ensureSchema } from "@/db/ensure-schema";
import { rpps } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSchema();
  const rows = await db
    .select({
      id: rpps.id,
      judul: rpps.judul,
      namaGuru: rpps.namaGuru,
      namaSekolah: rpps.namaSekolah,
      mapel: rpps.mapel,
      kelas: rpps.kelas,
      fase: rpps.fase,
      model: rpps.model,
      createdAt: rpps.createdAt,
      input: rpps.input,
    })
    .from(rpps)
    .orderBy(desc(rpps.createdAt))
    .limit(100);
  return Response.json({ ok: true, items: rows });
}
