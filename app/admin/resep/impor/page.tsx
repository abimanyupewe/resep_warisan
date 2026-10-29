import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Importer, PromptBox } from "./importer";

// Impor menyimpan sampai 50 resep satu per satu; beri waktu lebih dari batas bawaan fungsi.
export const maxDuration = 60;

const RULES = `Aturan:
- Baca tulisan pada foto apa adanya. Jangan mengarang atau mengubah takaran.
- Satu bahan per baris dan satu langkah per baris.
- Bila ada tulisan yang tidak terbaca atau meragukan, tulis [?] di tempatnya dan isi status perlu_dicek.
- Bagian yang tidak ada di tulisan dikosongkan, jangan dikarang.
- Berikan hanya format di bawah, tanpa penjelasan lain.`;

export default async function ImporResep() {
  await requireAdmin();
  const [cats, people] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { name: true } }),
    prisma.person.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { name: true } }),
  ]);
  // Nama yang sudah ada disertakan supaya AI memakai penulisan yang sama dan tidak membuat duplikat.
  const choices = `Pilihan kategori yang sudah ada: ${cats.map((c) => c.name).join(", ") || "(belum ada)"}.\nPilihan pemilik resep yang sudah ada: ${people.map((p) => p.name).join(", ") || "(belum ada)"}.\nPakai nama dari daftar itu bila cocok; bila tidak ada yang cocok, tulis nama baru.`;
  const intro = "Saya akan mengirim foto resep masakan tulisan tangan. Tolong baca tulisannya, lalu ubah menjadi";

  const prompts = {
    markdown: `${intro} teks berformat Markdown persis seperti contoh. Satu resep diawali baris "# Judul Resep"; boleh beberapa resep dalam satu jawaban.\n\n${RULES}\n\n${choices}\n\nContoh:\n# Soto Ayam Lamongan\nKategori: Makanan Utama\nPemilik: Uti\nPorsi: 6 porsi\nWaktu: 1,5 jam\nKesulitan: sedang\nStatus: perlu_dicek\n\n## Bahan\n- 1 ekor ayam kampung\n- 5 siung bawang putih\n\n## Langkah\n1. Rebus ayam hingga empuk.\n2. Tumis bumbu halus.\n\n## Cerita\n(isi hanya bila ada ceritanya)\n\n## Catatan\n(isi hanya bila ada catatan atau kenangan)`,
    json: `${intro} JSON persis seperti contoh (satu objek untuk setiap resep di dalam larik "resep"). Kesulitan hanya boleh: mudah, sedang, atau sulit. Status hanya boleh: draf, perlu_dicek, atau lengkap.\n\n${RULES}\n\n${choices}\n\nContoh:\n{\n  "resep": [\n    {\n      "judul": "Soto Ayam Lamongan",\n      "kategori": "Makanan Utama",\n      "pemilik": "Uti",\n      "porsi": "6 porsi",\n      "waktu": "1,5 jam",\n      "kesulitan": "sedang",\n      "status": "perlu_dicek",\n      "bahan": ["1 ekor ayam kampung", "5 siung bawang putih"],\n      "langkah": ["Rebus ayam hingga empuk.", "Tumis bumbu halus."],\n      "cerita": "",\n      "catatan": ""\n    }\n  ]\n}`,
  };

  return (
    <main className="flex flex-col gap-6">
      <Link href="/admin/resep" className="flex min-h-12 w-fit items-center gap-2 font-semibold text-primary"><ArrowLeft aria-hidden /> Kembali ke daftar resep</Link>
      <header>
        <h1 className="font-display text-3xl font-semibold">Impor resep dari berkas</h1>
        <p className="text-muted-foreground">Foto resep tulisan tangan dibaca oleh AI di luar aplikasi, lalu hasilnya diunggah di sini. Semua resep hasil impor berstatus &quot;Perlu dicek&quot; sampai diperiksa. Foto aslinya bisa ditambahkan ke resep lewat menu Kelola foto.</p>
      </header>

      <Card>
        <CardHeader><CardTitle className="font-display text-2xl font-semibold">Langkah 1. Minta AI membaca foto</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p>Buka ChatGPT, Claude, atau Gemini, lampirkan foto resep (boleh beberapa), lalu tempel prompt ini. Simpan jawabannya sebagai berkas, atau salin langsung ke Langkah 2.</p>
          <PromptBox prompts={prompts} />
        </CardContent>
      </Card>

      <Importer />
    </main>
  );
}
