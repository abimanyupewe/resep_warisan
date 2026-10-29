import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, Check, ChefHat, Pencil } from "lucide-react";
import { Flash } from "@/app/admin/flash";
import { CloudImg } from "@/components/cloud-img";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { large, original } from "@/lib/cloudinary";
import { FONT_SIZE, requireUser } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { cancelCook, finishCook, startCook } from "../actions";
import { TrashButton } from "./trash-button";

const lines = (t: string | null) => (t ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
const STATUS = { draf: "Draf", perlu_dicek: "Perlu dicek", lengkap: "Lengkap" } as const;
const TONE = { draf: "bg-secondary text-secondary-foreground", perlu_dicek: "bg-kunyit text-amber-950", lengkap: "bg-pandan text-green-950" } as const;
const h2 = "font-display text-2xl font-semibold";

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
  const ingredients = lines(r.ingredientsText);
  const steps = lines(r.stepsText);
  const dishes = r.photos.filter((p) => p.kind === "masakan");
  const writings = r.photos.filter((p) => p.kind === "tulisan_asli");
  const meta = [r.owner?.name, r.servings, r.cookTime, r.difficulty && r.difficulty[0].toUpperCase() + r.difficulty.slice(1)].filter(Boolean);

  return (
    <main className="mx-auto flex max-w-[680px] flex-col gap-5">
      <Link href="/resep" className="flex min-h-12 w-fit items-center gap-2 font-semibold text-primary"><ArrowLeft aria-hidden /> Kembali</Link>

      <Flash ok={typeof ok === "string" ? ok : undefined} />

      {/* Satu tombol utama per layar: memilih resep, lalu menandai selesai. */}
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

      {/* Teks baca mengikuti ukuran huruf pilihan akun; elemen di dalamnya tidak memberi ukuran sendiri. */}
      <article className="flex flex-col gap-6 rounded-lg bg-background p-5 lg:p-8" style={{ fontSize: FONT_SIZE[user.fontSize] }}>
        <header className="flex flex-col gap-2">
          <p className="font-semibold text-muted-foreground">{r.category?.name ?? "Tanpa kategori"}</p>
          <h1 className="font-display text-3xl font-semibold lg:text-4xl">{r.title}</h1>
          {meta.length > 0 && <p className="text-muted-foreground">{meta.join(" · ")}</p>}
          <div><Badge className={TONE[r.status]}>{STATUS[r.status]}</Badge></div>
        </header>

        {dishes.length > 0 && (
          <section className="flex flex-col gap-3">
            {dishes.map((p) => <CloudImg key={p.id} src={large(p.cloudinaryPublicId)} alt={`Foto ${r.title}`} width={p.width} height={p.height} className="w-full rounded-lg" />)}
          </section>
        )}

        <section>
          <h2 className={h2}>Bahan</h2>
          {ingredients.length ? <ul className="mt-2 flex list-disc flex-col gap-1 pl-6">{ingredients.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p className="mt-2 text-muted-foreground">Bahan belum ditulis.</p>}
        </section>

        <section>
          <h2 className={h2}>Langkah</h2>
          {steps.length ? <ol className="mt-2 flex list-decimal flex-col gap-3 pl-6">{steps.map((x, i) => <li key={i}>{x}</li>)}</ol> : <p className="mt-2 text-muted-foreground">Langkah belum ditulis.</p>}
        </section>

        {r.originStory && <section><h2 className={h2}>Cerita di balik resep</h2><p className="mt-2 whitespace-pre-line">{r.originStory}</p></section>}
        {r.memoryNote && <section><h2 className={h2}>Catatan kenangan</h2><p className="mt-2 whitespace-pre-line">{r.memoryNote}</p></section>}

        {writings.length > 0 && (
          <section>
            <h2 className={h2}>Tulisan asli</h2>
            <div className="mt-2 flex flex-col gap-3">
              {writings.map((p) => (
                <figure key={p.id} className="flex flex-col gap-1">
                  <CloudImg src={large(p.cloudinaryPublicId)} alt={`Tulisan asli resep ${r.title}`} width={p.width} height={p.height} className="w-full rounded-lg border" />
                  <a href={original(p.cloudinaryPublicId)} target="_blank" rel="noreferrer" className="min-h-12 content-center text-base font-semibold text-primary underline">Buka ukuran penuh</a>
                </figure>
              ))}
            </div>
          </section>
        )}

        <p className="text-sm text-muted-foreground">Terakhir diubah oleh {r.updatedBy.name}, {r.updatedAt.toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" })}.</p>
      </article>

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
