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
    background_color: "#ffffff",
    theme_color: "#a0472a",
    icons: [
      { src: "/pwa-icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon?size=512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
