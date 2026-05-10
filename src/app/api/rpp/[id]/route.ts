import { NextRequest } from "next/server";
import { db } from "@/db";
import { ensureSchema } from "@/db/ensure-schema";
import { rpps } from "@/db/schema";
import { eq } from "drizzle-orm";

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
  return Response.json({ ok: true, item: rows[0] });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureSchema();
  const { id } = await params;
  const rowId = Number(id);
  if (!Number.isFinite(rowId)) {
    return Response.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }
  await db.delete(rpps).where(eq(rpps.id, rowId));
  return Response.json({ ok: true });
}
