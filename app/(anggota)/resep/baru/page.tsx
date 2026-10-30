import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { RecipeForm } from "../recipe-form";

const order = [{ sortOrder: "asc" }, { name: "asc" }] as const;

export default async function ResepBaru() {
  await requireUser();
  const [categories, people] = await Promise.all([
    prisma.category.findMany({ orderBy: [...order], select: { id: true, name: true } }),
    prisma.person.findMany({ orderBy: [...order], select: { id: true, name: true } }),
  ]);
  return (
    <main className="mx-auto flex max-w-[680px] flex-col gap-5">
      <Link href="/resep" className="flex min-h-12 w-fit items-center gap-2 font-semibold text-primary"><ArrowLeft aria-hidden /> Kembali</Link>
      <h1 className="font-display text-3xl font-semibold">Tulis resep baru</h1>
      <p className="text-muted-foreground">Hanya judul yang wajib diisi. Sisanya bisa dilengkapi nanti.</p>
      <RecipeForm
        id={null}
        categories={categories}
        people={people}
        initial={{ title: "", categoryId: "", ownerPersonId: "", ingredientsText: "", stepsText: "", originStory: "", memoryNote: "", servings: "", cookTime: "", difficulty: "" }}
      />
    </main>
  );
}
