"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2 } from "lucide-react";
import { Flash } from "@/app/admin/flash";
import { CloudImg } from "@/components/cloud-img";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type ManagedPhoto = { id: string; kind: string; src: string };
type Kind = "masakan" | "tulisan_asli";

const KINDS: [Kind, string, string][] = [
  ["masakan", "Foto masakan", "Hasil masakan yang sudah jadi"],
  ["tulisan_asli", "Tulisan asli", "Foto catatan tulisan tangan"],
];
// Tulisan tangan butuh resolusi lebih tinggi supaya tetap terbaca.
const MAX_SIDE: Record<Kind, number> = { masakan: 1600, tulisan_asli: 2000 };

// Kompres di browser sebelum diunggah (KF06): hemat kuota HP dan kuota Cloudinary gratis.
async function compress(file: File, kind: Kind) {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE[kind] / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, width, height);
  bmp.close();
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.85));
  if (!blob) throw new Error("bitmap");
  return { blob };
}

async function upload(recipeId: string, file: File, kind: Kind, sortOrder: number) {
  const { blob } = await compress(file, kind);
  // Tanda tangan dibuat server; secret Cloudinary tidak pernah sampai ke browser.
  const sign = await (await fetch("/api/photos/sign", { method: "POST" })).json();
  const form = new FormData();
  form.set("file", blob);
  form.set("api_key", sign.apiKey);
  form.set("timestamp", String(sign.timestamp));
  form.set("signature", sign.signature);
  form.set("folder", sign.folder);
  const up = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: "POST", body: form });
  if (!up.ok) throw new Error("cloudinary");
  const done = await up.json();
  const reg = await fetch("/api/photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipeId, kind, publicId: done.public_id, width: done.width, height: done.height, sortOrder }),
  });
  if (!reg.ok) throw new Error("register");
}

export function PhotoManager({ recipeId, photos }: { recipeId: string; photos: ManagedPhoto[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<Kind>("masakan");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [target, setTarget] = useState<ManagedPhoto | null>(null);
  const busy = !!progress;

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setOk("");
    let sent = 0;
    try {
      for (const [i, file] of [...files].entries()) {
        setProgress(`Mengunggah foto ${i + 1} dari ${files.length}...`);
        await upload(recipeId, file, kind, photos.length + i);
        sent++;
      }
      setOk(sent === 1 ? "Foto tersimpan" : `${sent} foto tersimpan`);
    } catch {
      setError(sent ? `${sent} foto sudah tersimpan, sisanya belum. Periksa internet, lalu pilih foto yang belum terunggah.` : "Foto belum terunggah. Periksa internet, lalu coba lagi.");
    } finally {
      setProgress("");
      if (input.current) input.current.value = "";
      router.refresh();
    }
  }

  async function remove(p: ManagedPhoto) {
    setTarget(null);
    setError("");
    const res = await fetch(`/api/photos/${p.id}`, { method: "DELETE" });
    if (!res.ok) setError("Foto belum terhapus. Coba lagi.");
    else setOk("Foto dihapus");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-semibold">Jenis foto</legend>
        {KINDS.map(([value, label, hint]) => (
          <label key={value} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-muted">
            <input type="radio" name="kind" checked={kind === value} onChange={() => setKind(value)} className="size-5 accent-primary" />
            <span>
              <span className="block font-semibold">{label}</span>
              <span className="block text-sm text-muted-foreground">{hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => onPick(e.target.files)} />
      <Button type="button" size="lg" disabled={busy} onClick={() => input.current?.click()}>
        <Camera aria-hidden /> {busy ? progress : "Pilih foto dari galeri atau kamera"}
      </Button>

      <Flash ok={ok} error={error} />

      <section>
        <h2 className="font-display text-2xl font-semibold">Foto resep ({photos.length})</h2>
        {photos.length === 0 ? (
          <p className="mt-2 text-muted-foreground">Belum ada foto.</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {photos.map((p) => (
              <li key={p.id} className="flex flex-col gap-2 overflow-hidden rounded-lg border bg-background">
                <CloudImg src={p.src} alt="" width={600} height={400} className="aspect-[3/2] w-full object-cover" />
                <div className="flex items-center justify-between gap-2 p-3 pt-0">
                  <Badge variant="secondary">{p.kind === "tulisan_asli" ? "Tulisan asli" : "Masakan"}</Badge>
                  <Button type="button" variant="outline" onClick={() => setTarget(p)}><Trash2 aria-hidden /> Hapus</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-semibold">Hapus foto ini?</DialogTitle>
            <DialogDescription className="text-base">Foto akan dilepas dari resep ini.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button type="button" variant="destructive" size="lg" onClick={() => target && remove(target)}><Trash2 aria-hidden /> Ya, hapus</Button>
            <DialogClose render={<Button variant="outline" size="lg" />}>Batal</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
