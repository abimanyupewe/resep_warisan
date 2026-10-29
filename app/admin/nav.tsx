"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, FolderTree, LayoutDashboard, ScrollText, Trash2, Users } from "lucide-react";

// [href, label menu samping, label tab bawah (HP), ikon]
const ITEMS = [
  ["/admin", "Ringkasan", "Beranda", LayoutDashboard],
  ["/admin/resep", "Resep", "Resep", ChefHat],
  ["/admin/anggota", "Anggota", "Anggota", Users],
  ["/admin/daftar", "Kategori & pemilik", "Kategori", FolderTree],
  ["/admin/sampah", "Sampah", "Sampah", Trash2],
  ["/admin/audit", "Log audit", "Audit", ScrollText],
] as const;

export function AdminNav({ variant }: { variant: "side" | "tabs" }) {
  const path = usePathname();
  const tabs = variant === "tabs";
  return (
    <nav
      aria-label="Menu admin"
      className={tabs
        ? "fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
        : "hidden flex-col gap-1 px-3 py-2 md:flex"}
    >
      {ITEMS.map(([href, label, short, Icon]) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        const cls = tabs
          ? `flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-semibold ${active ? "text-primary" : "text-muted-foreground"}`
          : `flex min-h-12 items-center gap-3 rounded-md px-3 font-semibold ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`;
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cls}>
            <Icon className={tabs ? "size-6" : "size-5"} aria-hidden />
            {tabs ? short : label}
          </Link>
        );
      })}
    </nav>
  );
}
