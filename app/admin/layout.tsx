import Image from "next/image";
import { LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { AdminNav } from "./nav";
import { MobileMenu } from "./mobile-menu";

export const metadata = { title: "Admin · Dapur Uti" };
// Seluruh area admin bergantung pada sesi (cookie), jadi tidak punya cangkang statis.
export const instant = false;

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen bg-muted md:flex">
      {/* HP: bilah atas dengan hamburger yang membuka sidebar sebagai laci. Desktop: sidebar tetap. */}
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b bg-background px-2 py-2 md:hidden">
        <MobileMenu email={admin.email} />
        <p className="flex items-center gap-2 font-display text-xl font-semibold">
          <Image src="/icons/icon-192.png" alt="" width={32} height={32} className="size-8 rounded-full" />
          Dapur Uti
        </p>
      </header>

      <aside className="hidden border-r bg-background md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col">
        <div className="flex items-center gap-3 px-6 pb-2 pt-6">
          <Image src="/icons/icon-192.png" alt="" width={44} height={44} className="size-11 rounded-full" />
          <p className="font-display text-2xl font-semibold">
            Dapur Uti <span className="block font-sans text-sm font-normal text-muted-foreground">Panel admin</span>
          </p>
        </div>
        <AdminNav />
        <div className="mt-auto flex flex-col gap-3 p-4">
          <span className="min-w-0 truncate text-sm text-muted-foreground">{admin.email}</span>
          <form action={logout}>
            <Button type="submit" variant="outline" className="w-full"><LogOut aria-hidden /> Keluar</Button>
          </form>
        </div>
      </aside>
      <div className="w-full max-w-5xl p-4 md:p-8">{children}</div>
    </div>
  );
}
