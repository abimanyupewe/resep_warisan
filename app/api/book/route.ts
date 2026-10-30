import { bookData } from "@/lib/book";

// Isi buku untuk dibuat PDF di browser. Terbuka untuk semua orang karena hanya memuat resep yang memang
// sudah tampil di halaman publik (bukan draf, bukan di sampah).
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  return Response.json(await bookData({ categoryId: sp.get("categoryId") || undefined, ownerPersonId: sp.get("ownerPersonId") || undefined }));
}
