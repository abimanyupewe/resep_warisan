import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Flash } from "../flash";
import { FaqList } from "./faq-list";

export const metadata = { title: "FAQ · Admin · Dapur Uti" };

export default async function FaqPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; t?: string }> }) {
  await requireAdmin();
  const { ok, error, t } = await searchParams;
  const items = await prisma.faq.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });

  return (
    // key=t: setelah aksi selesai halaman diredirect dengan t baru, sehingga modal terbuka ikut menutup.
    <main key={t} className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold">FAQ</h1>
      <Flash ok={ok} error={error} />
      <FaqList items={items.map(({ id, question, answer, sortOrder, published }) => ({ id, question, answer, sortOrder, published }))} />
    </main>
  );
}
