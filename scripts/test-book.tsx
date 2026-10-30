// Uji pembuat PDF buku tanpa browser dan tanpa database: membuat PDF dari data contoh.
// @react-pdf/renderer hanya berupa modul ESM, sedangkan tsx memuat proyek ini sebagai CJS, jadi bundel dulu:
//   npx esbuild scripts/test-book.tsx --bundle --platform=node --format=esm --jsx=automatic --packages=external --outfile=node_modules/.cache/test-book.mjs
//   node node_modules/.cache/test-book.mjs <berkas-keluaran.pdf>
// Lalu periksa tata letak: pdftoppm -r 60 -png <berkas>.pdf <awalan>
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildBookPdf } from "../lib/book-pdf";
import type { BookData } from "../lib/book-config";

const out = process.argv[2];
if (!out) throw new Error("Pemakaian: node node_modules/.cache/test-book.mjs <berkas-keluaran.pdf> (lihat petunjuk bundel di kepala berkas)");

const long = Array.from({ length: 26 }, (_, i) => `Bahan nomor ${i + 1}, ditakar secukupnya sesuai selera keluarga`);
const steps = Array.from({ length: 14 }, (_, i) => `Langkah ${i + 1}: aduk perlahan sambil memastikan bumbu meresap merata ke seluruh bahan, lalu lanjutkan.`);
const recipe = (id: string, title: string, over: Partial<BookData["groups"][number]["recipes"][number]> = {}) => ({
  id, title, owner: "Uti", servings: "6 porsi", cookTime: "1,5 jam",
  ingredients: ["1 ekor ayam kampung", "5 siung bawang putih", "2 batang serai"],
  steps: ["Rebus ayam hingga empuk.", "Haluskan bumbu lalu tumis hingga harum."],
  story: "Resep ini selalu dimasak Uti setiap lebaran.", memory: "Rasanya selalu mengingatkan pada dapur rumah lama.", photoUrl: null, ...over,
});

const data: BookData = {
  total: 5,
  settings: {
    title: "Dapur Uti", subtitle: "Resep warisan keluarga", familyName: "Keluarga Besar Uti", coverUrl: null,
    dedicationText: "Untuk Uti, yang mengajari kami bahwa masakan adalah cara paling jujur untuk menyayangi.", dedicationUrl: null,
    foreword: "Buku ini lahir dari keinginan sederhana.\nKami tidak ingin rasa masakan Uti ikut hilang.",
    showDedication: true, showForeword: true, showToc: true, showDividers: true, showStory: true, showMemory: true,
    accentColor: "#a0472a", fontSize: 12,
  },
  groups: [
    { id: "lauk", name: "Lauk", recipes: [recipe("r1", "Ayam Goreng Kuning"), recipe("r2", "Opor Ayam Uti yang Sangat Panjang Judulnya Sampai Dua Baris", { ingredients: long, steps })] },
    { id: "sayur", name: "Sayur", recipes: [recipe("r3", "Sayur Lodeh", { story: null, memory: null }), recipe("r4", "Lodeh Tewel")] },
    { id: "tanpa-kategori", name: "Tanpa kategori", recipes: [recipe("r5", "Sambal Terasi", { owner: null, servings: null, cookTime: null })] },
  ],
};

buildBookPdf(data, { fontBase: resolve("public/fonts"), onProgress: (m) => console.log(m) })
  .then(async (blob) => {
    writeFileSync(out, Buffer.from(await blob.arrayBuffer()));
    console.log(`PDF dibuat: ${out} (${Math.round(blob.size / 1024)} KB)`);
  })
  .catch((e) => {
    console.error("Gagal:", e);
    process.exit(1);
  });
