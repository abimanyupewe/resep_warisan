import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { badRefs, currentUser, parseRecipeInput, saveRevision, unauthorized } from "@/lib/recipes";

// ?q=judul/bahan &categoryId= &ownerPersonId= &status= &trash=1 (tempat sampah)
export async function GET(req: Request) {
  if (!(await currentUser())) return unauthorized();
  const p = new URL(req.url).searchParams;
  const q = p.get("q")?.trim();
  const status = p.get("status");
  const recipes = await prisma.recipe.findMany({
    where: {
      deletedAt: p.get("trash") ? { not: null } : null,
      categoryId: p.get("categoryId") ?? undefined,
      ownerPersonId: p.get("ownerPersonId") ?? undefined,
      status: status === "draf" || status === "perlu_dicek" || status === "lengkap" ? status : undefined,
      OR: q
        ? [
            { title: { contains: q, mode: "insensitive" } },
            { ingredientsText: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    select: { id: true, title: true, status: true, categoryId: true, ownerPersonId: true, updatedAt: true, deletedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 200, // shortcut: tanpa paginasi, cukup untuk 30-100 resep; tambahkan cursor bila lebih
  });
  return Response.json(recipes);
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return unauthorized();
  const data = parseRecipeInput(await req.json().catch(() => null), false);
  if (typeof data === "string") return Response.json({ error: data }, { status: 400 });
  const bad = await badRefs(data);
  if (bad) return bad;
  const recipe = await prisma.$transaction(async (tx) => {
    const r = await tx.recipe.create({ data: { ...data, title: data.title as string, createdById: user.id, updatedById: user.id } });
    await saveRevision(tx, r, user.id);
    return r;
  });
  await audit(user.id, "recipe.create", "recipe", recipe.id, { title: recipe.title });
  return Response.json(recipe, { status: 201 });
}
