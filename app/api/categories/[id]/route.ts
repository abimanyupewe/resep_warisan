import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { currentUser, forbidden, unauthorized } from "@/lib/recipes";

export async function PATCH(req: Request, ctx: RouteContext<"/api/categories/[id]">) {
  const user = await currentUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();
  const { id } = await ctx.params;
  const { name, sortOrder } = (await req.json().catch(() => ({}))) as { name?: unknown; sortOrder?: unknown };
  if (name !== undefined && (typeof name !== "string" || !name.trim()))
    return Response.json({ error: "Nama wajib diisi" }, { status: 400 });
  const data = {
    name: typeof name === "string" ? name.trim() : undefined,
    sortOrder: typeof sortOrder === "number" ? sortOrder : undefined,
  };
  const { count } = await prisma.category.updateMany({ where: { id }, data });
  if (!count) return Response.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
  await audit(user.id, "category.update", "category", id, { fields: Object.keys(data).filter((k) => data[k as keyof typeof data] !== undefined) });
  return Response.json(await prisma.category.findUnique({ where: { id } }));
}

// Kategori yang masih dipakai resep (termasuk di sampah) tidak boleh dihapus.
export async function DELETE(_req: Request, ctx: RouteContext<"/api/categories/[id]">) {
  const user = await currentUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();
  const { id } = await ctx.params;
  if (await prisma.recipe.count({ where: { categoryId: id } }))
    return Response.json({ error: "Kategori masih dipakai resep" }, { status: 409 });
  const { count } = await prisma.category.deleteMany({ where: { id } });
  if (!count) return Response.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
  await audit(user.id, "category.delete", "category", id);
  return new Response(null, { status: 204 });
}
