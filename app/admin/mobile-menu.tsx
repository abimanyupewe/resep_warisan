"use client";

import { useState } from "react";
import Image from "next/image";
import { LogOut, Menu } from "lucide-react";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdminNav } from "./nav";

// Sidebar admin di HP: laci dari kiri yang dibuka lewat ikon hamburger. Memakai Dialog agar fokus dan tombol Esc benar.
export function MobileMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="ghost" size="icon" aria-label="Buka menu" />}>
        <Menu aria-hidden />
      </DialogTrigger>
      <DialogContent
        className="top-0 left-0 flex h-full max-h-none w-72 max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-0 sm:max-w-none data-open:zoom-in-100 data-open:slide-in-from-left data-closed:zoom-out-100 data-closed:slide-out-to-left"
      >
        <DialogTitle className="sr-only">Menu admin</DialogTitle>
        <div className="flex items-center gap-3 px-6 pb-2 pt-6">
          <Image src="/icons/icon-192.png" alt="" width={44} height={44} className="size-11 rounded-full" />
          <p className="font-display text-2xl font-semibold">
            Dapur Uti <span className="block font-sans text-sm font-normal text-muted-foreground">Panel admin</span>
          </p>
        </div>
        <AdminNav onNavigate={() => setOpen(false)} />
        <div className="mt-auto flex flex-col gap-3 p-4">
          <span className="min-w-0 truncate text-sm text-muted-foreground">{email}</span>
          <form action={logout}>
            <Button type="submit" variant="outline" className="w-full"><LogOut aria-hidden /> Keluar</Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
