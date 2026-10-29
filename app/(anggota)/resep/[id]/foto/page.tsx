import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { thumb } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { PhotoManager } from "./photo-manager";

export default async function FotoResep(props: PageProps<"/resep/[id]/foto">) {
  const { id } = await props.params;
  const r = await prisma.recipe.findFirst({
    where: { id, deletedAt: null },
    select: { title: true, photos: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
  });
  if (!r) notFound();
  return (
    <main className="mx-auto flex max-w-[680px] flex-col gap-5">
      <Link href={`/resep/${id}`} className="flex min-h-12 w-fit items-center gap-2 font-semibold text-primary"><ArrowLeft aria-hidden /> Kembali ke resep</Link>
      <h1 className="font-display text-3xl font-semibold">Foto untuk {r.title}</h1>
      <p className="text-muted-foreground">Foto dikecilkan otomatis sebelum diunggah, jadi hemat kuota.</p>
      <PhotoManager recipeId={id} photos={r.photos.map((p) => ({ id: p.id, kind: p.kind, src: thumb(p.cloudinaryPublicId) }))} />
    </main>
  );
}
