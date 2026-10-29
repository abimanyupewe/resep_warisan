import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { currentUser, unauthorized } from "@/lib/recipes";

export async function PATCH(req: Request, ctx: RouteContext<"/api/photos/[id]">) {
  const user = await currentUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const { caption, includeInBook, sortOrder } = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data = {
    caption: typeof caption === "string" || caption === null ? caption : undefined,
    includeInBook: typeof includeInBook === "boolean" ? includeInBook : undefined,
    sortOrder: typeof sortOrder === "number" ? sortOrder : undefined,
  };
  const { count } = await prisma.photo.updateMany({ where: { id }, data });
  if (!count) return Response.json({ error: "Foto tidak ditemukan" }, { status: 404 });
  await audit(user.id, "photo.update", "photo", id);
  return Response.json(await prisma.photo.findUnique({ where: { id } }));
}

// shortcut: hanya baris database yang dihapus, berkas di Cloudinary tetap ada (tidak menyentuh kuota berarti); bersihkan nanti bila perlu.
export async function DELETE(_req: Request, ctx: RouteContext<"/api/photos/[id]">) {
  const user = await currentUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const { count } = await prisma.photo.deleteMany({ where: { id } });
  if (!count) return Response.json({ error: "Foto tidak ditemukan" }, { status: 404 });
  await audit(user.id, "photo.delete", "photo", id);
  return new Response(null, { status: 204 });
}
