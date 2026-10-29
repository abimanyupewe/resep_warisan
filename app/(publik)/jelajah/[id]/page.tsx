import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PUBLIC_WHERE } from "@/lib/public";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/recipes";
import { RecipeBody } from "../../../(anggota)/resep/[id]/recipe-body";

export default async function ResepPublik(props: PageProps<"/jelajah/[id]">) {
  const { id } = await props.params;
  const [r, user] = await Promise.all([
    prisma.recipe.findFirst({
      where: { id, ...PUBLIC_WHERE },
      include: { category: true, owner: true, photos: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
    }),
    currentUser(),
  ]);
  if (!r) notFound();

  return (
    <main className="mx-auto flex max-w-[680px] flex-col gap-5">
      <Link href="/jelajah" className="flex min-h-12 w-fit items-center gap-2 font-semibold text-primary"><ArrowLeft aria-hidden /> Kembali ke semua resep</Link>
      <RecipeBody r={r} />
      <section className="flex flex-col items-start gap-3 rounded-lg bg-background p-5 ring-1 ring-border">
        {user ? (
          <>
            <p className="font-semibold">Buka resep ini di aplikasi untuk memilih, mengubah, atau menambah foto.</p>
            <Link href={`/resep/${id}`} className={buttonVariants({ size: "lg" })}>Buka di aplikasi</Link>
          </>
        ) : (
          <>
            <p className="font-semibold">Ingin ikut menambah atau mengubah resep keluarga?</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/daftar" className={buttonVariants({ size: "lg" })}>Daftar jadi anggota</Link>
              <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg" })}>Masuk</Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
