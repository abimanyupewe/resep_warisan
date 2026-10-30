import { bookOptions } from "@/lib/book";
import { requireUser } from "@/lib/member";
import { BookBuilder } from "./book-builder";

export const metadata = { title: "Buku resep · Dapur Uti" };

export default async function Buku() {
  await requireUser();
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
