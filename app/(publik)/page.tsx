import { ChevronDown, Download } from "lucide-react";
import Image from "next/image";
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

  const [latest, categories, total, owners, photos, faqs] = await Promise.all([
    prisma.recipe.findMany({ where: PUBLIC_WHERE, orderBy: { createdAt: "desc" }, take: 3, include: cardInclude }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.recipe.count({ where: PUBLIC_WHERE }),
    prisma.recipe.groupBy({ by: ["ownerPersonId"], where: { ...PUBLIC_WHERE, ownerPersonId: { not: null } } }),
    prisma.photo.count({ where: { kind: "masakan", recipe: PUBLIC_WHERE } }),
    prisma.faq.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
  ]);
  const tone = toneMap(categories);
  // Hanya angka yang ada isinya yang ditampilkan; bagian ini hilang sendiri saat belum ada resep.
  const stats = [
    [total, "resep tersimpan"],
    [categories.length, "kategori"],
    [owners.length, "pemilik resep"],
    [photos, "foto masakan"],
  ].filter(([n]) => (n as number) > 0) as [number, string][];

  return (
    <main className="flex flex-col gap-12">
      {/* Latar hero sengaja sama dengan latar logo (#fdf7ec) supaya logo menyatu tanpa tepi kotak. */}
      <section className="grid items-center gap-6 rounded-3xl bg-[#fdf7ec] p-6 lg:grid-cols-2 lg:gap-10 lg:p-12">
        <Image src="/icons/icon-512.png" alt="Dapur Uti: nenek mengaduk masakan di panci" width={512} height={512} className="mx-auto hidden size-96 lg:block" />
        <div className="flex flex-col items-start gap-5">
          <h1 className="font-display text-4xl font-semibold leading-tight lg:text-5xl">Resep Uti, dijaga bersama</h1>
          <p className="max-w-prose text-lg text-muted-foreground">Baca resep keluarga kami. Daftar untuk ikut menambah.</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/jelajah" className={buttonVariants({ size: "lg" })}>Lihat semua resep</Link>
            <Link href="/daftar" className={buttonVariants({ variant: "outline", size: "lg" })}>Daftar jadi anggota</Link>
          </div>
        </div>
      </section>

      {total > 0 && (
        <section aria-label="Isi Dapur Uti">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-6 px-1 lg:grid-cols-4">
            {stats.map(([n, label]) => (
              // dt (istilah) lebih dulu di DOM, tampil di bawah angka lewat flex-col-reverse.
              <div key={label} className="flex flex-col-reverse justify-end gap-1">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-display text-4xl font-semibold text-primary">{n.toLocaleString("id-ID")}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {categories.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-semibold">Cari menurut kategori</h2>
          <nav aria-label="Kategori" className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link key={c.id} href={`/jelajah?categoryId=${c.id}`} className={`flex min-h-12 items-center rounded-md px-5 font-semibold hover:ring-2 hover:ring-primary ${tone.get(c.id) ?? "bg-secondary"}`}>{c.name}</Link>
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
          <p className="rounded-lg bg-background p-6 text-muted-foreground">Belum ada resep. Daftar, lalu tambahkan resep pertama keluarga.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((r) => <li key={r.id}><RecipeCard r={r} tone={tone} href={`/jelajah/${r.id}`} /></li>)}
          </ul>
        )}
      </section>

      {total > 0 && (
        <section className="flex flex-col items-start gap-3 rounded-3xl bg-[#fdf7ec] p-6 lg:p-8">
          <h2 className="font-display text-2xl font-semibold">Bawa pulang resepnya</h2>
          <p className="max-w-prose text-lg text-muted-foreground">Unduh resep keluarga sebagai buku PDF, siap dicetak.</p>
          <Link href="/jelajah/buku" className={buttonVariants({ variant: "outline", size: "lg" })}><Download aria-hidden /> Unduh buku resep</Link>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-semibold">Pertanyaan umum</h2>
          <div className="divide-y overflow-hidden rounded-2xl bg-background ring-1 ring-border">
            {faqs.map((f) => (
              <details key={f.id} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="max-w-prose whitespace-pre-line px-5 pb-5 text-lg">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col items-start gap-4 rounded-3xl bg-primary p-6 text-primary-foreground lg:p-10">
        <h2 className="font-display text-3xl font-semibold">Punya resep tulisan tangan di rumah?</h2>
        <p className="max-w-prose text-lg">Foto tulisannya, simpan bersama bahan dan langkahnya. Setiap perubahan tersimpan sebagai versi, jadi aman untuk dilengkapi bersama.</p>
        <Link href="/daftar" className={buttonVariants({ variant: "secondary", size: "lg" })}>Daftar jadi anggota</Link>
      </section>
    </main>
  );
}
