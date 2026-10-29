import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { currentUser } from "@/lib/recipes";

// Bergantung pada sesi (header berbeda untuk yang sudah login), jadi tidak punya cangkang statis.
export const instant = false;
// Halaman publik untuk keluarga, bukan untuk mesin pencari. Hapus baris ini bila ingin muncul di Google.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const user = await currentUser();
  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2 lg:px-8">
          <Link href="/" className="font-display text-2xl font-semibold">Dapur Uti</Link>
          <nav aria-label="Menu" className="flex items-center gap-2">
            <Link href="/jelajah" className="hidden min-h-12 items-center px-3 font-semibold hover:underline sm:flex">Semua resep</Link>
            {user ? (
              <Link href="/beranda" className={buttonVariants()}>Buka aplikasi</Link>
            ) : (
              <>
                <Link href="/login" className={buttonVariants({ variant: "outline" })}>Masuk</Link>
                <Link href="/daftar" className={buttonVariants()}>Daftar</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl p-4 lg:p-8">{children}</div>
      <footer className="mx-auto max-w-5xl px-4 pb-8 text-sm text-muted-foreground lg:px-8">Dapur Uti · Resep warisan keluarga</footer>
    </div>
  );
}
