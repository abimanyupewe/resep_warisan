import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { clampPage, contains, parseList, sort } from "../list-params";
import { ListControls } from "../list-controls";
import { Pager } from "../pager";
import { AuditTable } from "./audit-table";

const PER_PAGE = 20;
const SORTS = [
  sort("createdAt", "desc", "Terbaru"),
  sort("createdAt", "asc", "Terlama"),
  sort("action", "asc", "Aksi A-Z"),
];

export default async function AuditPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const { q, sort: order, page: wanted } = parseList(sp, SORTS);

  const where = q ? { OR: [{ action: contains(q) }, { targetType: contains(q) }] } : {};
  const total = await prisma.auditLog.count({ where });
  const { page, pages, skip, take } = clampPage(wanted, total, PER_PAGE);
  const [logs, users] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: order.orderBy, skip, take }),
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);
  const name = new Map(users.map((u) => [u.id, u.name]));
  const rows = logs.map((l) => ({
    id: l.id,
    action: l.action,
    targetType: l.targetType,
    targetId: l.targetId,
    user: (l.userId && name.get(l.userId)) || "akun dihapus",
    at: l.createdAt.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "medium", timeZone: "Asia/Jakarta" }),
    detail: l.detail ? JSON.stringify(l.detail, null, 2) : null,
  }));
  const params = { q, sort: order.value === SORTS[0].value ? "" : order.value };

  return (
    <main className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold">Log audit</h1>
      <ListControls values={params} sorts={SORTS} placeholder="Cari aksi atau target (mis. recipe)" />
      <Card>
        <CardContent>
          {rows.length === 0 ? <p className="text-muted-foreground">{q ? "Tidak ada aktivitas yang cocok." : "Belum ada aktivitas."}</p> : <AuditTable logs={rows} />}
          <Pager path="/admin/audit" params={params} page={page} pages={pages} total={total} />
        </CardContent>
      </Card>
    </main>
  );
}
