"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

function done(msg: string, isError = false): never {
  // &t= membuat URL selalu baru agar modal di halaman menutup ulang.
  redirect(`/admin/faq?${isError ? "error" : "ok"}=${encodeURIComponent(msg)}&t=${Date.now()}`);
}

// id null = tambah baru. Urutan kecil tampil lebih dulu.
export async function saveFaq(id: string | null, formData: FormData) {
  const admin = await requireAdmin();
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) done("Pertanyaan dan jawaban wajib diisi", true);
  if (question.length > 200) done("Pertanyaan maksimal 200 huruf", true);
  if (answer.length > 2000) done("Jawaban maksimal 2000 huruf", true);
  const sortOrder = Number(formData.get("sortOrder") || 0);
  if (!Number.isInteger(sortOrder)) done("Urutan harus bilangan bulat", true);
  const published = formData.get("published") === "on";

  const data = { question, answer, sortOrder, published };
  const row = id ? await prisma.faq.update({ where: { id }, data }) : await prisma.faq.create({ data });
  await audit(admin.id, `faq.${id ? "update" : "create"}`, "faq", row.id, { question });
  done("FAQ disimpan");
}

export async function deleteFaq(id: string) {
  const admin = await requireAdmin();
  await prisma.faq.deleteMany({ where: { id } });
  await audit(admin.id, "faq.delete", "faq", id);
  done("FAQ dihapus");
}
