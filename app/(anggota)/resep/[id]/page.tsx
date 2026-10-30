import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, Check, ChefHat, Pencil } from "lucide-react";
import { Flash } from "@/app/admin/flash";
import { Button, buttonVariants } from "@/components/ui/button";
import { FONT_SIZE, requireUser } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { cancelCook, finishCook, startCook } from "../actions";
import { RecipeBody } from "./recipe-body";
import { TrashButton } from "./trash-button";

export default async function DetailResep(props: PageProps<"/resep/[id]">) {
  const user = await requireUser();
  const { id } = await props.params;
  const { ok } = await props.searchParams;
  const r = await prisma.recipe.findFirst({
    where: { id, deletedAt: null },
    include: { category: true, owner: true, updatedBy: { select: { name: true } }, photos: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
  });
  if (!r) notFound();
  const [active, lastDone] = await Promise.all([
    prisma.cookLog.findFirst({ where: { userId: user.id, recipeId: id, finishedAt: null } }),
    prisma.cookLog.findFirst({ where: { userId: user.id, recipeId: id, finishedAt: { not: null } }, orderBy: { finishedAt: "desc" } }),
  ]);

  return (
    <main className="mx-auto flex max-w-[680px] flex-col gap-5">
      <Link href="/resep" className="flex min-h-12 w-fit items-center gap-2 font-semibold text-primary"><ArrowLeft aria-hidden /> Kembali</Link>

      <Flash ok={typeof ok === "string" ? ok : undefined} />

      <RecipeBody r={r} fontSize={FONT_SIZE[user.fontSize]} />
      <p className="text-sm text-muted-foreground">Terakhir diubah oleh {r.updatedBy.name}, {r.updatedAt.toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" })}.</p>

      {/* Di bawah isi resep: dibaca dulu, lalu dipilih dan ditandai selesai. */}
      {active ? (
        <section className="flex flex-col gap-3 rounded-lg bg-kunyit/50 p-4">
          <p className="font-semibold">Sedang dimasak. Sudah selesai memasak?</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <form action={finishCook.bind(null, id, "resep")}><Button type="submit" size="lg" className="w-full"><Check aria-hidden /> Tandai sudah selesai</Button></form>
            <form action={cancelCook.bind(null, id)}><Button type="submit" variant="outline" size="lg" className="w-full">Batalkan pilihan</Button></form>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-2 rounded-lg bg-background p-4 ring-1 ring-border">
          <form action={startCook.bind(null, id)}><Button type="submit" size="lg" className="w-full sm:w-auto"><ChefHat aria-hidden /> Pilih resep ini</Button></form>
          {lastDone?.finishedAt && <p className="text-sm text-muted-foreground">Terakhir selesai dimasak {lastDone.finishedAt.toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" })}.</p>}
        </section>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={`/resep/${id}/ubah`} className={buttonVariants({ variant: "outline", size: "lg" })}><Pencil aria-hidden /> Ubah resep</Link>
          <Link href={`/resep/${id}/foto`} className={buttonVariants({ variant: "outline", size: "lg" })}><Camera aria-hidden /> {r.photos.length ? "Kelola foto" : "Tambah foto"}</Link>
        </div>
        <TrashButton id={id} title={r.title} />
      </div>
    </main>
  );
}
