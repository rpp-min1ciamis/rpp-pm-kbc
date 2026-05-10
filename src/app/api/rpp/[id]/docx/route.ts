import { NextRequest } from "next/server";
import { db } from "@/db";
import { ensureSchema } from "@/db/ensure-schema";
import { rpps } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { RppOutput } from "@/lib/rpp-types";
import { buildDocx } from "@/lib/generate-docx";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureSchema();
  const { id } = await params;
  const rowId = Number(id);
  if (!Number.isFinite(rowId)) {
    return Response.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }
  const rows = await db.select().from(rpps).where(eq(rpps.id, rowId)).limit(1);
  if (rows.length === 0) {
    return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const row = rows[0];
  const out = row.output as unknown as RppOutput;

  try {
    const buffer = await buildDocx(out);
    const safeName = row.judul.replace(/[^a-zA-Z0-9_\- ]+/g, "_").substring(0, 80);
    const filename = `RPP-${row.id}-${safeName}.docx`;
    const uint8 = new Uint8Array(buffer);

    return new Response(uint8, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (err) {
    console.error("DOCX generation error:", err);
    return Response.json(
      { ok: false, error: "Gagal membuat file DOCX" },
      { status: 500 },
    );
  }
}
