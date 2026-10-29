"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

type Kind = "category" | "person";
const LABEL = { category: "Kategori", person: "Pemilik" };

function done(msg: string, isError = false): never {
  // &t= membuat URL selalu baru agar modal di halaman menutup ulang.
  redirect(`/admin/daftar?${isError ? "error" : "ok"}=${encodeURIComponent(msg)}&t=${Date.now()}`);
}

// id null = tambah baru. Urutan lewat nomor manual. shortcut: bila terasa sulit, ganti dengan tombol naik/turun.
export async function saveItem(kind: Kind, id: string | null, formData: FormData) {
  const admin = await requireAdmin();
  if (!(kind in LABEL)) done("Jenis tidak valid", true);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) done("Nama wajib diisi", true);
  const sortOrder = Number(formData.get("sortOrder") || 0);
  if (!Number.isInteger(sortOrder)) done("Urutan harus bilangan bulat", true);
  const relationNote = String(formData.get("relationNote") ?? "").trim() || null;

  let row: { id: string };
  if (kind === "category") {
    const data = { name, sortOrder };
    row = id ? await prisma.category.update({ where: { id }, data }) : await prisma.category.create({ data });
  } else {
    const data = { name, sortOrder, relationNote };
    row = id ? await prisma.person.update({ where: { id }, data }) : await prisma.person.create({ data });
  }
  await audit(admin.id, `${kind}.${id ? "update" : "create"}`, kind, row.id, { name });
  done(`${LABEL[kind]} disimpan`);
}

export async function deleteItem(kind: Kind, id: string) {
  const admin = await requireAdmin();
  if (!(kind in LABEL)) done("Jenis tidak valid", true);
  // Hitung semua resep, termasuk yang di sampah, supaya tidak ada resep yatim.
  const used = await prisma.recipe.count({ where: kind === "category" ? { categoryId: id } : { ownerPersonId: id } });
  if (used) done(`${LABEL[kind]} masih dipakai ${used} resep`, true);
  await (kind === "category" ? prisma.category.deleteMany({ where: { id } }) : prisma.person.deleteMany({ where: { id } }));
  await audit(admin.id, `${kind}.delete`, kind, id);
  done(`${LABEL[kind]} dihapus`);
}
