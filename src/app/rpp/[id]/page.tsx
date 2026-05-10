import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { rpps } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { RppOutput } from "@/lib/rpp-types";
import { renderRppHtml } from "@/lib/render-rpp-html";
import RppActions from "./RppActions";

export const dynamic = "force-dynamic";

export default async function RppPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rowId = Number(id);
  if (!Number.isFinite(rowId)) notFound();

  const rows = await db.select().from(rpps).where(eq(rpps.id, rowId)).limit(1);
  if (rows.length === 0) notFound();
  const row = rows[0];
  const out = row.output as unknown as RppOutput;
  const html = renderRppHtml(out);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <Link href="/riwayat" className="text-sm text-emerald-700 hover:underline">
            ← Kembali ke Riwayat
          </Link>
          <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{row.judul}</h1>
          <p className="text-xs text-slate-500">
            {row.namaSekolah} · {row.namaGuru} · Dibuat{" "}
            {new Date(row.createdAt).toLocaleString("id-ID")}
          </p>
        </div>
        <RppActions id={row.id} />
      </div>

      <article
        className="doc rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 print:border-0 print:shadow-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
