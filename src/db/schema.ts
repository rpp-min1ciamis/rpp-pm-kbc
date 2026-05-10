import {
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";

export const rpps = pgTable("rpps", {
  id: serial("id").primaryKey(),
  judul: varchar("judul", { length: 255 }).notNull(),
  namaGuru: varchar("nama_guru", { length: 255 }).notNull(),
  namaSekolah: varchar("nama_sekolah", { length: 255 }).notNull(),
  mapel: varchar("mapel", { length: 120 }).notNull(),
  kelas: varchar("kelas", { length: 60 }).notNull(),
  fase: varchar("fase", { length: 20 }).notNull(),
  model: varchar("model", { length: 80 }).notNull(),
  input: jsonb("input").notNull(),
  output: jsonb("output").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Rpp = typeof rpps.$inferSelect;
export type NewRpp = typeof rpps.$inferInsert;
