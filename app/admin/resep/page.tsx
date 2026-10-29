import Link from "next/link";
import { Upload } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { clampPage, contains, one, parseList, sort } from "../list-params";
import { ListControls } from "../list-controls";
import { Pager } from "../pager";
import { RecipeTable } from "./recipe-table";

const PER_PAGE = 10;
const STATUSES = ["draf", "perlu_dicek", "lengkap"] as const;
const SORTS = [
  sort("updatedAt", "desc", "Terbaru diubah"),
  sort("updatedAt", "asc", "Terlama diubah"),
  sort("title", "asc", "Judul A-Z"),
  sort("title", "desc", "Judul Z-A"),
  sort("createdAt", "desc", "Terbaru dibuat"),
];
const when = (d: Date) => d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });

export default async function ResepPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const { q, sort: order, page: wanted } = parseList(sp, SORTS);
  const status = STATUSES.find((s) => s === one(sp, "status"));

  // Resep di sampah sengaja tidak ikut; lihat menu Sampah.
  const where = {
    deletedAt: null,
    ...(status && { status }),
    ...(q && { OR: [{ title: contains(q) }, { ingredientsText: contains(q) }, { category: { name: contains(q) } }, { owner: { name: contains(q) } }] }),
  };
  const total = await prisma.recipe.count({ where });
  const { page, pages, skip, take } = clampPage(wanted, total, PER_PAGE);
  const recipes = await prisma.recipe.findMany({
    where,
    orderBy: order.orderBy,
    skip,
    take,
    include: { category: true, owner: true, createdBy: { select: { name: true } }, updatedBy: { select: { name: true } } },
  });

  const rows = recipes.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category?.name ?? "Tanpa kategori",
    owner: r.owner?.name ?? "Tanpa pemilik",
    status: r.status,
    difficulty: r.difficulty,
    servings: r.servings,
    cookTime: r.cookTime,
    ingredients: r.ingredientsText ?? "",
    steps: r.stepsText ?? "",
    originStory: r.originStory ?? "",
    memoryNote: r.memoryNote ?? "",
    createdBy: r.createdBy.name,
    createdAt: when(r.createdAt),
    updatedBy: r.updatedBy.name,
    updatedAt: when(r.updatedAt),
  }));
  const params = { q, sort: order.value === SORTS[0].value ? "" : order.value, status: status ?? "" };

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Resep</h1>
        <Link href="/admin/resep/impor" className={buttonVariants({ variant: "outline" })}><Upload aria-hidden /> Impor resep</Link>
      </div>
      <ListControls
        values={params}
        sorts={SORTS}
        placeholder="Cari judul, bahan, kategori, pemilik"
        filters={[{ name: "status", label: "Semua status", options: [{ value: "draf", label: "Draf" }, { value: "perlu_dicek", label: "Perlu dicek" }, { value: "lengkap", label: "Lengkap" }] }]}
      />
      <Card>
        <CardContent>
          {rows.length === 0 ? <p className="text-muted-foreground">{q || status ? "Tidak ada resep yang cocok." : "Belum ada resep."}</p> : <RecipeTable rows={rows} />}
          <Pager path="/admin/resep" params={params} page={page} pages={pages} total={total} />
        </CardContent>
      </Card>
    </main>
  );
}
