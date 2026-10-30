// Unggah foto dari browser (hanya untuk komponen klien): kompres dulu, kirim langsung ke Cloudinary, lalu daftarkan.
export type PhotoKind = "masakan" | "tulisan_asli" | "sampul" | "persembahan" | "tokoh";
export type UploadedPhoto = { id: string; cloudinaryPublicId: string; width: number; height: number };

// Kompres di browser sebelum diunggah (KF06): hemat kuota HP dan kuota Cloudinary gratis.
async function compress(file: File, maxSide: number) {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, width, height);
  bmp.close();
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.85));
  if (!blob) throw new Error("bitmap");
  return blob;
}

// recipeId null untuk foto sampul, persembahan, atau tokoh. Melempar galat bila salah satu langkah gagal.
export async function uploadPhoto(file: File, opts: { kind: PhotoKind; maxSide: number; recipeId?: string | null; sortOrder?: number }): Promise<UploadedPhoto> {
  const blob = await compress(file, opts.maxSide);
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
    body: JSON.stringify({ recipeId: opts.recipeId ?? null, kind: opts.kind, publicId: done.public_id, width: done.width, height: done.height, sortOrder: opts.sortOrder ?? 0 }),
  });
  if (!reg.ok) throw new Error("register");
  return reg.json();
}
