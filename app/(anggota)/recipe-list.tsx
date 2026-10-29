import Link from "next/link";
import { Search } from "lucide-react";
import { clampPage, contains, one } from "@/app/admin/list-params";
import { Pager } from "@/app/admin/pager";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { cardInclude, RecipeCard, toneMap } from "./recipe-card";

const PER_PAGE = 12;
const select = "h-12 min-w-0 rounded-md border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";

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
  const chip = (active: boolean) =>
    `flex min-h-12 items-center rounded-md border px-4 font-semibold ${active ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`;
  const filtered = !!(q || categoryId || ownerPersonId || needsCheck);

  return (
    <main className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{total} resep keluarga</p>
      </header>

      {flash}

      <form action={basePath} className="flex flex-col gap-2 sm:flex-row">
        {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
        {needsCheck && <input type="hidden" name="status" value="perlu_dicek" />}
        <Input type="search" name="q" defaultValue={q} placeholder="Cari judul atau bahan" aria-label="Cari resep" className="flex-1" />
        <select name="ownerPersonId" defaultValue={ownerPersonId} aria-label="Pemilik resep" className={select}>
          <option value="">Semua pemilik</option>
          {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <Button type="submit" size="lg"><Search aria-hidden /> Cari</Button>
      </form>

      <nav aria-label="Kategori" className="flex flex-wrap gap-2">
        <Link href={link({ categoryId: "", page: "" })} className={chip(!categoryId)}>Semua</Link>
        {categories.map((c) => <Link key={c.id} href={link({ categoryId: c.id })} className={chip(categoryId === c.id)}>{c.name}</Link>)}
        {!publicView && <Link href={link({ status: needsCheck ? "" : "perlu_dicek" })} className={chip(needsCheck)}>Perlu dicek</Link>}
      </nav>

      {recipes.length === 0 ? (
        <section className="flex flex-col items-start gap-3 rounded-lg bg-background p-6">
          <p className="font-display text-2xl font-semibold">{filtered ? "Resep tidak ditemukan" : "Belum ada resep"}</p>
          <p className="text-muted-foreground">
            {filtered ? "Coba kata lain, atau tekan Semua untuk melihat seluruh resep." : publicView ? "Resep keluarga akan tampil di sini." : "Mulai dengan menu Tambah di bawah untuk menulis resep keluarga pertama."}
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
