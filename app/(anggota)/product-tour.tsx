"use client";

import { useEffect } from "react";
import { CircleHelp } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Button } from "@/components/ui/button";

const KEY = "tour-anggota-selesai";

// Menu ada dua kali di DOM (bawah untuk HP, atas untuk desktop); ambil yang sedang tampil.
const visible = (sel: string) => () => [...document.querySelectorAll<HTMLElement>(sel)].find((e) => e.getClientRects().length > 0) ?? document.body;

export function startTour() {
  driver({
    showProgress: true,
    nextBtnText: "Lanjut",
    prevBtnText: "Kembali",
    doneBtnText: "Selesai",
    progressText: "{{current}} dari {{total}}",
    onDestroyed: () => { try { localStorage.setItem(KEY, "1"); } catch {} },
    steps: [
      { popover: { title: "Selamat datang di Dapur Uti", description: "Mari kenali menu-menunya sebentar." } },
      { element: visible('nav a[href="/beranda"]'), popover: { title: "Beranda", description: "Resep terbaru dan resep yang terakhir Anda buka." } },
      { element: visible('nav a[href="/resep"]'), popover: { title: "Resep", description: "Semua resep keluarga. Cari dan buka dari sini." } },
      { element: visible('nav a[href="/resep/baru"]'), popover: { title: "Tambah", description: "Tulis resep baru atau unggah foto tulisan tangan." } },
      { element: visible('nav a[href="/akun"]'), popover: { title: "Akun", description: "Atur ukuran huruf, pasang aplikasi, dan ulangi panduan ini." } },
    ],
  }).drive();
}

// Jalan otomatis sekali per perangkat; ulangi lewat tombol di halaman Akun.
export function ProductTour() {
  useEffect(() => {
    try { if (localStorage.getItem(KEY)) return; } catch { return; }
    startTour();
  }, []);
  return null;
}

export function TourButton() {
  return <Button type="button" variant="outline" size="lg" onClick={startTour}><CircleHelp aria-hidden /> Lihat panduan</Button>;
}
