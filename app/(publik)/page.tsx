import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { PUBLIC_WHERE } from "@/lib/public";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/recipes";
import { cardInclude, RecipeCard, toneMap } from "../(anggota)/recipe-card";

export const instant = false;

// Halaman depan untuk pengunjung. Anggota yang sudah masuk langsung dibawa ke Beranda.
export default async function Landing() {
  if (await currentUser()) redirect("/beranda");

  const [latest, categories, total] = await Promise.all([
    prisma.recipe.findMany({ where: PUBLIC_WHERE, orderBy: { createdAt: "desc" }, take: 6, include: cardInclude }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.recipe.count({ where: PUBLIC_WHERE }),
  ]);
  const tone = toneMap(categories);

  return (
    <main className="flex flex-col gap-10">
      <section className="flex flex-col items-start gap-4 rounded-lg bg-background p-6 lg:p-10">
        <h1 className="font-display text-4xl font-semibold lg:text-5xl">Resep warisan keluarga</h1>
        <p className="max-w-xl text-muted-foreground">
          Kumpulan resep masakan turun-temurun yang dijaga bersama{total > 0 ? `, sudah ${total} resep` : ""}. Silakan baca dan cari resepnya.
          Daftar untuk ikut menambah resep keluarga.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/jelajah" className={buttonVariants({ size: "lg" })}>Lihat semua resep</Link>
          <Link href="/daftar" className={buttonVariants({ variant: "outline", size: "lg" })}>Daftar jadi anggota</Link>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-semibold">Cari menurut kategori</h2>
          <nav aria-label="Kategori" className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link key={c.id} href={`/jelajah?categoryId=${c.id}`} className="flex min-h-12 items-center rounded-md border bg-background px-4 font-semibold hover:bg-muted">{c.name}</Link>
            ))}
          </nav>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">Resep terbaru</h2>
          {latest.length > 0 && <Link href="/jelajah" className="flex min-h-12 items-center font-semibold text-primary hover:underline">Lihat semua resep</Link>}
        </div>
        {latest.length === 0 ? (
          <p className="rounded-lg bg-background p-6 text-muted-foreground">Resep keluarga akan tampil di sini.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((r) => <li key={r.id}><RecipeCard r={r} tone={tone} href={`/jelajah/${r.id}`} /></li>)}
          </ul>
        )}
      </section>
    </main>
  );
}
