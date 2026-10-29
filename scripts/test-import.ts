// Pemeriksaan impor resep: pengurai murni + impor sungguhan ke database (lalu dibersihkan).
//   npx tsx --env-file=.env scripts/test-import.ts
import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { parseImport } from "../lib/recipe-import";
import { annotate, commitImport } from "../lib/recipe-import-db";

const MD = `\`\`\`markdown
# Rawon Uji Impor
Kategori: Kategori Uji Impor
Pemilik: Pemilik Uji Impor
Porsi: 4 porsi
Waktu: 2 jam
Kesulitan: sulit
Status: lengkap

## Bahan
- 500 g daging [?]
- 3 buah keluak

## Langkah
1. Rebus daging.
2) Tumis bumbu.

## Cerita
Resep Uti untuk lebaran.

# Tanpa Bahan Uji
Kesulitan: ribet
\`\`\``;

const JSON_FENCED = '```json\n{"resep":[{"judul":"Opor Uji Impor","kategori":"Lauk","bahan":["1 ayam","santan"],"langkah":"Masak.\\nSajikan."},{"kategori":"tanpa judul"}]}\n```';

async function main() {
  // --- pengurai murni
  const md = parseImport(MD);
  assert.equal(md.items.length, 2);
  const [rawon, kosong] = md.items;
  assert.equal(rawon.title, "Rawon Uji Impor");
  assert.equal(rawon.category, "Kategori Uji Impor");
  assert.equal(rawon.status, "lengkap");
  assert.equal(rawon.difficulty, "sulit");
  assert.equal(rawon.ingredientsText, "500 g daging [?]\n3 buah keluak");
  assert.equal(rawon.stepsText, "Rebus daging.\nTumis bumbu."); // nomor "1." dan "2)" dibuang
  assert.equal(rawon.originStory, "Resep Uti untuk lebaran.");
  assert.equal(kosong.status, "perlu_dicek"); // bawaan untuk hasil baca tulisan tangan
  assert.equal(kosong.difficulty, null);
  assert.ok(kosong.warnings.some((w) => w.includes("Bahan kosong")) && kosong.warnings.some((w) => w.includes("tidak dikenal")));
  console.log("ok  Markdown: 2 resep, pembungkus ``` dibuang, nomor dan bullet dibuang, bawaan perlu_dicek");

  const js = parseImport(JSON_FENCED);
  assert.equal(js.items.length, 1);
  assert.equal(js.items[0].ingredientsText, "1 ayam\nsantan");
  assert.equal(js.errors.length, 1);
  assert.match(js.errors[0], /nomor 2 tidak punya judul/);
  console.log("ok  JSON berpembungkus: 1 resep valid, 1 dilewati karena tanpa judul");

  assert.match(parseImport('{"resep": [oops').errors[0], /JSON tidak valid/);
  assert.match(parseImport("   ").errors[0], /kosong/);
  assert.match(parseImport("teks biasa tanpa judul").errors[0], /Tidak ada resep/);
  assert.equal(parseImport(JSON.stringify([{ judul: "x" }, ...Array(60).fill({ judul: "y" })])).items.length, 50);
  console.log("ok  galat: JSON rusak, kosong, tanpa judul, dan batas 50 resep");

  // --- database
  const admin = await prisma.user.findFirstOrThrow({ where: { role: "admin" } });
  const before = { recipes: await prisma.recipe.count(), cats: await prisma.category.count(), people: await prisma.person.count() };
  const ann = await annotate(md.items);
  assert.equal(ann[0].newCategory, true);
  assert.equal(ann[0].newOwner, true);
  assert.equal(ann[0].duplicate, false);
  const res = await commitImport(admin.id, md.items);
  assert.equal(res.recipeIds.length, 2);
  assert.deepEqual(res.categories, ["Kategori Uji Impor"]);
  assert.deepEqual(res.people, ["Pemilik Uji Impor"]);
  const saved = await prisma.recipe.findUniqueOrThrow({ where: { id: res.recipeIds[0] }, include: { category: true, owner: true } });
  assert.equal(saved.category?.name, "Kategori Uji Impor");
  assert.equal(saved.owner?.name, "Pemilik Uji Impor");
  assert.equal(await prisma.recipeRevision.count({ where: { recipeId: saved.id } }), 1);
  console.log("ok  database: 2 resep, kategori dan pemilik baru dibuat, 1 versi per resep");

  const again = await annotate(md.items);
  assert.equal(again[0].duplicate, true);
  assert.equal(again[0].newCategory, false); // sekarang sudah ada
  console.log("ok  impor kedua kali: judul terdeteksi sudah ada, kategori tidak dianggap baru");

  // --- bersihkan
  await prisma.recipeRevision.deleteMany({ where: { recipeId: { in: res.recipeIds } } });
  await prisma.recipe.deleteMany({ where: { id: { in: res.recipeIds } } });
  await prisma.auditLog.deleteMany({ where: { OR: [{ targetId: { in: res.recipeIds } }, { action: "recipe.import", userId: admin.id, createdAt: { gte: new Date(Date.now() - 6e4) } }] } });
  await prisma.category.deleteMany({ where: { name: "Kategori Uji Impor" } });
  await prisma.person.deleteMany({ where: { name: "Pemilik Uji Impor" } });
  const after = { recipes: await prisma.recipe.count(), cats: await prisma.category.count(), people: await prisma.person.count() };
  assert.deepEqual(after, before);
  console.log("ok  data uji dibersihkan, jumlah data kembali seperti semula", after);
}
main().catch((e) => { console.error("GAGAL:", e.message); process.exit(1); }).finally(() => prisma.$disconnect());
