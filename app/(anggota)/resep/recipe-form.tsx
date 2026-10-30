"use client";

import { useEffect, useRef, useState, useTransition, type ChangeEvent } from "react";
import { Camera, ScanText, Save } from "lucide-react";
import { Flash } from "@/app/admin/flash";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { compress } from "@/lib/upload-photo";
import { saveRecipe } from "./actions";
import { NEW_REF } from "./new-ref";

export type RecipeValues = {
  title: string; categoryId: string; ownerPersonId: string; ingredientsText: string; stepsText: string;
  originStory: string; memoryNote: string; servings: string; cookTime: string; difficulty: string;
};
type Opt = { id: string; name: string };

const select = "h-12 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";
const label = "flex flex-col gap-1 font-semibold";
const hint = "text-sm font-normal text-muted-foreground";

// Pilih dari daftar, atau "Buat ... baru" yang memunculkan kolom nama. Nama baru dibuat di server bersama resepnya.
function RefField({ title, noun, name, newName, options, initial, placeholder }: { title: string; noun: string; name: string; newName: string; options: Opt[]; initial: string; placeholder: string }) {
  const [value, setValue] = useState(initial);
  return (
    <div className="flex flex-col gap-2">
      <label className={label}>
        {title}
        <select name={name} value={value} onChange={(e) => setValue(e.target.value)} className={select}>
          <option value="">Belum dipilih</option>
          {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          <option value={NEW_REF}>+ Buat {noun} baru</option>
        </select>
      </label>
      {value === NEW_REF && <Input name={newName} required maxLength={60} autoFocus placeholder={placeholder} aria-label={`Nama ${noun} baru`} />}
    </div>
  );
}

// OCR lewat /api/ocr (Gemini); hasilnya hanya draf yang ditambahkan ke kolom Bahan dan Langkah.
async function readHandwriting(file: File, form: HTMLFormElement, setCategory: (id: string) => void) {
  const body = new FormData();
  body.set("file", await compress(file, 2000));
  const res = await fetch("/api/ocr", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  const title = form.elements.namedItem("title") as HTMLInputElement;
  if (!title.value.trim() && data.title) title.value = data.title;
  // Hanya mengisi kategori yang masih "Belum dipilih"; pilihan pengguna tidak ditimpa.
  if (data.categoryId && !(form.elements.namedItem("categoryId") as HTMLSelectElement).value) setCategory(data.categoryId);
  for (const [name, lines] of [["ingredientsText", data.ingredients], ["stepsText", data.steps]] as const) {
    const box = form.elements.namedItem(name) as HTMLTextAreaElement;
    box.value = [box.value, ...lines].filter(Boolean).join("\n");
  }
}

type Props = { id: string | null; initial: RecipeValues; categories: Opt[]; people: Opt[] };

// cacheComponents menyembunyikan halaman (bukan membongkarnya) saat pengguna berpindah, sehingga isian ikut tersimpan.
// Efek dibersihkan saat halaman disembunyikan; begitu tampil lagi, key baru memuat ulang formulir dari nilai awal.
export function RecipeForm(props: Props) {
  const [key, setKey] = useState(0);
  const left = useRef(false);
  useEffect(() => {
    if (left.current) {
      left.current = false;
      setKey((k) => k + 1);
    }
    return () => {
      left.current = true;
    };
  }, []);
  return <Form key={key} {...props} />;
}

// Tidak bisa ditutup: prosesnya berjalan di server dan hasilnya langsung dipakai formulir.
function Waiting({ open, title, text }: { open: boolean; title: string; text: string }) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-base">{text}</DialogDescription>
        </DialogHeader>
        <div role="progressbar" aria-label={title} className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="bar-slide h-full w-2/5 rounded-full bg-primary" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Form({ id, initial, categories, people }: Props) {
  const [error, setError] = useState("");
  const [ocr, setOcr] = useState("");
  // key berganti agar RefField dimuat ulang dengan kategori hasil OCR sebagai nilai awalnya.
  const [cat, setCat] = useState({ id: initial.categoryId, key: 0 });
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);

  async function onOcr(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget, file = input.files?.[0], form = input.form;
    if (!file || !form) return;
    setError("");
    setOcr("Menunggu analisis...");
    try {
      await readHandwriting(file, form, (id) => setCat({ id, key: cat.key + 1 }));
      setError("Hasil bacaan masuk ke kolom Bahan dan Langkah sebagai draf (judul dan kategori diisi bila masih kosong). Periksa dulu sebelum disimpan.");
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Tulisan belum bisa dibaca. Periksa internet atau coba foto yang lebih jelas.");
    } finally {
      setOcr("");
      input.value = "";
    }
  }
  const [pending, start] = useTransition();

  // Tanpa prop `action` agar isian tidak dikosongkan React bila simpan gagal.
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setError("");
        start(async () => {
          const res = await saveRecipe(id, data);
          if (res?.error) setError(res.error);
        });
      }}
    >
      <label className={label}>
        Judul resep
        <Input name="title" required defaultValue={initial.title} placeholder="mis. Soto Ayam Lamongan" />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <RefField key={cat.key} title="Kategori" noun="kategori" name="categoryId" newName="newCategory" options={categories} initial={cat.id} placeholder="mis. Makanan Utama" />
        <RefField title="Pemilik resep" noun="pemilik" name="ownerPersonId" newName="newOwner" options={people} initial={initial.ownerPersonId} placeholder="mis. Budhe Sri" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="outline" size="lg" disabled={!!ocr} onClick={() => camera.current?.click()}>
            <Camera aria-hidden /> Foto dengan kamera
          </Button>
          <Button type="button" variant="outline" size="lg" disabled={!!ocr} onClick={() => gallery.current?.click()}>
            <ScanText aria-hidden /> Pilih dari galeri
          </Button>
        </div>
        {/* capture="environment" membuka kamera belakang langsung; tanpa itu browser menawarkan galeri/berkas. */}
        <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={onOcr} />
        <input ref={gallery} type="file" accept="image/*" hidden onChange={onOcr} />
        <span className={hint}>Baca tulisan tangan dari foto. Hasilnya hanya draf, wajib diperiksa sebelum disimpan.</span>
      </div>

      <label className={label}>
        <span>Bahan <span className={hint}>(satu bahan per baris)</span></span>
        <Textarea name="ingredientsText" defaultValue={initial.ingredientsText} rows={7} placeholder={"1 ekor ayam\n5 siung bawang putih"} />
      </label>
      <label className={label}>
        <span>Langkah <span className={hint}>(satu langkah per baris)</span></span>
        <Textarea name="stepsText" defaultValue={initial.stepsText} rows={7} placeholder={"Rebus ayam hingga empuk.\nHaluskan bumbu lalu tumis."} />
      </label>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className={label}>Porsi<Input name="servings" defaultValue={initial.servings} placeholder="mis. 6 porsi" /></label>
        <label className={label}>Waktu memasak<Input name="cookTime" defaultValue={initial.cookTime} placeholder="mis. 1 jam" /></label>
        <label className={label}>
          Tingkat kesulitan
          <select name="difficulty" defaultValue={initial.difficulty} className={select}>
            <option value="">Belum dipilih</option>
            <option value="mudah">Mudah</option>
            <option value="sedang">Sedang</option>
            <option value="sulit">Sulit</option>
          </select>
        </label>
      </div>

      <label className={label}>
        <span>Cerita di balik resep <span className={hint}>(boleh dikosongkan)</span></span>
        <Textarea name="originStory" defaultValue={initial.originStory} rows={4} />
      </label>
      <label className={label}>
        <span>Catatan <span className={hint}>(boleh dikosongkan)</span></span>
        <Textarea name="memoryNote" defaultValue={initial.memoryNote} rows={3} />
      </label>

      <Waiting open={!!ocr} title="Menunggu analisis" text="Foto sedang dibaca. Mohon tunggu beberapa detik, jangan tutup halaman ini." />
      <Waiting open={pending} title="Menyimpan resep" text="Mohon tunggu sebentar, jangan tutup halaman ini." />

      <Flash error={error} />
      <Button type="submit" size="lg" disabled={pending}><Save aria-hidden /> {pending ? "Menyimpan..." : "Simpan resep"}</Button>
    </form>
  );
}
