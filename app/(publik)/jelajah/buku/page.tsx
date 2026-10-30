import { BookBuilder } from "../../../(anggota)/buku/book-builder";
import { connection } from "next/server";
import { bookOptions } from "@/lib/book";

export const metadata = { title: "Buku resep · Dapur Uti" };
// Membaca database saat request, jadi tidak punya cangkang statis (sama seperti halaman publik lain).
export const instant = false;

// Versi pengunjung dari halaman Buku: isinya sama, hanya resep yang sudah tampil di halaman umum.
export default async function BukuPublik() {
  // Membaca database saat request, bukan saat build.
  await connection();
  const options = await bookOptions();
  return (
    <main className="mx-auto flex max-w-[680px] flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-semibold">Buku resep</h1>
        <p className="text-muted-foreground">Unduh resep keluarga sebagai buku PDF ukuran A5, lengkap dengan sampul, daftar isi, dan nomor halaman. Siap dicetak.</p>
      </header>
      <BookBuilder {...options} />
    </main>
  );
}
