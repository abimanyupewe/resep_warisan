import { prisma } from "@/lib/prisma";
import { currentUser, unauthorized } from "@/lib/recipes";

// ?userId= &targetType= ; 200 catatan terbaru. shortcut: tanpa paginasi, tambah cursor bila log membesar.
export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return Response.json({ error: "Hanya admin" }, { status: 403 });
  const p = new URL(req.url).searchParams;
  return Response.json(
    await prisma.auditLog.findMany({
      where: { userId: p.get("userId") ?? undefined, targetType: p.get("targetType") ?? undefined },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  );
}
