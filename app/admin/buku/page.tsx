import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { DEFAULT_BOOK_TITLE } from "@/lib/book-config";
import { thumb } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { Flash } from "../flash";
import { BookSettings } from "./book-settings";

export const metadata = { title: "Buku · Admin · Dapur Uti" };

export default async function BukuAdminPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; t?: string }> }) {
  await requireAdmin();
  const { ok, error, t } = await searchParams;
  const p = await prisma.bookProfile.findFirst({ include: { coverPhoto: true, dedicationPhoto: true } });
  const photo = (x: { id: string; cloudinaryPublicId: string } | null | undefined) => (x ? { id: x.id, src: thumb(x.cloudinaryPublicId), publicId: x.cloudinaryPublicId } : null);

  return (
    // key=t: setelah simpan, halaman diredirect dengan t baru sehingga formulir terisi ulang dari data tersimpan.
    <main key={t} className="flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Buku resep</h1>
        <p className="text-muted-foreground">
          Atur sampul, cerita, dan tampilan buku PDF. Hasilnya bisa dicoba di <Link href="/buku" className="font-semibold text-primary underline">halaman Buku</Link>.
        </p>
      </header>
      <Flash ok={ok} error={error} />
      <BookSettings
        initial={{
          title: p?.title ?? DEFAULT_BOOK_TITLE,
          subtitle: p?.subtitle ?? "",
          familyName: p?.familyName ?? "",
          dedicationText: p?.dedicationText ?? "",
          foreword: p?.foreword ?? "",
          showDedication: p?.showDedication ?? true,
          showForeword: p?.showForeword ?? true,
          showToc: p?.showToc ?? true,
          showDividers: p?.showDividers ?? true,
          showStory: p?.showStory ?? true,
          showMemory: p?.showMemory ?? true,
          accentColor: p?.accentColor ?? "#a0472a",
          fontSize: p?.fontSize ?? 12,
        }}
        cover={photo(p?.coverPhoto)}
        dedication={photo(p?.dedicationPhoto)}
      />
    </main>
  );
}
