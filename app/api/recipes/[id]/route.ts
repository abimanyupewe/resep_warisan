import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { badRefs, currentUser, notFound, parseRecipeInput, saveRevision, unauthorized } from "@/lib/recipes";

export async function GET(_req: Request, ctx: RouteContext<"/api/recipes/[id]">) {
  if (!(await currentUser())) return unauthorized();
  const { id } = await ctx.params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { photos: { orderBy: { sortOrder: "asc" } }, category: true, owner: true },
  });
  return recipe ? Response.json(recipe) : notFound();
}

export async function PATCH(req: Request, ctx: RouteContext<"/api/recipes/[id]">) {
  const user = await currentUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const data = parseRecipeInput(await req.json().catch(() => null), true);
  if (typeof data === "string") return Response.json({ error: data }, { status: 400 });
  const bad = await badRefs(data);
  if (bad) return bad;
  const recipe = await prisma.$transaction(async (tx) => {
    if (!(await tx.recipe.findFirst({ where: { id, deletedAt: null }, select: { id: true } }))) return null;
    const r = await tx.recipe.update({ where: { id }, data: { ...data, updatedById: user.id } });
    await saveRevision(tx, r, user.id);
    return r;
  });
  if (!recipe) return notFound();
  await audit(user.id, "recipe.update", "recipe", id, { fields: Object.keys(data) });
  return Response.json(recipe);
}

// Pindah ke tempat sampah; tidak benar-benar dihapus.
export async function DELETE(_req: Request, ctx: RouteContext<"/api/recipes/[id]">) {
  const user = await currentUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const { count } = await prisma.recipe.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date(), updatedById: user.id },
  });
  if (!count) return notFound();
  await audit(user.id, "recipe.trash", "recipe", id);
  return new Response(null, { status: 204 });
}
