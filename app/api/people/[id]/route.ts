import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { currentUser, forbidden, unauthorized } from "@/lib/recipes";

export async function PATCH(req: Request, ctx: RouteContext<"/api/people/[id]">) {
  const user = await currentUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();
  const { id } = await ctx.params;
  const { name, relationNote, sortOrder } = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (name !== undefined && (typeof name !== "string" || !name.trim()))
    return Response.json({ error: "Nama wajib diisi" }, { status: 400 });
  const data = {
    name: typeof name === "string" ? name.trim() : undefined,
    relationNote: typeof relationNote === "string" || relationNote === null ? relationNote : undefined,
    sortOrder: typeof sortOrder === "number" ? sortOrder : undefined,
  };
  const { count } = await prisma.person.updateMany({ where: { id }, data });
  if (!count) return Response.json({ error: "Pemilik tidak ditemukan" }, { status: 404 });
  await audit(user.id, "person.update", "person", id, { fields: Object.keys(data).filter((k) => data[k as keyof typeof data] !== undefined) });
  return Response.json(await prisma.person.findUnique({ where: { id } }));
}

// Pemilik yang masih punya resep (termasuk di sampah) tidak boleh dihapus.
export async function DELETE(_req: Request, ctx: RouteContext<"/api/people/[id]">) {
  const user = await currentUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();
  const { id } = await ctx.params;
  if (await prisma.recipe.count({ where: { ownerPersonId: id } }))
    return Response.json({ error: "Pemilik masih punya resep" }, { status: 409 });
  const { count } = await prisma.person.deleteMany({ where: { id } });
  if (!count) return Response.json({ error: "Pemilik tidak ditemukan" }, { status: 404 });
  await audit(user.id, "person.delete", "person", id);
  return new Response(null, { status: 204 });
}
