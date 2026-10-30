"use server";

import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { badRefs, parseRecipeInput, saveRevision } from "@/lib/recipes";
import { NEW_REF } from "./new-ref";

const NAME_MAX = 60;

// Mengembalikan pesan galat agar form tetap terisi; bila berhasil, langsung pindah ke halaman resep.
export async function saveRecipe(id: string | null, formData: FormData): Promise<{ error: string }> {
  const user = await requireUser();
  const text = (k: string) => String(formData.get(k) ?? "").trim() || null;
  // Pilihan "Buat baru": null = tidak dipilih, "" = dipilih tapi nama kosong, selain itu nama barunya.
  const fresh = (field: string, nameField: string) => (formData.get(field) === NEW_REF ? (text(nameField) ?? "") : null);
  const newCategory = fresh("categoryId", "newCategory");
  const newOwner = fresh("ownerPersonId", "newOwner");
  if (newCategory === "") return { error: "Isi nama kategori baru" };
  if (newOwner === "") return { error: "Isi nama pemilik baru" };
  if ((newCategory?.length ?? 0) > NAME_MAX || (newOwner?.length ?? 0) > NAME_MAX) return { error: `Nama maksimal ${NAME_MAX} huruf` };
  const data = parseRecipeInput(
    {
      title: text("title") ?? "",
      categoryId: newCategory === null ? text("categoryId") : null,
      ownerPersonId: newOwner === null ? text("ownerPersonId") : null,
      ingredientsText: text("ingredientsText"),
      stepsText: text("stepsText"),
      originStory: text("originStory"),
      memoryNote: text("memoryNote"),
      servings: text("servings"),
      cookTime: text("cookTime"),
      difficulty: text("difficulty"),
      // Form tidak punya kolom status: resep baru langsung terbaca ("draf" disembunyikan dari publik), suntingan tidak mengubahnya.
      ...(id ? {} : { status: "lengkap" }),
    },
    id !== null,
  );
  if (typeof data === "string") return { error: data };
  const bad = await badRefs(data);
  if (bad) return { error: ((await bad.json()) as { error: string }).error };

  const created: { type: "category" | "person"; id: string; name: string }[] = [];
  const recipe = await prisma.$transaction(async (tx) => {
    if (id && !(await tx.recipe.findFirst({ where: { id, deletedAt: null }, select: { id: true } }))) return null;
    // Dibuat dalam transaksi yang sama dengan resep agar tidak ada kategori/pemilik yatim bila simpan gagal. Nama yang sudah ada dipakai ulang.
    if (newCategory) {
      let c = await tx.category.findFirst({ where: { name: { equals: newCategory, mode: "insensitive" } } });
      if (!c) {
        const max = await tx.category.aggregate({ _max: { sortOrder: true } });
        c = await tx.category.create({ data: { name: newCategory, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
        created.push({ type: "category", id: c.id, name: c.name });
      }
      data.categoryId = c.id;
    }
    if (newOwner) {
      let p = await tx.person.findFirst({ where: { name: { equals: newOwner, mode: "insensitive" } } });
      if (!p) {
        const max = await tx.person.aggregate({ _max: { sortOrder: true } });
        p = await tx.person.create({ data: { name: newOwner, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
        created.push({ type: "person", id: p.id, name: p.name });
      }
      data.ownerPersonId = p.id;
    }
    const r = id
      ? await tx.recipe.update({ where: { id }, data: { ...data, updatedById: user.id } })
      : await tx.recipe.create({ data: { ...data, title: data.title as string, createdById: user.id, updatedById: user.id } });
    await saveRevision(tx, r, user.id);
    return r;
  });
  if (!recipe) return { error: "Resep ini sudah dipindah ke tempat sampah." };
  for (const c of created) await audit(user.id, `${c.type}.create`, c.type, c.id, { name: c.name });
  await audit(user.id, id ? "recipe.update" : "recipe.create", "recipe", recipe.id, id ? { fields: Object.keys(data) } : { title: recipe.title });
  redirect(`/resep/${recipe.id}`);
}

// Pindah ke tempat sampah; tidak benar-benar dihapus.
export async function trashRecipe(id: string) {
  const user = await requireUser();
  const { count } = await prisma.recipe.updateMany({ where: { id, deletedAt: null }, data: { deletedAt: new Date(), updatedById: user.id } });
  if (count) await audit(user.id, "recipe.trash", "recipe", id);
  redirect(`/resep?ok=${encodeURIComponent(count ? "Resep dipindah ke tempat sampah" : "Resep sudah tidak ada")}`);
}

// "Pilih resep": anggota menandai resep yang akan dimasak; satu pilihan aktif per resep.
export async function startCook(recipeId: string) {
  const user = await requireUser();
  if (!(await prisma.recipe.count({ where: { id: recipeId, deletedAt: null } }))) redirect(`/resep?error=${encodeURIComponent("Resep tidak ditemukan")}`);
  if (!(await prisma.cookLog.count({ where: { userId: user.id, recipeId, finishedAt: null } }))) await prisma.cookLog.create({ data: { userId: user.id, recipeId } });
  redirect(`/resep/${recipeId}?ok=${encodeURIComponent("Resep dipilih. Selamat memasak!")}`);
}

export async function finishCook(recipeId: string, back: "resep" | "beranda" | "riwayat") {
  const user = await requireUser();
  await prisma.cookLog.updateMany({ where: { userId: user.id, recipeId, finishedAt: null }, data: { finishedAt: new Date() } });
  const ok = encodeURIComponent("Ditandai sudah selesai. Selamat makan!");
  redirect(back === "beranda" ? `/beranda?ok=${ok}` : back === "riwayat" ? `/riwayat?ok=${ok}` : `/resep/${recipeId}?ok=${ok}`);
}

// Salah pilih: pilihan yang belum selesai dibatalkan dan tidak masuk riwayat.
export async function cancelCook(recipeId: string) {
  const user = await requireUser();
  await prisma.cookLog.deleteMany({ where: { userId: user.id, recipeId, finishedAt: null } });
  redirect(`/resep/${recipeId}?ok=${encodeURIComponent("Pilihan dibatalkan")}`);
}
