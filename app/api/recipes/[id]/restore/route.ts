import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { currentUser, notFound, unauthorized } from "@/lib/recipes";

export async function POST(_req: Request, ctx: RouteContext<"/api/recipes/[id]/restore">) {
  const user = await currentUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const { count } = await prisma.recipe.updateMany({
    where: { id, deletedAt: { not: null } },
    data: { deletedAt: null, updatedById: user.id },
  });
  if (!count) return notFound();
  await audit(user.id, "recipe.restore", "recipe", id);
  return new Response(null, { status: 204 });
}
