import { ImageResponse } from "next/og";

// Ikon aplikasi dibuat saat diminta: terakota dengan huruf "DU". Huruf diletakkan di zona aman
// (sekitar 40% lebar) supaya tidak terpotong saat Android memangkas ikon menjadi bentuk lain.
export function GET(req: Request) {
  const size = new URL(req.url).searchParams.get("size") === "192" ? 192 : 512;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#a0472a", color: "#ffffff", fontSize: size * 0.4, fontWeight: 700 }}>
        DU
      </div>
    ),
    { width: size, height: size, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}
