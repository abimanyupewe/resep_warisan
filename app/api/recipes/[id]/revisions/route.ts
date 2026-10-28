import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { currentUser, EDITABLE, notFound, saveRevision, unauthorized } from "@/lib/recipes";

export async function GET(_req: Request, ctx: RouteContext<"/api/recipes/[id]/revisions">) {
  if (!(await currentUser())) return unauthorized();
  const { id } = await ctx.params;
  return Response.json(
    await prisma.recipeRevision.findMany({
      where: { recipeId: id },
      orderBy: { createdAt: "desc" },
      include: { editedBy: { select: { name: true } } },
    }),
  );
}

// Kembalikan versi: salin snapshot ke resep, lalu catat sebagai versi baru (riwayat tidak dihapus).
export async function POST(req: Request, ctx: RouteContext<"/api/recipes/[id]/revisions">) {
  const user = await currentUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const { revisionId } = (await req.json().catch(() => ({}))) as { revisionId?: string };
  const recipe = await prisma.$transaction(async (tx) => {
    const rev = revisionId && (await tx.recipeRevision.findFirst({ where: { id: revisionId, recipeId: id } }));
    if (!rev) return null;
    const snap = rev.snapshot as Record<string, unknown>;
    const data = Object.fromEntries(EDITABLE.map((k) => [k, snap[k] ?? null]));
    const r = await tx.recipe.update({ where: { id }, data: { ...data, updatedById: user.id } });
    await saveRevision(tx, r, user.id);
    return r;
  });
  if (!recipe) return notFound();
  await audit(user.id, "recipe.revert", "recipe", id, { revisionId });
  return Response.json(recipe);
}
