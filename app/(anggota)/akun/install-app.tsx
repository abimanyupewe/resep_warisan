"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useInstall } from "../use-install";

const STEPS = {
  android: ["Ketuk menu titik tiga di pojok kanan atas browser.", "Pilih \"Instal aplikasi\" atau \"Tambahkan ke layar utama\".", "Ketuk \"Instal\", lalu ikon Dapur Uti muncul di layar utama."],
  ios: ["Buka situs ini di Safari.", "Ketuk tombol Bagikan (kotak dengan panah ke atas).", "Pilih \"Tambah ke Layar Utama\", lalu ketuk \"Tambah\"."],
  desktop: ["Buka situs ini di Chrome atau Edge.", "Klik ikon pasang di ujung kanan kolom alamat, atau menu titik tiga lalu \"Instal Dapur Uti\".", "Untuk di HP, buka alamat yang sama dari HP Anda dan ulangi langkah di sana."],
} as const;

// Tombol selalu ada. Bila browser menyediakan pemasangan langsung, dialog Chrome terbuka; bila tidak
// (Firefox, iPhone, atau situs bukan https), tombol membuka panduan langkah demi langkah.
export function InstallApp() {
  const { installed, platform, secure, canInstall, install } = useInstall();
  const button = <Button type="button" size="lg" onClick={canInstall ? install : undefined}><Download aria-hidden /> Unduh aplikasi</Button>;

  return (
    <Card>
      <CardHeader><CardTitle className="font-display text-2xl font-semibold">Aplikasi di HP</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-3">
        {installed ? (
          <p>Aplikasi sudah terpasang di perangkat ini.</p>
        ) : (
          <>
            <p className="text-muted-foreground">Pasang Dapur Uti di layar utama agar bisa dibuka seperti aplikasi biasa.</p>
            {canInstall ? button : (
              <Dialog>
                <DialogTrigger render={<Button type="button" size="lg" />}><Download aria-hidden /> Unduh aplikasi</DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl font-semibold">Cara memasang aplikasi</DialogTitle>
                    <DialogDescription className="text-base">Browser Anda belum menyediakan pemasangan otomatis. Ikuti langkah ini:</DialogDescription>
                  </DialogHeader>
                  <ol className="flex flex-col gap-3">
                    {STEPS[platform].map((t, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary font-semibold text-primary-foreground" aria-hidden>{i + 1}</span>
                        <span className="pt-0.5">{t}</span>
                      </li>
                    ))}
                  </ol>
                  {!secure && <p className="rounded-lg bg-kunyit/50 p-3 text-sm">Alamat situs ini belum https, jadi pilihan pasang mungkin tidak muncul. Pemasangan penuh baru tersedia setelah aplikasi di-deploy dengan alamat https.</p>}
                  <DialogClose render={<Button variant="outline" size="lg" className="w-full" />}>Mengerti</DialogClose>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
