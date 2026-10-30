"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { audit } from "@/lib/audit";
import { BOOK_COLORS, BOOK_FONT_SIZES } from "@/lib/book-config";
import { prisma } from "@/lib/prisma";

function done(msg: string, isError = false): never {
  // &t= membuat URL selalu baru agar halaman dimuat ulang dengan data tersimpan.
  redirect(`/admin/buku?${isError ? "error" : "ok"}=${encodeURIComponent(msg)}&t=${Date.now()}`);
}

// Satu baris pengaturan untuk seluruh buku: dibuat saat pertama disimpan, sesudah itu diperbarui.
export async function saveBook(formData: FormData) {
  const admin = await requireAdmin();
  const text = (k: string) => String(formData.get(k) ?? "").trim() || null;
  const limit = (v: string | null, max: number, name: string) => {
    if (v && v.length > max) done(`${name} maksimal ${max} huruf`, true);
    return v;
  };

  const title = limit(text("title"), 120, "Judul");
  if (!title) done("Judul buku wajib diisi", true);
  const subtitle = limit(text("subtitle"), 160, "Subjudul");
  const familyName = limit(text("familyName"), 80, "Nama keluarga");
  const dedicationText = limit(text("dedicationText"), 600, "Teks persembahan");
  const foreword = limit(text("foreword"), 4000, "Kata pengantar");

  const accentColor = String(formData.get("accentColor") ?? "");
  if (!BOOK_COLORS.some(([c]) => c === accentColor)) done("Warna aksen tidak valid", true);
  const fontSize = Number(formData.get("fontSize"));
  if (!(BOOK_FONT_SIZES as readonly number[]).includes(fontSize)) done("Ukuran huruf tidak valid", true);

  // Foto harus berjenis yang sesuai supaya tidak ada foto resep yang tertukar menjadi sampul.
  const photo = async (field: string, kind: "sampul" | "persembahan") => {
    const id = text(field);
    if (id && !(await prisma.photo.count({ where: { id, kind } }))) done("Foto tidak ditemukan, unggah ulang", true);
    return id;
  };
  const coverPhotoId = await photo("coverPhotoId", "sampul");
  const dedicationPhotoId = await photo("dedicationPhotoId", "persembahan");

  const flag = (k: string) => formData.get(k) === "on";
  const data = {
    title: title as string, subtitle, familyName, dedicationText, foreword, coverPhotoId, dedicationPhotoId,
    showDedication: flag("showDedication"), showForeword: flag("showForeword"), showToc: flag("showToc"),
    showDividers: flag("showDividers"), showStory: flag("showStory"), showMemory: flag("showMemory"),
    accentColor, fontSize,
  };
  const existing = await prisma.bookProfile.findFirst({ select: { id: true } });
  const row = existing ? await prisma.bookProfile.update({ where: { id: existing.id }, data }) : await prisma.bookProfile.create({ data });
  await audit(admin.id, `book.${existing ? "update" : "create"}`, "book", row.id, { title });
  done("Pengaturan buku disimpan");
}
