import Link from "next/link";
import { Check } from "lucide-react";
import { Flash } from "@/app/admin/flash";
import { clampPage, one } from "@/app/admin/list-params";
import { Pager } from "@/app/admin/pager";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { finishCook } from "../resep/actions";

const PER_PAGE = 20;
const day = (d: Date) => d.toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });
const FILTERS = [["", "Semua"], ["aktif", "Sedang dimasak"], ["selesai", "Selesai"]] as const;

export default async function Riwayat({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const status = FILTERS.find(([v]) => v && v === one(sp, "status"))?.[0] ?? "";

  // Resep yang sudah di sampah tidak ikut ditampilkan.
  const where = {
    userId: user.id,
    recipe: { deletedAt: null },
    ...(status === "aktif" && { finishedAt: null }),
    ...(status === "selesai" && { finishedAt: { not: null } }),
  };
  const total = await prisma.cookLog.count({ where });
  const { page, pages, skip, take } = clampPage(Math.max(1, parseInt(one(sp, "page")) || 1), total, PER_PAGE);
  const logs = await prisma.cookLog.findMany({ where, orderBy: { startedAt: "desc" }, skip, take, include: { recipe: { select: { id: true, title: true } } } });

  const chip = (active: boolean) =>
    `flex min-h-12 items-center rounded-md border px-4 font-semibold ${active ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`;

  return (
    <main className="mx-auto flex max-w-[680px] flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-semibold">Riwayat masak</h1>
        <p className="text-muted-foreground">Resep yang pernah Anda pilih untuk dimasak.</p>
      </header>

      <Flash ok={sp.ok} error={sp.error} />

      <nav aria-label="Saring riwayat" className="flex flex-wrap gap-2">
        {FILTERS.map(([value, label]) => (
          <Link key={value} href={value ? `/riwayat?status=${value}` : "/riwayat"} className={chip(status === value)}>{label}</Link>
        ))}
      </nav>

      {logs.length === 0 ? (
        <section className="flex flex-col items-start gap-3 rounded-lg bg-background p-6">
          <p className="font-display text-2xl font-semibold">{status ? "Tidak ada riwayat" : "Belum ada riwayat"}</p>
          <p className="text-muted-foreground">Buka satu resep, lalu tekan &quot;Pilih resep ini&quot; sebelum mulai memasak. Resep yang dipilih akan tercatat di sini.</p>
          <Link href="/resep" className={buttonVariants({ variant: "outline" })}>Lihat resep masakan</Link>
        </section>
      ) : (
        <ul className="flex flex-col gap-3">
          {logs.map((h) => (
            <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-background p-4 ring-1 ring-border">
              <div>
                <Link href={`/resep/${h.recipe.id}`} className="font-display text-xl font-semibold hover:underline">{h.recipe.title}</Link>
                <p className="text-sm text-muted-foreground">Dipilih {day(h.startedAt)}{h.finishedAt && ` · Selesai ${day(h.finishedAt)}`}</p>
              </div>
              {h.finishedAt ? (
                <Badge className="bg-pandan text-green-950">Selesai</Badge>
              ) : (
                <form action={finishCook.bind(null, h.recipe.id, "riwayat")} className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-kunyit text-amber-950">Sedang dimasak</Badge>
                  <Button type="submit"><Check aria-hidden /> Tandai sudah selesai</Button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && <Pager path="/riwayat" params={{ status }} page={page} pages={pages} total={total} />}
    </main>
  );
}
