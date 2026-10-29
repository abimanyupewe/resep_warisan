import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Flash } from "../flash";
import { DaftarCard } from "./daftar-list";

const order = [{ sortOrder: "asc" }, { name: "asc" }] as const;

export default async function DaftarPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; t?: string }> }) {
  await requireAdmin();
  const { ok, error, t } = await searchParams;
  // Hitung semua resep, termasuk yang di sampah, sama seperti pengaman hapus di actions.ts.
  const [categories, people, byCategory, byOwner] = await Promise.all([
    prisma.category.findMany({ orderBy: [...order] }),
    prisma.person.findMany({ orderBy: [...order] }),
    prisma.recipe.groupBy({ by: ["categoryId"], _count: true }),
    prisma.recipe.groupBy({ by: ["ownerPersonId"], _count: true }),
  ]);
  const catUsed = new Map(byCategory.map((g) => [g.categoryId, g._count]));
  const ownerUsed = new Map(byOwner.map((g) => [g.ownerPersonId, g._count]));

  return (
    // key=t: setelah aksi selesai halaman diredirect dengan t baru, sehingga modal terbuka ikut menutup.
    <main key={t} className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold">Kategori & pemilik</h1>
      <Flash ok={ok} error={error} />
      <DaftarCard kind="category" title="Kategori" noun="kategori" items={categories.map((c) => ({ ...c, used: catUsed.get(c.id) ?? 0 }))} />
      <DaftarCard kind="person" title="Pemilik resep" noun="pemilik" items={people.map((p) => ({ id: p.id, name: p.name, sortOrder: p.sortOrder, relationNote: p.relationNote, used: ownerUsed.get(p.id) ?? 0 }))} />
    </main>
  );
}
