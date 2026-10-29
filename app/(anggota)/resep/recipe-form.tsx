"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { Flash } from "@/app/admin/flash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveRecipe } from "./actions";

export type RecipeValues = {
  title: string; categoryId: string; ownerPersonId: string; ingredientsText: string; stepsText: string;
  originStory: string; memoryNote: string; servings: string; cookTime: string; difficulty: string; status: string;
};
type Opt = { id: string; name: string };

const select = "h-12 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";
const label = "flex flex-col gap-1 font-semibold";
const hint = "text-sm font-normal text-muted-foreground";

export function RecipeForm({ id, initial, categories, people }: { id: string | null; initial: RecipeValues; categories: Opt[]; people: Opt[] }) {
  const [error, setError] = useState("");
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
        <label className={label}>
          Kategori
          <select name="categoryId" defaultValue={initial.categoryId} className={select}>
            <option value="">Belum dipilih</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className={label}>
          Pemilik resep
          <select name="ownerPersonId" defaultValue={initial.ownerPersonId} className={select}>
            <option value="">Belum dipilih</option>
            {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
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
        <span>Catatan kenangan <span className={hint}>(boleh dikosongkan)</span></span>
        <Textarea name="memoryNote" defaultValue={initial.memoryNote} rows={3} />
      </label>

      <label className={label}>
        <span>Status resep <span className={hint}>(pilih &quot;Perlu dicek&quot; bila takaran belum pasti)</span></span>
        <select name="status" defaultValue={initial.status} className={select}>
          <option value="draf">Draf</option>
          <option value="perlu_dicek">Perlu dicek</option>
          <option value="lengkap">Lengkap</option>
        </select>
      </label>

      <Flash error={error} />
      <Button type="submit" size="lg" disabled={pending}><Save aria-hidden /> {pending ? "Menyimpan..." : "Simpan resep"}</Button>
    </form>
  );
}
