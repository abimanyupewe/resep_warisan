import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function Pager({ path, params, page, pages, total }: { path: string; params: Record<string, string>; page: number; pages: number; total: number }) {
  const href = (p: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) next.set(k, v);
    if (p > 1) next.set("page", String(p));
    return `${path}?${next}`;
  };
  const btn = (disabled: boolean) => `${buttonVariants({ variant: "outline" })} ${disabled ? "pointer-events-none opacity-50" : ""}`;
  return (
    <nav aria-label="Halaman" className="flex items-center justify-between gap-3 pt-4">
      <Link href={href(page - 1)} aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : undefined} className={btn(page <= 1)}>
        <ChevronLeft aria-hidden /> <span className="hidden sm:inline">Sebelumnya</span>
      </Link>
      <p className="text-center text-sm text-muted-foreground">Halaman {page} dari {pages}<br />{total} data</p>
      <Link href={href(page + 1)} aria-disabled={page >= pages} tabIndex={page >= pages ? -1 : undefined} className={btn(page >= pages)}>
        <span className="hidden sm:inline">Berikutnya</span> <ChevronRight aria-hidden />
      </Link>
    </nav>
  );
}
