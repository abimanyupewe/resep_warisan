import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { currentUser, unauthorized } from "@/lib/recipes";

const KINDS = ["masakan", "tulisan_asli", "sampul", "persembahan", "tokoh"] as const;

// Daftarkan foto yang sudah diunggah ke Cloudinary.
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return unauthorized();
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const { recipeId, kind, publicId, width, height, caption, includeInBook, sortOrder } = b;
  if (!KINDS.includes(kind as (typeof KINDS)[number])) return Response.json({ error: "kind tidak valid" }, { status: 400 });
  // Hanya terima id dari folder kita, supaya tidak bisa mendaftarkan aset sembarang.
  if (typeof publicId !== "string" || !publicId.startsWith("dapur-uti/"))
    return Response.json({ error: "publicId tidak valid" }, { status: 400 });
  if (!Number.isInteger(width) || !Number.isInteger(height))
    return Response.json({ error: "width dan height harus bilangan bulat" }, { status: 400 });
  if (recipeId != null && (typeof recipeId !== "string" || !(await prisma.recipe.count({ where: { id: recipeId } }))))
    return Response.json({ error: "Resep tidak ditemukan" }, { status: 400 });
  const photo = await prisma.photo.create({
    data: {
      recipeId: (recipeId as string) ?? null,
      kind: kind as (typeof KINDS)[number],
      cloudinaryPublicId: publicId,
      width: width as number,
      height: height as number,
      caption: typeof caption === "string" ? caption : null,
      includeInBook: typeof includeInBook === "boolean" ? includeInBook : true,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      uploadedById: user.id,
    },
  });
  await audit(user.id, "photo.create", "photo", photo.id, { recipeId: photo.recipeId, kind: photo.kind });
  return Response.json(photo, { status: 201 });
}
