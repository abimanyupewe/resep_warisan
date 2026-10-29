// Data contoh untuk pengembangan (BUKAN untuk produksi), aman dijalankan berulang:
//   npx tsx --env-file=.env scripts/seed.ts        # admin + kategori dulu
//   npx tsx --env-file=.env scripts/seed-demo.ts
// Menambah 2 anggota (password: dapuruti123), pemilik, dan 8 resep contoh, satu di antaranya di sampah.
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { saveRevision } from "../lib/recipes";

const PASSWORD = "dapuruti123";
const MEMBERS = [
  ["Budhe Sri", "sri@example.com"],
  ["Mas Bayu", "bayu@example.com"],
];
const PEOPLE = [
  ["Uti", "Nenek"],
  ["Budhe Sri", "Kakak ibu"],
  ["Ibu", "Ibu"],
];

type Seed = [title: string, category: string, owner: string, status: "draf" | "perlu_dicek" | "lengkap", difficulty: "mudah" | "sedang" | "sulit", servings: string, cookTime: string, ingredients: string, steps: string, deleted?: boolean];

const RECIPES: Seed[] = [
  ["Soto Ayam Lamongan", "Makanan Utama", "Uti", "lengkap", "sedang", "6 porsi", "1,5 jam",
    "1 ekor ayam kampung\n2 liter air\n5 siung bawang putih\n1 sdm ketumbar\n3 cm kunyit\n2 batang serai\nKoya kerupuk udang",
    "Rebus ayam hingga empuk, angkat dan suwir.\nHaluskan bumbu, tumis hingga harum.\nMasukkan tumisan ke kaldu, masak 20 menit.\nSajikan dengan suwiran ayam dan koya."],
  ["Nasi Liwet", "Makanan Utama", "Budhe Sri", "lengkap", "mudah", "5 porsi", "45 menit",
    "3 gelas beras\n4 gelas santan encer\n3 lembar daun salam\n2 batang serai\nGaram secukupnya",
    "Cuci beras, campur semua bahan dalam panci.\nMasak sambil sesekali diaduk hingga air menyusut.\nKukus 20 menit sampai matang."],
  ["Ayam Goreng Kuning", "Lauk", "Uti", "perlu_dicek", "mudah", "4 porsi", "1 jam",
    "1 ekor ayam, potong 8\n4 siung bawang putih\n2 cm kunyit\n1 sdt ketumbar\nMinyak untuk menggoreng",
    "Ungkep ayam dengan bumbu halus hingga air habis.\nGoreng hingga kuning kecokelatan.\n(Takaran bumbu belum dipastikan, cek lagi dengan Uti)"],
  ["Sayur Lodeh", "Sayur", "Ibu", "lengkap", "sedang", "6 porsi", "50 menit",
    "300 g labu siam\n100 g kacang panjang\n1 buah terong\n500 ml santan\n5 buah cabai rawit",
    "Rebus santan dengan bumbu halus.\nMasukkan sayur dari yang paling keras.\nMasak hingga empuk, koreksi rasa."],
  ["Sambal Terasi", "Sambal", "Budhe Sri", "draf", "mudah", "", "15 menit",
    "10 cabai merah\n5 cabai rawit\n1 sdt terasi bakar\n1 buah tomat\nGaram dan gula",
    ""],
  ["Klepon", "Jajanan", "Uti", "perlu_dicek", "sulit", "30 butir", "1 jam",
    "250 g tepung ketan\n100 ml air daun pandan\nGula merah sisir\nKelapa parut kukus",
    "Campur tepung dan air pandan hingga kalis.\nIsi gula merah, bulatkan.\nRebus hingga mengapung, gulingkan di kelapa."],
  ["Bolu Kukus Pandan", "Kue", "Ibu", "lengkap", "mudah", "12 buah", "40 menit",
    "3 butir telur\n150 g gula\n200 g tepung terigu\n100 ml santan\nPasta pandan",
    "Kocok telur dan gula hingga mengembang.\nMasukkan tepung dan santan bergantian.\nKukus 20 menit dengan api besar."],
  ["Es Dawet Ayu", "Minuman", "Uti", "lengkap", "mudah", "4 gelas", "30 menit",
    "Dawet hijau\n150 g gula merah\n400 ml santan\nEs batu",
    "Rebus gula merah jadi sirup.\nSusun dawet, sirup, santan, dan es dalam gelas.", true],
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) throw new Error("Jalankan scripts/seed.ts dulu (akun admin belum ada).");
  const ctx = await auth.$context;

  const users = new Map<string, string>([["Admin", admin.id]]);
  for (const [name, email] of MEMBERS) {
    const found = await ctx.internalAdapter.findUserByEmail(email);
    let id = found?.user.id;
    if (!id) {
      const user = await ctx.internalAdapter.createUser({ email, name, emailVerified: true, role: "anggota" }, { method: "admin" });
      await ctx.internalAdapter.linkAccount({ userId: user.id, providerId: "credential", accountId: user.id, password: await ctx.password.hash(PASSWORD) });
      id = user.id;
    }
    users.set(name, id);
  }

  const people = new Map<string, string>();
  for (const [i, [name, relationNote]] of PEOPLE.entries()) {
    const p = (await prisma.person.findFirst({ where: { name } })) ?? (await prisma.person.create({ data: { name, relationNote, sortOrder: i } }));
    people.set(name, p.id);
  }

  const authors = [admin.id, users.get("Budhe Sri")!, users.get("Mas Bayu")!];
  for (const [i, [title, category, owner, status, difficulty, servings, cookTime, ingredientsText, stepsText, deleted]] of RECIPES.entries()) {
    if (await prisma.recipe.findFirst({ where: { title } })) continue;
    const cat = await prisma.category.findFirst({ where: { name: category } });
    const by = authors[i % authors.length];
    const recipe = await prisma.recipe.create({
      data: {
        title, categoryId: cat?.id, ownerPersonId: people.get(owner), status, difficulty,
        servings: servings || null, cookTime, ingredientsText, stepsText: stepsText || null,
        createdById: by, updatedById: by, deletedAt: deleted ? new Date() : null,
      },
    });
    await saveRevision(prisma, recipe, by);
    await prisma.auditLog.create({ data: { userId: by, action: "recipe.create", targetType: "recipe", targetId: recipe.id } });
  }
  console.log(`Data contoh siap. Anggota contoh: ${MEMBERS.map((m) => m[1]).join(", ")} (password ${PASSWORD}).`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
