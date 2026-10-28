import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { currentUser, unauthorized } from "@/lib/recipes";

export async function GET() {
  if (!(await currentUser())) return unauthorized();
  return Response.json(await prisma.person.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }));
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return unauthorized();
  const { name, relationNote, sortOrder } = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof name !== "string" || !name.trim()) return Response.json({ error: "Nama wajib diisi" }, { status: 400 });
  const data = {
    name: name.trim(),
    relationNote: typeof relationNote === "string" ? relationNote : null,
    sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
  };
  const row = await prisma.person.create({ data });
  await audit(user.id, "person.create", "person", row.id, { name: row.name });
  return Response.json(row, { status: 201 });
}
