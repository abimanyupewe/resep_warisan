import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Kerangka bersama halaman masuk dan daftar: kartu form di tengah layar, tanpa logo atau judul agar bersih.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#fdf7ec] to-muted p-4">
      <div className="flex w-full max-w-md flex-col gap-6 py-8">
        <Link href="/" className="inline-flex min-h-12 items-center gap-1 self-start font-semibold text-muted-foreground hover:text-foreground hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> Kembali ke halaman depan
        </Link>
        {children}
      </div>
    </main>
  );
}
