import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { requireUser } from "@/lib/member";
import { MemberNav } from "./member-nav";
import { ProductTour } from "./product-tour";

// Seluruh area anggota bergantung pada sesi (cookie), jadi tidak punya cangkang statis.
export const instant = false;

export default async function MemberLayout({ children }: LayoutProps<"/">) {
  await requireUser();
  return (
    <div className="min-h-screen bg-muted pb-24 lg:pb-0">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2 lg:px-8">
          <p className="flex items-center gap-2 font-display text-2xl font-semibold">
            <Image src="/icons/icon-192.png" alt="" width={40} height={40} className="size-10 rounded-full" />
            Dapur Uti
          </p>
          <MemberNav variant="top" />
        </div>
      </header>
      <MemberNav variant="tabs" />
      <div className="mx-auto w-full max-w-5xl p-4 lg:p-8">{children}</div>
      {/* Di HP footer disembunyikan: navigasi bawah sudah memenuhi layar. */}
      <div className="hidden lg:block"><SiteFooter /></div>
      <ProductTour />
    </div>
  );
}
