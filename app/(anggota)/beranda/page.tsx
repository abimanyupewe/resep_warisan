import Link from "next/link";
import { Check } from "lucide-react";
import { Flash } from "@/app/admin/flash";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { InstallBanner } from "./install-banner";
import { finishCook } from "./resep/actions";
import { cardInclude, RecipeCard, toneMap } from "./recipe-card";

const day = (d: Date) => d.toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });
const h2 = "font-display text-2xl font-semibold";

export default async function Beranda({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const sp = await searchParams;

  const [history, latest, categories] = await Promise.all([
    // Hanya resep yang sedang dipilih (belum ditandai selesai); yang sudah di sampah tidak ikut.
    prisma.cookLog.findMany({
      where: { userId: user.id, finishedAt: null, recipe: { deletedAt: null } },
      orderBy: { startedAt: "desc" },
      take: 6,
      include: { recipe: { select: { id: true, title: true } } },
    }),
    prisma.recipe.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 6, include: cardInclude }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);
  const tone = toneMap(categories);

  return (
    <main className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Halo, {user.name}</h1>
        <p className="text-muted-foreground">Mau masak apa hari ini?</p>
      </header>

      <Flash ok={sp.ok} error={sp.error} />

      <InstallBanner />

      {/* Disembunyikan bila tidak ada resep yang sedang dipilih; riwayat lengkap ada di halaman Riwayat. */}
      {history.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className={h2}>Sedang dimasak</h2>
            <Link href="/riwayat" className="flex min-h-12 items-center font-semibold text-primary hover:underline">Lihat riwayat</Link>
          </div>
          <ul className="flex flex-col gap-3">
            {history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-background p-4 ring-1 ring-border">
                <div>
                  <Link href={`/resep/${h.recipe.id}`} className="font-display text-xl font-semibold hover:underline">{h.recipe.title}</Link>
                  <p className="text-sm text-muted-foreground">Dipilih {day(h.startedAt)}</p>
                </div>
                <form action={finishCook.bind(null, h.recipe.id, "beranda")}>
                  <Button type="submit"><Check aria-hidden /> Tandai sudah selesai</Button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={h2}>Resep terbaru</h2>
          <Link href="/resep" className="flex min-h-12 items-center font-semibold text-primary hover:underline">Lihat semua resep</Link>
        </div>
        {latest.length === 0 ? (
          <p className="rounded-lg bg-background p-6 text-muted-foreground">Belum ada resep. Mulai dengan menu Tambah di bawah.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((r) => <li key={r.id}><RecipeCard r={r} tone={tone} /></li>)}
          </ul>
        )}
      </section>
    </main>
  );
}
