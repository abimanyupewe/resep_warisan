import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function currentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export const unauthorized = () => Response.json({ error: "Belum masuk" }, { status: 401 });
export const forbidden = () => Response.json({ error: "Hanya admin" }, { status: 403 });
export const notFound = () => Response.json({ error: "Resep tidak ditemukan" }, { status: 404 });

const TEXT = ["title", "ingredientsText", "stepsText", "originStory", "memoryNote", "servings", "cookTime"] as const;
const REF = ["categoryId", "ownerPersonId"] as const;
const STATUS = ["draf", "perlu_dicek", "lengkap"];
const DIFFICULTY = ["mudah", "sedang", "sulit"];

// Ambil hanya kolom yang boleh diubah dari body; null berarti dikosongkan. Mengembalikan string jika tidak valid.
export function parseRecipeInput(body: unknown, partial: boolean): Record<string, unknown> | string {
  if (!body || typeof body !== "object") return "Isi tidak valid";
  const b = body as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of [...TEXT, ...REF]) {
    if (!(k in b)) continue;
    if (b[k] !== null && typeof b[k] !== "string") return `${k} harus berupa teks`;
    out[k] = b[k];
  }
  if ("status" in b) {
    if (!STATUS.includes(b.status as string)) return "status tidak valid";
    out.status = b.status;
  }
  if ("difficulty" in b) {
    if (b.difficulty !== null && !DIFFICULTY.includes(b.difficulty as string)) return "difficulty tidak valid";
    out.difficulty = b.difficulty;
  }
  if (!partial && (typeof out.title !== "string" || !out.title.trim())) return "Judul wajib diisi";
  if (partial && "title" in out && (typeof out.title !== "string" || !out.title.trim())) return "Judul wajib diisi";
  return out;
}

export const EDITABLE = [...TEXT, ...REF, "status", "difficulty"] as const;

// Setiap simpan membuat satu versi (snapshot kolom yang bisa diedit).
export async function saveRevision(
  tx: Pick<typeof prisma, "recipeRevision">,
  recipe: Record<string, unknown> & { id: string },
  userId: string,
) {
  const snapshot = Object.fromEntries(EDITABLE.map((k) => [k, recipe[k] ?? null]));
  return tx.recipeRevision.create({ data: { recipeId: recipe.id, snapshot, editedById: userId } });
}

// Pastikan kategori/pemilik yang dirujuk ada, supaya id salah jadi 400 dan bukan 500 dari database.
export async function badRefs(data: Record<string, unknown>) {
  const { categoryId, ownerPersonId } = data;
  if (typeof categoryId === "string" && !(await prisma.category.count({ where: { id: categoryId } })))
    return Response.json({ error: "Kategori tidak ditemukan" }, { status: 400 });
  if (typeof ownerPersonId === "string" && !(await prisma.person.count({ where: { id: ownerPersonId } })))
    return Response.json({ error: "Pemilik tidak ditemukan" }, { status: 400 });
  return null;
}
