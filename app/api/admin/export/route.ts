import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { currentUser, unauthorized } from "@/lib/recipes";

// Backup manual: seluruh data aplikasi dalam satu berkas JSON. Hash password dan sesi sengaja tidak ikut.
export async function GET() {
  const user = await currentUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return Response.json({ error: "Hanya admin" }, { status: 403 });

  await audit(user.id, "data.export", "system");
  const [users, categories, people, recipes, photos, revisions, bookProfiles, auditLogs] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, banned: true, fontSize: true, createdAt: true } }),
    prisma.category.findMany(),
    prisma.person.findMany(),
    prisma.recipe.findMany(), // termasuk yang di tempat sampah
    prisma.photo.findMany(),
    prisma.recipeRevision.findMany(),
    prisma.bookProfile.findMany(),
    prisma.auditLog.findMany(),
  ]);
  const body = JSON.stringify({ exportedAt: new Date(), users, categories, people, recipes, photos, revisions, bookProfiles, auditLogs });
  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="dapur-uti-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
