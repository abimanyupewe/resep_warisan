// FAQ contoh untuk pengembangan (BUKAN untuk produksi). Aman dijalankan berulang:
//   npx tsx --env-file=.env scripts/seed-faq.ts
// Hanya menambah pertanyaan yang belum ada (dicocokkan lewat teks pertanyaan); yang sudah ada dan yang
// diubah admin tidak ditimpa. Di produksi, isi FAQ lewat halaman /admin/faq. Jangan jalankan dengan .env.prod.
import { prisma } from "../lib/prisma";

const FAQ: [question: string, answer: string][] = [
  ["Siapa yang boleh membaca resep?", "Siapa saja boleh membaca dan mencari resep, tanpa perlu akun. Resep yang masih berstatus draf tidak ditampilkan kepada pengunjung."],
  ["Bagaimana cara menambah resep?", "Daftar dulu lewat tombol Daftar. Akun langsung aktif, lalu pilih Tambah di menu untuk menulis resep. Bahan dan langkah ditulis satu per baris."],
  ["Bolehkah mengubah resep milik orang lain?", "Boleh. Semua anggota bisa mengubah semua resep. Setiap perubahan tersimpan sebagai versi, jadi resep bisa dikembalikan ke isi sebelumnya."],
  ["Bisakah menyimpan resep tulisan tangan?", "Bisa. Foto tulisan tangan dilampirkan pada resep, di samping bahan dan langkah yang diketik."],
  ["Resep yang dihapus apakah hilang selamanya?", "Tidak. Resep yang dihapus masuk ke tempat sampah dulu, dan admin bisa mengembalikannya."],
  ["Lupa password, bagaimana?", "Hubungi admin keluarga. Admin akan mengatur ulang password Anda."],
];

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Seed ini hanya untuk pengembangan.");
  let added = 0;
  for (const [i, [question, answer]] of FAQ.entries()) {
    if (await prisma.faq.findFirst({ where: { question }, select: { id: true } })) continue;
    await prisma.faq.create({ data: { question, answer, sortOrder: i + 1 } });
    added++;
  }
  console.log(`FAQ contoh siap: ${added} ditambah, ${FAQ.length - added} sudah ada.`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
