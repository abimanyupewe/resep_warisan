import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { RecipeForm } from "../../recipe-form";

const order = [{ sortOrder: "asc" }, { name: "asc" }] as const;

export default async function UbahResep(props: PageProps<"/resep/[id]/ubah">) {
  await requireUser();
  const { id } = await props.params;
  const [r, categories, people] = await Promise.all([
    prisma.recipe.findFirst({ where: { id, deletedAt: null } }),
    prisma.category.findMany({ orderBy: [...order], select: { id: true, name: true } }),
    prisma.person.findMany({ orderBy: [...order], select: { id: true, name: true } }),
  ]);
  if (!r) notFound();
  return (
    <main className="mx-auto flex max-w-[680px] flex-col gap-5">
      <Link href={`/resep/${id}`} className="flex min-h-12 w-fit items-center gap-2 font-semibold text-primary"><ArrowLeft aria-hidden /> Kembali</Link>
      <h1 className="font-display text-3xl font-semibold">Ubah resep</h1>
      <p className="text-muted-foreground">Setiap simpan membuat satu versi, jadi isi lama tidak hilang.</p>
      <RecipeForm
        id={id}
        categories={categories}
        people={people}
        initial={{
          title: r.title, categoryId: r.categoryId ?? "", ownerPersonId: r.ownerPersonId ?? "", ingredientsText: r.ingredientsText ?? "",
          stepsText: r.stepsText ?? "", originStory: r.originStory ?? "", memoryNote: r.memoryNote ?? "", servings: r.servings ?? "",
          cookTime: r.cookTime ?? "", difficulty: r.difficulty ?? "", status: r.status,
        }}
      />
    </main>
  );
}
