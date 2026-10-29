import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import type { ImportItem } from "@/lib/recipe-import";
import { saveRevision } from "@/lib/recipes";

const key = (s: string) => s.trim().toLowerCase();

// Untuk pratinjau: tandai resep yang judulnya sudah ada, dan kategori atau pemilik yang belum ada.
export async function annotate(items: ImportItem[]) {
  const [titles, cats, people] = await Promise.all([
    prisma.recipe.findMany({ where: { deletedAt: null }, select: { title: true } }),
    prisma.category.findMany({ select: { name: true } }),
    prisma.person.findMany({ select: { name: true } }),
  ]);
  const t = new Set(titles.map((x) => key(x.title))), c = new Set(cats.map((x) => key(x.name))), p = new Set(people.map((x) => key(x.name)));
  return items.map((it, index) => ({
    index, title: it.title, category: it.category, owner: it.owner, status: it.status, warnings: it.warnings,
    ingredients: it.ingredientsText?.split("\n").length ?? 0, steps: it.stepsText?.split("\n").length ?? 0,
    duplicate: t.has(key(it.title)), newCategory: !!it.category && !c.has(key(it.category)), newOwner: !!it.owner && !p.has(key(it.owner)),
  }));
}

// Membuat resep terpilih satu per satu (setiap resep + versinya satu transaksi), supaya satu yang gagal tidak membatalkan semuanya.
export async function commitImport(adminId: string, items: ImportItem[]) {
  const cats = new Map((await prisma.category.findMany()).map((c) => [key(c.name), c.id]));
  const people = new Map((await prisma.person.findMany()).map((p) => [key(p.name), p.id]));
  const made = { categories: [] as string[], people: [] as string[], recipeIds: [] as string[], failed: [] as string[] };

  for (const it of items) {
    try {
      let categoryId: string | null = null;
      if (it.category) {
        categoryId = cats.get(key(it.category)) ?? null;
        if (!categoryId) {
          categoryId = (await prisma.category.create({ data: { name: it.category, sortOrder: cats.size } })).id;
          cats.set(key(it.category), categoryId);
          made.categories.push(it.category);
        }
      }
      let ownerPersonId: string | null = null;
      if (it.owner) {
        ownerPersonId = people.get(key(it.owner)) ?? null;
        if (!ownerPersonId) {
          ownerPersonId = (await prisma.person.create({ data: { name: it.owner, sortOrder: people.size } })).id;
          people.set(key(it.owner), ownerPersonId);
          made.people.push(it.owner);
        }
      }
      const recipe = await prisma.$transaction(async (tx) => {
        const r = await tx.recipe.create({
          data: {
            title: it.title, categoryId, ownerPersonId, status: it.status, difficulty: it.difficulty, servings: it.servings, cookTime: it.cookTime,
            ingredientsText: it.ingredientsText, stepsText: it.stepsText, originStory: it.originStory, memoryNote: it.memoryNote,
            createdById: adminId, updatedById: adminId,
          },
        });
        await saveRevision(tx, r, adminId);
        return r;
      });
      made.recipeIds.push(recipe.id);
      await audit(adminId, "recipe.create", "recipe", recipe.id, { title: it.title, via: "import" });
    } catch {
      made.failed.push(it.title);
    }
  }
  await audit(adminId, "recipe.import", "recipe", undefined, { created: made.recipeIds.length, failed: made.failed.length });
  return made;
}
