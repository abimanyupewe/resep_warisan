// Pulihkan data dari berkas hasil /api/admin/export ke database KOSONG:
//   npx tsx --env-file=.env scripts/restore.ts dapur-uti-2026-10-28.json
// Akun anggota dipulihkan tanpa password; admin harus mengatur ulang password lewat dashboard.
import { readFileSync } from "node:fs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client";

const file = process.argv[2];
if (!file) throw new Error("Pemakaian: npx tsx --env-file=.env scripts/restore.ts <berkas.json>");
const d = JSON.parse(readFileSync(file, "utf8"));
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  if ((await prisma.recipe.count()) + (await prisma.user.count()) > 0)
    throw new Error("Database tidak kosong; pulihkan ke cabang Neon baru.");

  await prisma.$transaction(async (tx) => {
    await tx.user.createMany({ data: d.users });
    await tx.category.createMany({ data: d.categories });
    // photoId diisi belakangan karena foto merujuk resep dan resep merujuk pemilik.
    await tx.person.createMany({ data: d.people.map((p: object) => ({ ...p, photoId: null })) });
    await tx.recipe.createMany({ data: d.recipes });
    await tx.photo.createMany({ data: d.photos });
    await tx.recipeRevision.createMany({ data: d.revisions });
    await tx.bookProfile.createMany({ data: d.bookProfiles });
      await tx.auditLog.createMany({ data: d.auditLogs ?? [] }); // backup lama belum punya log
    for (const p of d.people) if (p.photoId) await tx.person.update({ where: { id: p.id }, data: { photoId: p.photoId } });
  });

  console.log(`Selesai: ${d.recipes.length} resep, ${d.revisions.length} versi, ${d.photos.length} foto.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
