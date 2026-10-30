import type { MetadataRoute } from "next";

// Aplikasi bisa dipasang ke layar utama HP. Tanpa service worker: halaman selalu diambil dari server
// supaya data resep dan sesi login tidak pernah basi. shortcut: belum ada mode offline, tambah bila diperlukan.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dapur Uti",
    short_name: "Dapur Uti",
    description: "Resep warisan keluarga",
    lang: "id",
    start_url: "/",
    scope: "/",
    display: "standalone",
    // Splash screen Android dibuat dari ikon + nama + warna latar ini; warna latar disamakan dengan latar logo.
    background_color: "#fdf7ec",
    theme_color: "#a0472a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
