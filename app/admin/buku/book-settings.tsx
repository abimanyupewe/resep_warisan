"use client";

import { useRef, useState } from "react";
import { Camera, Eye, Save } from "lucide-react";
import { CloudImg } from "@/components/cloud-img";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type BookData, type BookGroup, type BookSettings as BookConfig, BOOK_COLORS, BOOK_FONT_SIZES } from "@/lib/book-config";
import { type PhotoKind, uploadPhoto } from "@/lib/upload-photo";
import { saveBook } from "./actions";

type Photo = { id: string; src: string; publicId: string } | null;
const cloudUrl = (publicId: string, transform: string) => `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transform}/${publicId}`;
export type BookValues = {
  title: string; subtitle: string; familyName: string; dedicationText: string; foreword: string;
  showDedication: boolean; showForeword: boolean; showToc: boolean; showDividers: boolean; showStory: boolean; showMemory: boolean;
  accentColor: string; fontSize: number;
};

const label = "flex flex-col gap-1 font-semibold";
const hint = "text-sm font-normal text-muted-foreground";
const SECTIONS: [keyof BookValues, string, string][] = [
  ["showDedication", "Persembahan", "Halaman teks dan foto persembahan"],
  ["showForeword", "Kata pengantar", "Halaman kata pengantar"],
  ["showToc", "Daftar isi", "Daftar kategori dan resep beserta nomor halaman"],
  ["showDividers", "Halaman pembatas kategori", "Satu halaman berisi nama kategori sebelum resepnya"],
  ["showStory", "Cerita resep", "Kotak cerita di balik resep"],
  ["showMemory", "Catatan resep", "Kotak catatan atau kenangan pada resep"],
];
const SIZE_LABEL: Record<number, string> = { 11: "Kecil", 12: "Normal", 14: "Besar" };

