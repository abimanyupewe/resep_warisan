import { requireAdmin } from "@/lib/admin";
import { PENDING } from "@/lib/pending";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Flash } from "../flash";
import { clampPage, contains, one, parseList, sort } from "../list-params";
import { ListControls } from "../list-controls";
import { Pager } from "../pager";
import { AddMember, MemberTable } from "./members";

const PER_PAGE = 10;
const SORTS = [
  sort("createdAt", "asc", "Terlama dibuat"),
  sort("createdAt", "desc", "Terbaru dibuat"),
  sort("name", "asc", "Nama A-Z"),
  sort("name", "desc", "Nama Z-A"),
];

export default async function AnggotaPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const { ok, error, t } = sp;
  const { q, sort: order, page: wanted } = parseList(sp, SORTS);

  const status = ["aktif", "menunggu", "nonaktif"].find((v) => v === one(sp, "status")) ?? "";
  // banReason bisa null, jadi "nonaktif" harus menyebut null secara eksplisit (SQL: NULL <> 'x' tidak pernah benar).
  const where = {
    AND: [
      ...(q ? [{ OR: [{ name: contains(q) }, { email: contains(q) }] }] : []),
      ...(status === "aktif" ? [{ banned: false }] : []),
      ...(status === "menunggu" ? [{ banned: true, banReason: PENDING }] : []),
      ...(status === "nonaktif" ? [{ banned: true, OR: [{ banReason: null }, { banReason: { not: PENDING } }] }] : []),
    ],
  };
  const [all, total] = await Promise.all([prisma.user.count(), prisma.user.count({ where })]);
  const { page, pages, skip, take } = clampPage(wanted, total, PER_PAGE);
  const users = await prisma.user.findMany({ where, orderBy: order.orderBy, skip, take });
  const members = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    banned: !!u.banned,
    pending: !!u.banned && u.banReason === PENDING,
    createdAt: u.createdAt.toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }),
  }));
  const params = { q, sort: order.value === SORTS[0].value ? "" : order.value, status };

  return (
    // key=t: setelah aksi selesai halaman diredirect dengan t baru, sehingga modal terbuka ikut menutup.
    <main key={t} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Anggota <span className="text-muted-foreground">({all})</span></h1>
        <AddMember />
      </div>
      <Flash ok={ok} error={error} />
      <ListControls
        values={params}
        sorts={SORTS}
        placeholder="Cari nama atau email"
        filters={[{ name: "status", label: "Semua status", options: [{ value: "aktif", label: "Aktif" }, { value: "menunggu", label: "Menunggu persetujuan" }, { value: "nonaktif", label: "Nonaktif" }] }]}
      />
      <Card>
        <CardContent>
          {members.length === 0 ? <p className="text-muted-foreground">Tidak ada anggota yang cocok.</p> : <MemberTable members={members} adminId={admin.id} />}
          <Pager path="/admin/anggota" params={params} page={page} pages={pages} total={total} />
        </CardContent>
      </Card>
    </main>
  );
}
