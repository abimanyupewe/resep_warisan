import Link from "next/link";
import { ChefHat, ClipboardCheck, Download, Trash2, Users } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { PENDING } from "@/lib/pending";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DayBars, HBars } from "./charts";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const now = new Date().getTime();
  const since = new Date(now - 7 * 864e5);
  const [members, recipes, needsCheck, trash, logs, users, byCategory, byOwner, categories, people, week, waiting] = await Promise.all([
    prisma.user.count({ where: { banned: false } }),
    prisma.recipe.count({ where: { deletedAt: null } }),
    prisma.recipe.count({ where: { deletedAt: null, status: "perlu_dicek" } }),
    prisma.recipe.count({ where: { deletedAt: { not: null } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.user.findMany({ select: { id: true, name: true } }),
    prisma.recipe.groupBy({ by: ["categoryId"], where: { deletedAt: null }, _count: true }),
    prisma.recipe.groupBy({ by: ["ownerPersonId"], where: { deletedAt: null }, _count: true }),
    prisma.category.findMany({ select: { id: true, name: true } }),
    prisma.person.findMany({ select: { id: true, name: true } }),
    prisma.auditLog.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.user.count({ where: { banned: true, banReason: PENDING } }),
  ]);
  const rows = (g: { _count: number }[], key: (x: never) => string | null, names: { id: string; name: string }[], none: string) => {
    const label = new Map(names.map((n) => [n.id, n.name]));
    return g.map((x) => [(key(x as never) && label.get(key(x as never)!)) || none, x._count] as const).sort((a, b) => b[1] - a[1]).map(([label, n]) => ({ label, n }));
  };
  const perCategory = rows(byCategory, (x: { categoryId: string | null }) => x.categoryId, categories, "Tanpa kategori");
  const perOwner = rows(byOwner, (x: { ownerPersonId: string | null }) => x.ownerPersonId, people, "Tanpa pemilik");
  // 7 hari terakhir (WIB), terlama ke terbaru.
  const day = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  const days = Array.from({ length: 7 }, (_, i) => new Date(now - (6 - i) * 864e5));
  const perDay = days.map((d) => ({ label: d.toLocaleDateString("id-ID", { weekday: "short", timeZone: "Asia/Jakarta" }), n: week.filter((l) => day(l.createdAt) === day(d)).length }));
  const name = new Map(users.map((u) => [u.id, u.name]));
  // [label, jumlah, tujuan (hanya bila halaman admin-nya ada), ikon, warna pastel]
  const stats = [
    ["Anggota aktif", members, "/admin/anggota", Users, "bg-telur"],
    ["Resep", recipes, "/admin/resep", ChefHat, "bg-pandan"],
    ["Perlu dicek", needsCheck, "/admin/resep?status=perlu_dicek", ClipboardCheck, "bg-kunyit"],
    ["Di sampah", trash, "/admin/sampah", Trash2, "bg-jambu"],
  ] as const;

  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Ringkasan</h1>
        <p className="text-muted-foreground">Halo, {admin.name}.</p>
      </header>

      {waiting > 0 && (
        <Link href="/admin/anggota?status=menunggu" className="flex min-h-12 items-center justify-between gap-3 rounded-lg bg-kunyit p-4 font-semibold text-amber-950 hover:brightness-95">
          <span>{waiting} pendaftar menunggu persetujuan</span>
          <span className="underline">Tinjau</span>
        </Link>
      )}

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(([label, n, href, Icon, tone]) => {
          const body = (
            <>
              <dt className="flex items-center gap-2 text-[15px] font-semibold sm:text-base"><Icon className="size-5" aria-hidden />{label}</dt>
              <dd className="font-display text-5xl font-medium">{n}</dd>
            </>
          );
          const cls = `flex flex-col gap-2 rounded-lg p-4 sm:p-5 ${tone}`;
          return href ? (
            <Link key={label} href={href} className={`${cls} hover:brightness-95`}>{body}</Link>
          ) : (
            <div key={label} className={cls}>{body}</div>
          );
        })}
      </dl>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="font-display text-2xl font-semibold">Resep per kategori</CardTitle></CardHeader>
          <CardContent>
            {perCategory.length ? <HBars rows={perCategory} unit="Resep" color="var(--chart-1)" /> : <p className="text-muted-foreground">Belum ada resep.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display text-2xl font-semibold">Resep per pemilik</CardTitle></CardHeader>
          <CardContent>
            {perOwner.length ? <HBars rows={perOwner} unit="Resep" color="var(--chart-2)" /> : <p className="text-muted-foreground">Belum ada resep.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="font-display text-2xl font-semibold">Aktivitas 7 hari terakhir</CardTitle></CardHeader>
        <CardContent><DayBars rows={perDay} unit="Aktivitas" color="var(--chart-3)" /></CardContent>
      </Card>

      {/* Backup otomatis harian ke Google Drive belum dibangun (minggu 4); sementara ada unduhan manual. */}
      <section className="flex flex-col gap-3 rounded-lg bg-ubi p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Cadangan data</h2>
          <p>Unduh seluruh data (akun, resep termasuk sampah, riwayat versi, log) sebagai satu berkas JSON. Password tidak ikut.</p>
          <p className="text-sm opacity-75">Backup otomatis harian: belum aktif.</p>
        </div>
        {/* <a> biasa, bukan <Link>: ini unduhan, dan prefetch akan memicu ekspor tanpa diminta. */}
        <a href="/api/admin/export" download className={`${buttonVariants()} shrink-0`}><Download aria-hidden /> Unduh semua data</a>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl font-semibold">Aktivitas terbaru</CardTitle>
          <CardAction><Link href="/admin/audit" className="flex min-h-12 items-center font-semibold text-primary hover:underline">Lihat semua</Link></CardAction>
        </CardHeader>
        <CardContent>
          {logs.length === 0 && <p className="text-muted-foreground">Belum ada aktivitas.</p>}
          <ul className="flex flex-col divide-y">
            {logs.map((l) => (
              <li key={l.id} className="py-3 text-base first:pt-0 last:pb-0">
                <span className="font-semibold">{l.action}</span> <Badge variant="secondary">{l.targetType}</Badge>
                <br />
                <span className="text-sm text-muted-foreground">
                  {(l.userId && name.get(l.userId)) ?? "akun dihapus"} · {l.createdAt.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
