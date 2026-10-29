import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { currentUser, forbidden, unauthorized } from "@/lib/recipes";

export async function GET() {
  if (!(await currentUser())) return unauthorized();
  return Response.json(await prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }));
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();
  const { name, sortOrder } = (await req.json().catch(() => ({}))) as { name?: unknown; sortOrder?: unknown };
  if (typeof name !== "string" || !name.trim()) return Response.json({ error: "Nama wajib diisi" }, { status: 400 });
  const data = { name: name.trim(), sortOrder: typeof sortOrder === "number" ? sortOrder : 0 };
  const row = await prisma.category.create({ data });
  await audit(user.id, "category.create", "category", row.id, { name: row.name });
  return Response.json(row, { status: 201 });
}
