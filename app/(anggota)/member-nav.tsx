"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, BookOpen, History, House, Plus, UserRound } from "lucide-react";

const ITEMS = [
  ["/beranda", "Beranda", House],
  ["/resep", "Resep", BookOpen],
  ["/riwayat", "Riwayat", History],
  ["/buku", "Buku", BookMarked],
  ["/resep/baru", "Tambah", Plus],
  ["/akun", "Akun", UserRound],
] as const;

export function MemberNav({ variant }: { variant: "tabs" | "top" }) {
  const path = usePathname();
  const tabs = variant === "tabs";
  return (
    <nav
      aria-label="Menu utama"
      // Jumlah kolom mengikuti jumlah menu, jadi tidak perlu diubah manual saat menu bertambah.
      style={tabs ? { gridTemplateColumns: `repeat(${ITEMS.length}, minmax(0, 1fr))` } : undefined}
      className={tabs
        ? "fixed inset-x-0 bottom-0 z-40 grid border-t bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
        : "hidden gap-1 lg:flex"}
    >
      {ITEMS.map(([href, label, Icon]) => {
        // Daftar, detail, dan ubah resep menyalakan Resep; hanya /resep/baru yang menyalakan Tambah.
        const active = href === "/beranda" ? path === "/beranda" : href === "/resep" ? path.startsWith("/resep") && !path.startsWith("/resep/baru") : path.startsWith(href);
        const cls = tabs
          ? `flex min-h-16 flex-col items-center justify-center gap-1 text-[15px] font-semibold leading-tight ${active ? "text-primary" : "text-muted-foreground"}`
          : `flex min-h-12 items-center gap-2 rounded-md px-4 font-semibold ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`;
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cls}>
            <Icon className={tabs ? "size-6" : "size-5"} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
