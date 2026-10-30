import { CloudImg } from "@/components/cloud-img";
import { Badge } from "@/components/ui/badge";
import { large, original } from "@/lib/cloudinary";

const lines = (t: string | null) => (t ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
const STATUS = { draf: "Draf", perlu_dicek: "Perlu dicek", lengkap: "Lengkap" } as const;
const TONE = { draf: "bg-secondary text-secondary-foreground", perlu_dicek: "bg-kunyit text-amber-950", lengkap: "bg-pandan text-green-950" } as const;
const h2 = "font-display text-2xl font-semibold";

export type BodyRecipe = {
  title: string; status: keyof typeof STATUS; servings: string | null; cookTime: string | null; difficulty: string | null;
  ingredientsText: string | null; stepsText: string | null; originStory: string | null; memoryNote: string | null;
  category: { name: string } | null; owner: { name: string } | null;
  photos: { id: string; kind: string; cloudinaryPublicId: string; width: number; height: number }[];
};

// Isi resep untuk dibaca; dipakai halaman anggota dan halaman publik. fontSize mengikuti pilihan akun (hanya anggota).
export function RecipeBody({ r, fontSize }: { r: BodyRecipe; fontSize?: string }) {
  const ingredients = lines(r.ingredientsText);
  const steps = lines(r.stepsText);
  const dishes = r.photos.filter((p) => p.kind === "masakan");
  const writings = r.photos.filter((p) => p.kind === "tulisan_asli");
  const meta = [r.owner?.name, r.servings, r.cookTime, r.difficulty && r.difficulty[0].toUpperCase() + r.difficulty.slice(1)].filter(Boolean);

  return (
    // Elemen di dalamnya tidak memberi ukuran teks sendiri, jadi mengikuti fontSize artikel.
    <article className="flex flex-col gap-6 rounded-lg bg-background p-5 lg:p-8" style={fontSize ? { fontSize } : undefined}>
      <header className="flex flex-col gap-2">
        <p className="font-semibold text-muted-foreground">{r.category?.name ?? "Tanpa kategori"}</p>
        <h1 className="font-display text-3xl font-semibold lg:text-4xl">{r.title}</h1>
        {meta.length > 0 && <p className="text-muted-foreground">{meta.join(" · ")}</p>}
        <div><Badge className={TONE[r.status]}>{STATUS[r.status]}</Badge></div>
      </header>

      {dishes.length > 0 && (
        <section className="flex flex-col gap-3">
          {dishes.map((p) => <CloudImg key={p.id} src={large(p.cloudinaryPublicId)} alt={`Foto ${r.title}`} width={p.width} height={p.height} className="w-full rounded-lg" />)}
        </section>
      )}

      <section>
        <h2 className={h2}>Bahan</h2>
        {ingredients.length ? <ul className="mt-2 flex list-disc flex-col gap-1 pl-6">{ingredients.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p className="mt-2 text-muted-foreground">Bahan belum ditulis.</p>}
      </section>

      <section>
        <h2 className={h2}>Langkah</h2>
        {steps.length ? <ol className="mt-2 flex list-decimal flex-col gap-3 pl-6">{steps.map((x, i) => <li key={i}>{x}</li>)}</ol> : <p className="mt-2 text-muted-foreground">Langkah belum ditulis.</p>}
      </section>

      {r.originStory && <section><h2 className={h2}>Cerita di balik resep</h2><p className="mt-2 whitespace-pre-line">{r.originStory}</p></section>}
      {r.memoryNote && <section><h2 className={h2}>Catatan</h2><p className="mt-2 whitespace-pre-line">{r.memoryNote}</p></section>}

      {writings.length > 0 && (
        <section>
          <h2 className={h2}>Tulisan asli</h2>
          <div className="mt-2 flex flex-col gap-3">
            {writings.map((p) => (
              <figure key={p.id} className="flex flex-col gap-1">
                <CloudImg src={large(p.cloudinaryPublicId)} alt={`Tulisan asli resep ${r.title}`} width={p.width} height={p.height} className="w-full rounded-lg border" />
                <a href={original(p.cloudinaryPublicId)} target="_blank" rel="noreferrer" className="min-h-12 content-center text-base font-semibold text-primary underline">Buka ukuran penuh</a>
              </figure>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
