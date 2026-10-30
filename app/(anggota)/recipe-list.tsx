import Link from "next/link";
import { Search, X } from "lucide-react";
import { clampPage, contains, one } from "@/app/admin/list-params";
import { Pager } from "@/app/admin/pager";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { cardInclude, RecipeCard, toneMap } from "./recipe-card";
import { RecipeFilter } from "./recipe-filter";

const PER_PAGE = 12;

type Props = {
  sp: Record<string, string | undefined>;
  // "/resep" untuk anggota, "/jelajah" untuk pengunjung; menentukan tautan kartu, form, dan paginasi.
  basePath: "/resep" | "/jelajah";
  title: string;
  flash?: React.ReactNode;
};

// Daftar resep dengan cari, filter, dan paginasi. Mode pengunjung menyembunyikan draf dan filter "Perlu dicek".
export async function RecipeList({ sp, basePath, title, flash }: Props) {
  const publicView = basePath === "/jelajah";
  const q = one(sp, "q").trim().slice(0, 100);
  const categoryId = one(sp, "categoryId");
  const ownerPersonId = one(sp, "ownerPersonId");
  const needsCheck = !publicView && one(sp, "status") === "perlu_dicek";

  const [categories, people] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.person.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);
  const where = {
    deletedAt: null,
    ...(publicView && { status: { not: "draf" as const } }),
    ...(categoryId && { categoryId }),
    ...(ownerPersonId && { ownerPersonId }),
    ...(needsCheck && { status: "perlu_dicek" as const }),
    ...(q && { OR: [{ title: contains(q) }, { ingredientsText: contains(q) }] }),
  };
  const total = await prisma.recipe.count({ where });
  const { page, pages, skip, take } = clampPage(Math.max(1, parseInt(one(sp, "page")) || 1), total, PER_PAGE);
  const recipes = await prisma.recipe.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take, include: cardInclude });

  const tone = toneMap(categories);
  const params = { q, categoryId, ownerPersonId, status: needsCheck ? "perlu_dicek" : "" };
  // Tautan filter: pertahankan parameter lain, ganti satu, dan kembali ke halaman 1.
  const link = (patch: Record<string, string>) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...params, ...patch })) if (v) next.set(k, v);
    return next.size ? `${basePath}?${next}` : basePath;
  };
  // [label, tautan hapus, termasuk filter di modal]. Kata cari bukan filter modal, jadi tidak ikut dihitung di tombol Filter.
  const chips: [string, string, boolean][] = [
    ...(q ? [[`"${q}"`, link({ q: "", page: "" }), false] as [string, string, boolean]] : []),
    ...(categoryId ? [[categories.find((c) => c.id === categoryId)?.name ?? "Kategori", link({ categoryId: "", page: "" }), true] as [string, string, boolean]] : []),
    ...(ownerPersonId ? [[people.find((p) => p.id === ownerPersonId)?.name ?? "Pemilik", link({ ownerPersonId: "", page: "" }), true] as [string, string, boolean]] : []),
    ...(needsCheck ? [["Perlu dicek", link({ status: "", page: "" }), true] as [string, string, boolean]] : []),
  ];
  const filtered = chips.length > 0;

  return (
    <main className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{total} resep keluarga</p>
      </header>

      {flash}

      <form action={basePath} className="flex gap-2">
        {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
        {ownerPersonId && <input type="hidden" name="ownerPersonId" value={ownerPersonId} />}
        {needsCheck && <input type="hidden" name="status" value="perlu_dicek" />}
        <Input type="search" name="q" defaultValue={q} placeholder="Cari judul atau bahan" aria-label="Cari resep" className="min-w-0 flex-1" />
        <Button type="submit" size="lg"><Search aria-hidden /> Cari</Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <RecipeFilter basePath={basePath} q={q} categoryId={categoryId} ownerPersonId={ownerPersonId} needsCheck={needsCheck} categories={categories} people={people} showStatus={!publicView} active={chips.filter(([, , filter]) => filter).length} />
        {chips.map(([label, href]) => (
          <Link key={label} href={href} aria-label={`Hapus ${label}`} className="flex min-h-10 items-center gap-1 rounded-full bg-secondary px-3 font-semibold hover:bg-secondary/70">
            {label} <X className="size-4" aria-hidden />
          </Link>
        ))}
        {chips.length > 1 && <Link href={basePath} className="flex min-h-10 items-center px-2 font-semibold text-primary hover:underline">Hapus semua</Link>}
      </div>

      {recipes.length === 0 ? (
        <section className="flex flex-col items-start gap-3 rounded-lg bg-background p-6">
          <p className="font-display text-2xl font-semibold">{filtered ? "Resep tidak ditemukan" : "Belum ada resep"}</p>
          <p className="text-muted-foreground">
            {filtered ? "Coba kata lain, atau hapus filter untuk melihat seluruh resep." : publicView ? "Resep keluarga akan tampil di sini." : "Mulai dengan menu Tambah di bawah untuk menulis resep keluarga pertama."}
          </p>
          {filtered && <Link href={basePath} className={buttonVariants({ variant: "outline" })}>Lihat semua resep</Link>}
        </section>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => <li key={r.id}><RecipeCard r={r} tone={tone} href={`${basePath}/${r.id}`} /></li>)}
        </ul>
      )}

      {pages > 1 && <Pager path={basePath} params={params} page={page} pages={pages} total={total} />}
    </main>
  );
}
