"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Copy, FileUp, ListChecks } from "lucide-react";
import { Flash } from "../../flash";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { importRecipes, previewImport } from "./actions";

type Preview = Awaited<ReturnType<typeof previewImport>>;
type Result = Awaited<ReturnType<typeof importRecipes>>;
const title = "font-display text-2xl font-semibold";

export function PromptBox({ prompts }: { prompts: { markdown: string; json: string } }) {
  const [format, setFormat] = useState<"markdown" | "json">("markdown");
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(prompts[format]); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* clipboard dilarang: teks tetap bisa diblok manual */ }
  };
  return (
    <div className="flex flex-col gap-3">
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Format</legend>
        {([["markdown", "Markdown (disarankan)"], ["json", "JSON"]] as const).map(([v, l]) => (
          <label key={v} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-md border px-3 font-semibold has-[:checked]:border-primary has-[:checked]:bg-muted">
            <input type="radio" name="format" checked={format === v} onChange={() => { setFormat(v); setCopied(false); }} className="size-5 accent-primary" />{l}
          </label>
        ))}
      </fieldset>
      <Textarea readOnly value={prompts[format]} rows={12} className="font-mono text-sm" aria-label="Prompt untuk AI" onFocus={(e) => e.currentTarget.select()} />
      <Button type="button" size="lg" onClick={copy} className="w-fit">{copied ? <><Check aria-hidden /> Tersalin</> : <><Copy aria-hidden /> Salin prompt</>}</Button>
    </div>
  );
}

export function Importer() {
  const [text, setText] = useState("");
  const [fileError, setFileError] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<Result | null>(null);
  const [pending, start] = useTransition();

  const edit = (v: string) => { setText(v); setPreview(null); setResult(null); };
  const onFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 1_000_000) { setFileError("Berkas terlalu besar (maksimal 1 MB)."); return; }
    setFileError("");
    edit(await file.text());
  };
  const check = () => start(async () => {
    const p = await previewImport(text);
    setPreview(p);
    setResult(null);
    // Judul yang sudah ada tidak dicentang bawaannya, supaya tidak terduplikasi tanpa sengaja.
    setSelected(new Set(p.items.filter((i) => !i.duplicate).map((i) => i.index)));
  });
  const run = () => start(async () => { setResult(await importRecipes(text, [...selected])); setPreview(null); });
  const toggle = (i: number) => setSelected((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });

  return (
    <Card>
      <CardHeader><CardTitle className={title}>Langkah 2. Unggah hasil dari AI</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 font-semibold">
          Pilih berkas (.md, .json, atau .txt)
          <input type="file" accept=".md,.markdown,.json,.txt,text/*,application/json" onChange={(e) => onFile(e.target.files?.[0])} className="min-h-12 rounded-md border border-input bg-background p-2 text-base" />
        </label>
        <label className="flex flex-col gap-1 font-semibold">
          Atau tempel isinya di sini
          <Textarea value={text} onChange={(e) => edit(e.target.value)} rows={8} placeholder="# Soto Ayam&#10;Kategori: Makanan Utama&#10;..." className="font-mono text-sm" />
        </label>
        <Flash error={fileError} />
        <Button type="button" size="lg" disabled={!text.trim() || pending} onClick={check} className="w-fit"><FileUp aria-hidden /> {pending && !preview ? "Memeriksa..." : "Periksa berkas"}</Button>

        {result && (
          <div className="flex flex-col gap-3">
            <Flash ok={result.created ? `${result.created} resep berhasil diimpor dengan status "Perlu dicek".` : undefined} error={result.error || (result.failed.length ? `Gagal disimpan: ${result.failed.join(", ")}` : undefined)} />
            {(result.categories.length > 0 || result.people.length > 0) && (
              <p className="text-muted-foreground">
                {result.categories.length > 0 && <>Kategori baru dibuat: {result.categories.join(", ")}. </>}
                {result.people.length > 0 && <>Pemilik baru dibuat: {result.people.join(", ")}.</>}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/resep" className={buttonVariants()}>Lihat daftar resep</Link>
              <Button type="button" variant="outline" onClick={() => { edit(""); }}>Impor berkas lain</Button>
            </div>
          </div>
        )}

        {preview && (
          <div className="flex flex-col gap-3">
            {preview.errors.map((e, i) => <Flash key={i} error={e} />)}
            {preview.items.length > 0 && (
              <>
                <h3 className={title}>Pratinjau ({preview.items.length} resep)</h3>
                <ul className="flex flex-col divide-y rounded-lg border">
                  {preview.items.map((it) => (
                    <li key={it.index}>
                      <label className="flex cursor-pointer items-start gap-3 p-4">
                        <input type="checkbox" checked={selected.has(it.index)} onChange={() => toggle(it.index)} className="mt-1 size-6 shrink-0 accent-primary" />
                        <span className="flex flex-col gap-1">
                          <span className="font-semibold">{it.title}</span>
                          <span className="text-sm text-muted-foreground">
                            {[it.category ?? "Tanpa kategori", it.owner ?? "Tanpa pemilik", `${it.ingredients} bahan`, `${it.steps} langkah`].join(" · ")}
                          </span>
                          <span className="flex flex-wrap gap-1">
                            {it.duplicate && <Badge className="bg-kunyit text-amber-950">Judul sudah ada</Badge>}
                            {it.newCategory && <Badge variant="secondary">Kategori baru</Badge>}
                            {it.newOwner && <Badge variant="secondary">Pemilik baru</Badge>}
                            <Badge variant="outline">{it.status === "perlu_dicek" ? "Perlu dicek" : it.status === "lengkap" ? "Lengkap" : "Draf"}</Badge>
                          </span>
                          {it.warnings.map((w, i) => <span key={i} className="text-sm text-amber-800">{w}</span>)}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
                <Button type="button" size="lg" disabled={selected.size === 0 || pending} onClick={run} className="w-fit"><ListChecks aria-hidden /> {pending ? "Mengimpor..." : `Impor ${selected.size} resep`}</Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
