// Data awal, aman dijalankan berulang:
//   npx tsx --env-file=.env scripts/seed.ts
// Membuat akun admin (ADMIN_EMAIL / ADMIN_PASSWORD di .env), kategori, dan pemilik resep "Uti".
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

const CATEGORIES = ["Makanan Utama", "Lauk", "Sayur", "Sambal", "Jajanan", "Kue", "Minuman"];

async function main() {
  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env;
  if (!email || !password) throw new Error("Isi ADMIN_EMAIL dan ADMIN_PASSWORD di .env");

  // Pendaftaran publik dimatikan dan createUser admin butuh sesi, jadi akun dibuat lewat adapter internal.
  const ctx = await auth.$context;
  const existing = await ctx.internalAdapter.findUserByEmail(email);
  if (existing) {
    await prisma.user.update({ where: { id: existing.user.id }, data: { role: "admin" } });
    console.log(`Admin sudah ada: ${email} (peran dipastikan admin, password tidak diubah)`);
  } else {
    const user = await ctx.internalAdapter.createUser({ email, name: "Admin", emailVerified: true, role: "admin" }, { method: "admin" });
    await ctx.internalAdapter.linkAccount({
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: await ctx.password.hash(password),
    });
    console.log(`Admin dibuat: ${email}`);
  }

  for (const [i, name] of CATEGORIES.entries()) {
    if (!(await prisma.category.findFirst({ where: { name } })))
      await prisma.category.create({ data: { name, sortOrder: i } });
  }
  if (!(await prisma.person.findFirst({ where: { name: "Uti" } })))
    await prisma.person.create({ data: { name: "Uti", relationNote: "Nenek" } });
  console.log("Kategori dan pemilik awal siap.");
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
