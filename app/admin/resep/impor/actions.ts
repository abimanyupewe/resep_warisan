"use server";

import { requireAdmin } from "@/lib/admin";
import { MAX_CHARS, parseImport } from "@/lib/recipe-import";
import { annotate, commitImport } from "@/lib/recipe-import-db";

// Tahap 1: baca berkas dan tampilkan pratinjau; belum ada yang disimpan.
export async function previewImport(text: string) {
  await requireAdmin();
  const { items, errors } = parseImport(String(text).slice(0, MAX_CHARS + 1));
  return { errors, items: await annotate(items) };
}

// Tahap 2: berkas dibaca ulang di server dan hanya nomor yang dipilih yang disimpan, jadi isi pratinjau tidak bisa dipalsukan.
export async function importRecipes(text: string, selected: number[]) {
  const admin = await requireAdmin();
  const { items } = parseImport(String(text).slice(0, MAX_CHARS + 1));
  const chosen = [...new Set(selected)].filter((i) => Number.isInteger(i) && items[i]).map((i) => items[i]);
  if (!chosen.length) return { created: 0, failed: [] as string[], categories: [] as string[], people: [] as string[], error: "Tidak ada resep yang dipilih." };
  const made = await commitImport(admin.id, chosen);
  return { created: made.recipeIds.length, failed: made.failed, categories: made.categories, people: made.people, error: "" };
}
