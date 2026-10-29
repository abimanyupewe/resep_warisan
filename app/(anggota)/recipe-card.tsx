import Link from "next/link";
import { CloudImg } from "@/components/cloud-img";
import { Badge } from "@/components/ui/badge";
import { thumb } from "@/lib/cloudinary";

// Warna pastel kartu mengikuti urutan kategori, supaya resep sejenis mudah dikenali tanpa foto.
const TONES = ["bg-pandan", "bg-kunyit", "bg-jambu", "bg-telur", "bg-ubi"];
export const toneMap = (categories: { id: string }[]) => new Map(categories.map((c, i) => [c.id, TONES[i % TONES.length]]));

// Dipakai bersama oleh Beranda dan halaman Resep agar datanya selalu lengkap untuk kartu.
export const cardInclude = {
  category: true,
  owner: true,
  photos: { where: { kind: "masakan" as const }, orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }], take: 1 },
};

type Card = {
  id: string; title: string; categoryId: string | null; cookTime: string | null; status: string;
  category: { name: string } | null; owner: { name: string } | null; photos: { cloudinaryPublicId: string }[];
};

export function RecipeCard({ r, tone }: { r: Card; tone: Map<string, string> }) {
  return (
    <Link href={`/resep/${r.id}`} className="flex h-full flex-col overflow-hidden rounded-lg bg-background ring-1 ring-border hover:ring-primary">
      {r.photos[0] && <CloudImg src={thumb(r.photos[0].cloudinaryPublicId)} alt={`Foto ${r.title}`} width={600} height={400} className="aspect-[3/2] w-full object-cover" />}
      <span className={`px-4 py-2 text-sm font-semibold ${(r.categoryId && tone.get(r.categoryId)) || "bg-secondary"}`}>{r.category?.name ?? "Tanpa kategori"}</span>
      <span className="flex flex-1 flex-col gap-2 p-4">
        <span className="font-display text-xl font-semibold">{r.title}</span>
        <span className="text-muted-foreground">{[r.owner?.name, r.cookTime].filter(Boolean).join(" · ") || " "}</span>
        {r.status !== "lengkap" && <Badge className={r.status === "perlu_dicek" ? "bg-kunyit text-amber-950" : "bg-secondary text-secondary-foreground"}>{r.status === "perlu_dicek" ? "Perlu dicek" : "Draf"}</Badge>}
      </span>
    </Link>
  );
}
