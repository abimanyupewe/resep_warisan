import { LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { AdminNav } from "./nav";

export const metadata = { title: "Admin · Dapur Uti" };
// Seluruh area admin bergantung pada sesi (cookie), jadi tidak punya cangkang statis.
export const instant = false;

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen bg-muted md:flex">
      {/* HP: bilah atas ringkas + tab bawah. Desktop: sidebar. */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background px-4 py-2 md:hidden">
        <p className="font-display text-xl font-semibold">Dapur Uti</p>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="icon" aria-label="Keluar"><LogOut aria-hidden /></Button>
        </form>
      </header>
      <AdminNav variant="tabs" />

      <aside className="hidden border-r bg-background md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col">
        <p className="font-display px-6 pb-2 pt-6 text-2xl font-semibold">
          Dapur Uti <span className="block font-sans text-sm font-normal text-muted-foreground">Panel admin</span>
        </p>
        <AdminNav variant="side" />
        <div className="mt-auto flex flex-col gap-3 p-4">
          <span className="min-w-0 truncate text-sm text-muted-foreground">{admin.email}</span>
          <form action={logout}>
            <Button type="submit" variant="outline" className="w-full"><LogOut aria-hidden /> Keluar</Button>
          </form>
        </div>
      </aside>
      <div className="w-full max-w-5xl p-4 pb-28 md:p-8">{children}</div>
    </div>
  );
}