// Foto diunggah ke Cloudinary begitu dipilih, tetapi baru dipasang di buku saat tombol Simpan ditekan.
function PhotoSlot({ name, kind, title, note, photo, onChange, maxSide }: { name: string; kind: PhotoKind; title: string; note: string; photo: Photo; onChange: (p: Photo) => void; maxSide: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function pick(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const up = await uploadPhoto(file, { kind, maxSide });
      onChange({ id: up.id, publicId: up.cloudinaryPublicId, src: cloudUrl(up.cloudinaryPublicId, "c_fill,w_400,h_400,q_auto,f_auto") });
    } catch {
      setError("Foto belum terunggah. Periksa internet, lalu coba lagi.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold">{title}</span>
      <input type="hidden" name={name} value={photo?.id ?? ""} />
      {photo && <CloudImg src={photo.src} alt={title} className="size-32 rounded-lg object-cover" />}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => input.current?.click()} disabled={busy}>
          <Camera aria-hidden /> {busy ? "Mengunggah..." : photo ? "Ganti foto" : "Pilih foto"}
        </Button>
        {photo && <Button type="button" variant="ghost" onClick={() => onChange(null)} disabled={busy}>Hapus foto</Button>}
      </div>
      <input ref={input} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => pick(e.target.files)} />
      <p className={hint}>{note}</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// Dipakai bila belum ada resep sama sekali, supaya pratinjau tetap menunjukkan halaman resep.
const SAMPLE_GROUP: BookGroup = {
  id: "contoh",
  name: "Contoh kategori",
  recipes: [{
    id: "contoh-1", title: "Contoh Resep", owner: "Uti", servings: "4 porsi", cookTime: "1 jam",
    ingredients: ["Bahan pertama", "Bahan kedua", "Bahan ketiga"], steps: ["Langkah pertama.", "Langkah kedua."],
    story: "Cerita di balik resep ini akan tampil di sini.", memory: "Catatan atau kenangan akan tampil di sini.", photoUrl: null,
  }],
};

export function BookSettings({ initial, cover: initialCover, dedication: initialDedication }: { initial: BookValues; cover: Photo; dedication: Photo }) {
  const form = useRef<HTMLFormElement>(null);
  const [cover, setCover] = useState<Photo>(initialCover);
  const [dedication, setDedication] = useState<Photo>(initialDedication);
  const [view, setView] = useState<{ open: boolean; progress: string; url: string | null; error: string }>({ open: false, progress: "", url: null, error: "" });

  // Pratinjau memakai isian yang sedang tampil di formulir (belum disimpan) dan sebagian resep asli sebagai contoh.
  async function preview() {
    if (!form.current) return;
    if (view.url) URL.revokeObjectURL(view.url);
    setView({ open: true, progress: "Mengambil contoh resep...", url: null, error: "" });
    try {
      const fd = new FormData(form.current);
      const text = (k: string) => String(fd.get(k) ?? "").trim() || null;
      const flag = (k: string) => fd.get(k) === "on";
      const settings: BookConfig = {
        title: text("title") ?? initial.title,
        subtitle: text("subtitle"),
        familyName: text("familyName"),
        coverUrl: cover ? cloudUrl(cover.publicId, "c_limit,w_1200,q_auto:good,f_jpg") : null,
        dedicationText: text("dedicationText"),
        dedicationUrl: dedication ? cloudUrl(dedication.publicId, "c_limit,w_600,q_auto:good,f_jpg") : null,
        foreword: text("foreword"),
        showDedication: flag("showDedication"), showForeword: flag("showForeword"), showToc: flag("showToc"),
        showDividers: flag("showDividers"), showStory: flag("showStory"), showMemory: flag("showMemory"),
        accentColor: String(fd.get("accentColor") ?? initial.accentColor),
        fontSize: Number(fd.get("fontSize")) || initial.fontSize,
      };
      const res = await fetch("/api/book");
      if (!res.ok) throw new Error("data");
      const real: BookData = await res.json();
      // Dua kategori pertama dengan satu atau dua resep cukup untuk melihat sampul, daftar isi, pembatas, dan halaman resep.
      const groups = real.groups.length ? real.groups.slice(0, 2).map((g) => ({ ...g, recipes: g.recipes.slice(0, 2) })) : [SAMPLE_GROUP];
      const { buildBookPdf } = await import("@/lib/book-pdf");
      const blob = await buildBookPdf({ settings, groups, total: groups.reduce((n, g) => n + g.recipes.length, 0) }, { fontBase: `${location.origin}/fonts`, onProgress: (m) => setView((v) => ({ ...v, progress: m })) });
      setView({ open: true, progress: "", url: URL.createObjectURL(blob), error: "" });
    } catch {
      setView({ open: true, progress: "", url: null, error: "Pratinjau belum bisa dibuat. Periksa internet, lalu coba lagi." });
    }
  }

  return (
    <>
    <form ref={form} action={saveBook} className="flex flex-col gap-6">
      <Card>
        <CardHeader><CardTitle className="font-display text-2xl font-semibold">Sampul</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label className={label}>
            Judul buku
            <Input name="title" required maxLength={120} defaultValue={initial.title} />
          </label>
          <label className={label}>
            <span>Subjudul <span className={hint}>(boleh dikosongkan)</span></span>
            <Input name="subtitle" maxLength={160} defaultValue={initial.subtitle} placeholder="mis. Resep warisan keluarga" />
          </label>
          <label className={label}>
            <span>Nama keluarga <span className={hint}>(boleh dikosongkan)</span></span>
            <Input name="familyName" maxLength={80} defaultValue={initial.familyName} placeholder="mis. Keluarga Besar Uti" />
          </label>
          <PhotoSlot name="coverPhotoId" kind="sampul" title="Foto sampul" note="Tampil di tengah sampul. Boleh dikosongkan; sampul tetap rapi tanpa foto." photo={cover} onChange={setCover} maxSide={1600} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-display text-2xl font-semibold">Cerita buku</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label className={label}>
            <span>Teks persembahan <span className={hint}>(boleh dikosongkan)</span></span>
            <Textarea name="dedicationText" rows={3} maxLength={600} defaultValue={initial.dedicationText} placeholder="mis. Untuk Uti, yang mengajari kami menyayangi lewat masakan." />
          </label>
          <PhotoSlot name="dedicationPhotoId" kind="persembahan" title="Foto persembahan" note="Foto tokoh yang dipersembahkan, tampil bulat di halaman persembahan." photo={dedication} onChange={setDedication} maxSide={1000} />
          <label className={label}>
            <span>Kata pengantar <span className={hint}>(boleh dikosongkan; Enter untuk paragraf baru)</span></span>
            <Textarea name="foreword" rows={8} maxLength={4000} defaultValue={initial.foreword} />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-display text-2xl font-semibold">Bagian yang dicetak</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {SECTIONS.map(([key, name, note]) => (
            <label key={key} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-muted">
              <input type="checkbox" name={key} defaultChecked={initial[key] as boolean} className="size-5 accent-primary" />
              <span>
                <span className="block font-semibold">{name}</span>
                <span className="block text-sm text-muted-foreground">{note}</span>
              </span>
            </label>
          ))}
          <p className={hint}>Sampul dan halaman resep selalu ikut. Bagian persembahan dan kata pengantar hanya dicetak bila isinya diisi.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-display text-2xl font-semibold">Tampilan</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 font-semibold">Warna aksen</legend>
            <div className="flex flex-wrap gap-3">
              {BOOK_COLORS.map(([color, name]) => (
                <label key={color} className="flex cursor-pointer flex-col items-center gap-1 text-sm">
                  <input type="radio" name="accentColor" value={color} defaultChecked={initial.accentColor === color} className="peer sr-only" />
                  <span style={{ background: color }} className="size-12 rounded-full ring-offset-2 ring-offset-background peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
                  {name}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 font-semibold">Ukuran huruf isi</legend>
            <div className="flex flex-wrap gap-2">
              {BOOK_FONT_SIZES.map((size) => (
                <label key={size} className="flex min-h-12 cursor-pointer items-center rounded-md border px-4 font-semibold has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground">
                  <input type="radio" name="fontSize" value={size} defaultChecked={initial.fontSize === size} className="sr-only" />
                  {SIZE_LABEL[size]} ({size} pt)
                </label>
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="lg" onClick={preview} disabled={!!view.progress}><Eye aria-hidden /> Pratinjau</Button>
        <Button type="submit" size="lg"><Save aria-hidden /> Simpan pengaturan buku</Button>
      </div>
    </form>

    <Dialog open={view.open} onOpenChange={(o) => !o && setView((v) => ({ ...v, open: false }))}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold">Pratinjau buku</DialogTitle>
          <DialogDescription className="text-base">Dari isian di layar, belum disimpan. Memakai sebagian resep sebagai contoh.</DialogDescription>
        </DialogHeader>
        {view.progress && <p className="text-muted-foreground" aria-live="polite">{view.progress}</p>}
        {view.error && <p role="alert" className="text-destructive">{view.error}</p>}
        {view.url && (
          <>
            <iframe src={view.url} title="Pratinjau buku" className="h-[65vh] w-full rounded-md border" />
            <p className="text-sm text-muted-foreground">
              Pratinjau tidak tampil di HP? <a href={view.url} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">Buka di tab baru</a>.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
