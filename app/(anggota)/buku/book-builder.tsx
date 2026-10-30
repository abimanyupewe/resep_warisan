"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Flash } from "@/app/admin/flash";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BookData } from "@/lib/book-config";

type Opt = { id: string; name: string; count: number };
type Scope = "all" | "category" | "owner";

const select = "h-12 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";
const choice = "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-muted";
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "buku-resep";

// Dipakai anggota (/buku) dan pengunjung (/jelajah/buku). PDF dibuat di browser, bukan di server.
export function BookBuilder({ total, categories, people }: { total: number; categories: Opt[]; people: Opt[] }) {
  const [scope, setScope] = useState<Scope>("all");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [ownerId, setOwnerId] = useState(people[0]?.id ?? "");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ url: string; name: string } | null>(null);
  const busy = !!progress;

  const count = scope === "all" ? total : scope === "category" ? categories.find((c) => c.id === categoryId)?.count : people.find((p) => p.id === ownerId)?.count;

  async function build() {
    setError("");
    if (done) URL.revokeObjectURL(done.url);
    setDone(null);
    setProgress("Mengambil resep...");
    try {
      const qs = new URLSearchParams();
      if (scope === "category" && categoryId) qs.set("categoryId", categoryId);
      if (scope === "owner" && ownerId) qs.set("ownerPersonId", ownerId);
      const res = await fetch(`/api/book?${qs}`);
      if (!res.ok) throw new Error("data");
      const data: BookData = await res.json();
      if (!data.total) {
        setError("Belum ada resep untuk pilihan ini.");
        return;
      }
      // Library PDF baru dimuat di sini, supaya aplikasi utama tetap ringan.
      const { buildBookPdf } = await import("@/lib/book-pdf");
      const blob = await buildBookPdf(data, { fontBase: `${location.origin}/fonts`, onProgress: setProgress });
      const file = { url: URL.createObjectURL(blob), name: `${slug(data.settings.title)}.pdf` };
      setDone(file);
      const a = document.createElement("a");
      a.href = file.url;
      a.download = file.name;
      a.click();
    } catch {
      setError("Buku belum bisa dibuat. Periksa internet, lalu coba lagi. Bila HP terasa berat, pilih per kategori supaya bukunya lebih kecil.");
    } finally {
      setProgress("");
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2" disabled={busy}>
          <legend className="mb-1 font-semibold">Resep yang dimasukkan</legend>
          <label className={choice}>
            <input type="radio" name="scope" checked={scope === "all"} onChange={() => setScope("all")} className="size-5 accent-primary" />
            <span className="font-semibold">Semua resep ({total})</span>
          </label>
          {categories.length > 0 && (
            <div className={`${choice} flex-wrap`}>
              <label className="flex flex-1 cursor-pointer items-center gap-3 font-semibold">
                <input type="radio" name="scope" checked={scope === "category"} onChange={() => setScope("category")} className="size-5 accent-primary" />
                Per kategori
              </label>
              {scope === "category" && (
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Kategori" className={select}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.count})</option>)}
                </select>
              )}
            </div>
          )}
          {people.length > 0 && (
            <div className={`${choice} flex-wrap`}>
              <label className="flex flex-1 cursor-pointer items-center gap-3 font-semibold">
                <input type="radio" name="scope" checked={scope === "owner"} onChange={() => setScope("owner")} className="size-5 accent-primary" />
                Per pemilik resep
              </label>
              {scope === "owner" && (
                <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} aria-label="Pemilik resep" className={select}>
                  {people.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.count})</option>)}
                </select>
              )}
            </div>
          )}
        </fieldset>

        <p className="text-sm text-muted-foreground">
          Buku dengan banyak foto lebih cepat dibuat di laptop. Di HP, pilih per kategori. Hanya resep yang sudah tampil di halaman umum yang ikut dicetak.
        </p>

        <Flash error={error} />
        <div aria-live="polite">
          {done && (
            <p className="text-base">
              Buku siap dan unduhan dimulai. Kalau tidak mulai sendiri,{" "}
              <a href={done.url} download={done.name} className="font-semibold text-primary underline">unduh {done.name}</a>.
            </p>
          )}
          {busy && <p className="text-muted-foreground">{progress}</p>}
        </div>

        <Button type="button" size="lg" onClick={build} disabled={busy || count === 0}>
          <Download aria-hidden /> {busy ? "Sedang membuat..." : "Buat buku PDF"}
        </Button>
      </CardContent>
    </Card>
  );
}
