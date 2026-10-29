import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Flash } from "../flash";
import { clampPage, contains, parseList, sort } from "../list-params";
import { ListControls } from "../list-controls";
import { Pager } from "../pager";
import { TrashTable } from "./trash-table";

const PER_PAGE = 10;
const SORTS = [
  sort("deletedAt", "desc", "Terbaru dihapus"),
  sort("deletedAt", "asc", "Terlama dihapus"),
  sort("title", "asc", "Judul A-Z"),
  sort("title", "desc", "Judul Z-A"),
];
const when = (d: Date) => d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });

export default async function SampahPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const { ok, error, t } = sp;
  const { q, sort: order, page: wanted } = parseList(sp, SORTS);

  // shortcut: tanpa hapus permanen; tambah bila sampah menumpuk.
  const where = { deletedAt: { not: null }, ...(q && { OR: [{ title: contains(q) }, { category: { name: contains(q) } }] }) };
  const total = await prisma.recipe.count({ where });
  const { page, pages, skip, take } = clampPage(wanted, total, PER_PAGE);
  const recipes = await prisma.recipe.findMany({
    where,
    orderBy: order.orderBy,
    skip,
    take,
    include: { category: true, owner: true, updatedBy: { select: { name: true } } },
  });
  const rows = recipes.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category?.name ?? "Tanpa kategori",
    owner: r.owner?.name ?? "Tanpa pemilik",
    status: r.status,
    deletedBy: r.updatedBy.name,
    deletedAt: r.deletedAt ? when(r.deletedAt) : "-",
    ingredients: r.ingredientsText ?? "",
    steps: r.stepsText ?? "",
  }));
  const params = { q, sort: order.value === SORTS[0].value ? "" : order.value };

  return (
    // key=t: setelah aksi selesai halaman diredirect dengan t baru, sehingga modal terbuka ikut menutup.
    <main key={t} className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold">Tempat sampah</h1>
      <Flash ok={ok} error={error} />
      <ListControls values={params} sorts={SORTS} placeholder="Cari judul atau kategori" />
      <Card>
        <CardContent>
          {rows.length === 0 ? <p className="text-muted-foreground">{q ? "Tidak ada resep yang cocok." : "Sampah kosong."}</p> : <TrashTable rows={rows} />}
          <Pager path="/admin/sampah" params={params} page={page} pages={pages} total={total} />
        </CardContent>
      </Card>
    </main>
  );
}
