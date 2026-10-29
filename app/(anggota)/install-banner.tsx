"use client";

import { useState, useSyncExternalStore } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstall } from "./use-install";

const KEY = "dapuruti-pasang-ditutup";
const never = () => () => {};
// localStorage bisa dilarang (mode privat); bila gagal, banner dianggap belum pernah ditutup.
const closedBefore = () => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } };

// Muncul otomatis hanya saat browser benar-benar menawarkan pemasangan; sekali ditutup tidak muncul lagi.
export function InstallBanner() {
  const { installed, canInstall, install } = useInstall();
  const closed = useSyncExternalStore(never, closedBefore, () => true);
  const [hidden, setHidden] = useState(false);
  if (installed || !canInstall || closed || hidden) return null;

  const close = () => { setHidden(true); try { localStorage.setItem(KEY, "1"); } catch {} };
  return (
    <section className="flex flex-col gap-3 rounded-lg bg-primary p-4 text-primary-foreground sm:flex-row sm:items-center sm:justify-between" aria-label="Pasang aplikasi">
      <p className="font-semibold">Pasang Dapur Uti di layar utama HP agar lebih cepat dibuka.</p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="lg" className="flex-1 text-foreground sm:flex-none" onClick={install}><Download aria-hidden /> Pasang aplikasi</Button>
        <Button type="button" variant="ghost" size="lg" className="hover:bg-primary-foreground/15 hover:text-primary-foreground" onClick={close}><X aria-hidden /> Tutup</Button>
      </div>
    </section>
  );
}
