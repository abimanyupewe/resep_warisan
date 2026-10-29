import { requireUser } from "@/lib/member";
import { MemberNav } from "./member-nav";

// Seluruh area anggota bergantung pada sesi (cookie), jadi tidak punya cangkang statis.
export const instant = false;

export default async function MemberLayout({ children }: LayoutProps<"/">) {
  await requireUser();
  return (
    <div className="min-h-screen bg-muted pb-24 lg:pb-0">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2 lg:px-8">
          <p className="font-display text-2xl font-semibold">Dapur Uti</p>
          <MemberNav variant="top" />
        </div>
      </header>
      <MemberNav variant="tabs" />
      <div className="mx-auto w-full max-w-5xl p-4 lg:p-8">{children}</div>
    </div>
  );
}
