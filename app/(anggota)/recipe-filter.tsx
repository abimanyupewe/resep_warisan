"use client";

import Link from "next/link";
import { ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const select = "h-12 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";
const choice = "flex min-h-12 cursor-pointer items-center rounded-md border px-4 font-semibold has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground";

type Opt = { id: string; name: string };
type Props = {
  basePath: string;
  q: string;
  categoryId: string;
  ownerPersonId: string;
  needsCheck: boolean;
  categories: Opt[];
  people: Opt[];
  // Filter "Perlu dicek" hanya untuk anggota.
  showStatus: boolean;
  active: number;
};

// Filter dibuka dalam modal agar daftar resep tidak terdorong ke bawah. Form GET biasa: halaman dimuat ulang
// dengan parameter baru, sehingga modal tertutup sendiri dan tautan hasilnya bisa dibagikan.
export function RecipeFilter({ basePath, q, categoryId, ownerPersonId, needsCheck, categories, people, showStatus, active }: Props) {
  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="outline" size="lg" />}>
        <ListFilter aria-hidden /> Filter{active > 0 && <span className="ml-1 rounded-full bg-primary px-2 text-sm text-primary-foreground">{active}</span>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold">Filter resep</DialogTitle>
          <DialogDescription className="text-base">Pilih lalu tekan Terapkan.</DialogDescription>
        </DialogHeader>
        <form action={basePath} className="flex flex-col gap-5">
          {q && <input type="hidden" name="q" value={q} />}
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-semibold">Kategori</legend>
            <div className="flex flex-wrap gap-2">
              <label className={choice}>
                <input type="radio" name="categoryId" value="" defaultChecked={!categoryId} className="sr-only" />Semua
              </label>
              {categories.map((c) => (
                <label key={c.id} className={choice}>
                  <input type="radio" name="categoryId" value={c.id} defaultChecked={categoryId === c.id} className="sr-only" />{c.name}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex flex-col gap-1 font-semibold">
            Pemilik resep
            <select name="ownerPersonId" defaultValue={ownerPersonId} className={select}>
              <option value="">Semua pemilik</option>
              {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          {showStatus && (
            <label className="flex min-h-12 items-center gap-3 font-semibold">
              <input type="checkbox" name="status" value="perlu_dicek" defaultChecked={needsCheck} className="size-5 accent-primary" />
              Hanya yang perlu dicek
            </label>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="lg" className="flex-1">Terapkan</Button>
            <Link href={q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath} className="flex min-h-12 items-center px-4 font-semibold text-primary hover:underline">Atur ulang</Link>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
