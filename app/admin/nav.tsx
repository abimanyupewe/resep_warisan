"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, ChefHat, CircleHelp, FolderTree, LayoutDashboard, ScrollText, Trash2, Users } from "lucide-react";

// [href, label, ikon]
const ITEMS = [
  ["/admin", "Ringkasan", LayoutDashboard],
  ["/admin/resep", "Resep", ChefHat],
  ["/admin/anggota", "Anggota", Users],
  ["/admin/daftar", "Kategori & pemilik", FolderTree],
  ["/admin/buku", "Buku", BookMarked],
  ["/admin/faq", "FAQ", CircleHelp],
  ["/admin/sampah", "Sampah", Trash2],
  ["/admin/audit", "Log audit", ScrollText],
] as const;

// Dipakai di sidebar desktop dan di laci HP; onNavigate menutup laci setelah memilih halaman.
export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav aria-label="Menu admin" className="flex flex-col gap-1 px-3 py-2">
      {ITEMS.map(([href, label, Icon]) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        const cls = `flex min-h-12 items-center gap-3 rounded-md px-3 font-semibold ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`;
        return (
          <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cls}>
            <Icon className="size-5" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
