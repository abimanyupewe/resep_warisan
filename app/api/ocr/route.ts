import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { currentUser, unauthorized } from "@/lib/recipes";

const MAX_BYTES = 4 * 1024 * 1024; // di bawah batas body Vercel (4,5 MB); browser sudah mengecilkan foto
const prompt = (names: string[]) =>
  "Ini foto resep masakan Indonesia yang ditulis tangan. Baca seluruh tulisan dengan teliti, pakai konteks resep untuk menebak huruf yang tidak jelas. " +
  "Ambil judul resep jika tertulis di bagian atas (huruf diperbaiki ejaannya, tanpa coretan), kosongkan jika tidak ada. Pisahkan menjadi daftar bahan (satu bahan per item, lengkap dengan takarannya) dan langkah memasak (satu langkah per item, tanpa nomor). " +
  "Jika bahan terbagi dalam bagian (mis. adonan, bahan isi, bumbu isi, catatan), tulis judul bagian sebagai satu item sendiri berakhiran titik dua, lalu bahannya di bawahnya. " +
  "Perbaiki ejaan singkatan yang jelas (mis. \"daun pre\" menjadi \"daun prei\"). " +
  "Jangan menambah apa pun yang tidak tertulis. Jika bukan resep atau tidak terbaca, kembalikan kedua daftar kosong. " +
  `Untuk category, pilih satu nama yang paling cocok dengan judul dan bahan dari daftar ini: ${names.join(", ")}. Kosongkan jika tidak ada yang cocok.`;

// Sebagian besar kuota gratis dipakai bersama seluruh anggota, jadi batasnya global per 24 jam (dihitung dari audit log).
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return unauthorized();

  const limit = Number(process.env.OCR_DAILY_LIMIT) || 50;
  const used = await prisma.auditLog.count({ where: { action: "ocr.read", createdAt: { gte: new Date(Date.now() - 864e5) } } });
  if (used >= limit) return Response.json({ error: "Pembacaan foto hari ini sudah penuh. Coba lagi besok, atau ketik manual." }, { status: 429 });

  const file = (await req.formData().catch(() => null))?.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) return Response.json({ error: "Foto tidak valid." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Foto terlalu besar." }, { status: 413 });

  const categories = await prisma.category.findMany({ select: { id: true, name: true } });

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": process.env.GEMINI_API_KEY!, "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt(categories.map((c) => c.name)) }, { inline_data: { mime_type: file.type, data: Buffer.from(await file.arrayBuffer()).toString("base64") } }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: { title: { type: "STRING" }, category: { type: "STRING" }, ingredients: { type: "ARRAY", items: { type: "STRING" } }, steps: { type: "ARRAY", items: { type: "STRING" } } },
          required: ["title", "category", "ingredients", "steps"],
        },
      },
    }),
  });
  if (!res.ok) return Response.json({ error: "Layanan baca tulisan sedang bermasalah. Coba lagi nanti." }, { status: 502 });

  try {
    const text = (await res.json()).candidates[0].content.parts[0].text;
    const { title, category, ingredients, steps } = JSON.parse(text) as { title: string; category: string; ingredients: string[]; steps: string[] };
    const categoryId = categories.find((c) => c.name.toLowerCase() === category.trim().toLowerCase())?.id ?? "";
    await audit(user.id, "ocr.read", "recipe");
    return Response.json({ title, categoryId, ingredients, steps });
  } catch {
    return Response.json({ error: "Tulisan belum bisa dibaca. Coba foto yang lebih jelas." }, { status: 422 });
  }
}
