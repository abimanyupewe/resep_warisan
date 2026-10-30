import Image from "next/image";
import Link from "next/link";

// Tanpa tahun hak cipta: new Date() di komponen server membuat Next.js menolak prerender (cacheComponents).
export function SiteFooter() {
  return (
    <footer className="mt-10 border-t bg-background">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Image src="/icons/icon-192.png" alt="" width={48} height={48} className="size-12 rounded-full" />
          <div>
            <p className="font-display text-xl font-semibold">Dapur Uti</p>
            <p className="text-sm text-muted-foreground">Resep warisan keluarga, dijaga bersama.</p>
          </div>
        </div>
        <Link href="/jelajah" className="min-h-12 content-center font-semibold hover:underline">Semua resep</Link>
      </div>
    </footer>
  );
}
