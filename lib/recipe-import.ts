// Pengurai berkas impor resep (Markdown atau JSON), murni tanpa database agar mudah diuji.
// Format dibuat dengan bantuan AI dari foto resep tulisan tangan; lihat halaman admin Impor resep.
export const MAX_ITEMS = 50;
export const MAX_CHARS = 1_000_000;

const LEVELS = ["mudah", "sedang", "sulit"] as const;
const STATUSES = ["draf", "perlu_dicek", "lengkap"] as const;

export type ImportItem = {
  title: string; category: string | null; owner: string | null; servings: string | null; cookTime: string | null;
  difficulty: (typeof LEVELS)[number] | null; status: (typeof STATUSES)[number];
  ingredientsText: string | null; stepsText: string | null; originStory: string | null; memoryNote: string | null;
  warnings: string[];
};

const str = (v: unknown, max: number) => (typeof v === "string" || typeof v === "number" ? String(v).trim().slice(0, max) || null : null);
// Daftar boleh berupa array atau teks per baris; awalan "- ", "* ", dan "1. " dibuang.
const lines = (v: unknown, max: number) => {
  const raw = Array.isArray(v) ? v.map(String) : typeof v === "string" ? v.split(/\r?\n/) : [];
  const out = raw.map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim()).filter(Boolean).join("\n").slice(0, max);
  return out || null;
};

function build(o: Record<string, unknown>, n: number): ImportItem | string {
  const pick = (...keys: string[]) => keys.map((k) => o[k]).find((v) => v !== undefined && v !== null);
  const title = str(pick("judul", "title", "nama"), 200);
  if (!title) return `Resep nomor ${n} tidak punya judul, dilewati.`;
  const warnings: string[] = [];
  const level = str(pick("kesulitan", "difficulty"), 20)?.toLowerCase() ?? null;
  const difficulty = LEVELS.find((l) => l === level) ?? null;
  if (level && !difficulty) warnings.push(`Kesulitan "${level}" tidak dikenal, dikosongkan.`);
  const st = str(pick("status"), 20)?.toLowerCase().replace(/\s+/g, "_") ?? null;
  // Hasil baca tulisan tangan wajib diperiksa, jadi bawaannya "perlu_dicek".
  const status = STATUSES.find((s) => s === st) ?? "perlu_dicek";
  const ingredientsText = lines(pick("bahan", "ingredients", "ingredientsText"), 8000);
  const stepsText = lines(pick("langkah", "steps", "stepsText", "cara"), 8000);
  if (!ingredientsText) warnings.push("Bahan kosong.");
  if (!stepsText) warnings.push("Langkah kosong.");
  return {
    title, difficulty, status, ingredientsText, stepsText, warnings,
    category: str(pick("kategori", "category"), 80),
    owner: str(pick("pemilik", "owner"), 80),
    servings: str(pick("porsi", "servings"), 60),
    cookTime: str(pick("waktu", "waktu_memasak", "cookTime"), 60),
    originStory: str(pick("cerita", "asal_usul", "originStory"), 4000),
    memoryNote: str(pick("catatan", "kenangan", "memoryNote"), 4000),
  };
}

// AI sering membungkus jawaban dengan ``` ... ```; buang pembungkusnya.
const unfence = (t: string) => t.trim().replace(/^```[a-zA-Z]*\s*\n/, "").replace(/\n```\s*$/, "").trim();

function fromJson(text: string) {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { items: [], errors: [`Format JSON tidak valid (${e instanceof Error ? e.message : "galat"}). Coba minta AI memperbaikinya, atau pakai format Markdown.`] };
  }
  const o = data as Record<string, unknown>;
  const list = Array.isArray(data) ? data : Array.isArray(o?.resep) ? o.resep : Array.isArray(o?.recipes) ? o.recipes : Array.isArray(o?.items) ? o.items : o && typeof o === "object" ? [o] : [];
  return collect(list.map((x) => (x && typeof x === "object" ? (x as Record<string, unknown>) : {})));
}

const SECTION: [RegExp, string][] = [[/bahan|ingredient/i, "bahan"], [/langkah|cara|step/i, "langkah"], [/cerita|asal/i, "cerita"], [/catatan|kenangan|note/i, "catatan"]];

function fromMarkdown(text: string) {
  type Cur = { title: string; meta: Record<string, string>; sections: Record<string, string[]>; sec: string };
  const all: Record<string, unknown>[] = [];
  let cur: Cur | null = null;
  const flush = () => {
    if (!cur) return;
    const s = cur.sections, m = cur.meta;
    all.push({ judul: cur.title, kategori: m.kategori, pemilik: m.pemilik, porsi: m.porsi, waktu: m.waktu, kesulitan: m.kesulitan, status: m.status,
      bahan: s.bahan?.join("\n"), langkah: s.langkah?.join("\n"), cerita: s.cerita?.join("\n").trim(), catatan: s.catatan?.join("\n").trim() });
  };
  for (const line of text.split(/\r?\n/)) {
    const h1 = line.match(/^#\s+(.+?)\s*$/);
    if (h1) { flush(); cur = { title: h1[1], meta: {}, sections: {}, sec: "" }; continue; }
    if (!cur) continue;
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) { cur.sec = SECTION.find(([re]) => re.test(h2[1]))?.[1] ?? "_"; cur.sections[cur.sec] ??= []; continue; }
    if (cur.sec) { cur.sections[cur.sec].push(line); continue; }
    const kv = line.match(/^\s*[-*]?\s*([A-Za-z ]{2,20}):\s*(.+)$/);
    if (kv) cur.meta[kv[1].trim().toLowerCase()] = kv[2].trim();
  }
  flush();
  return all.length ? collect(all) : { items: [], errors: ["Tidak ada resep ditemukan. Setiap resep harus diawali baris \"# Judul Resep\"."] };
}

function collect(list: Record<string, unknown>[]) {
  const items: ImportItem[] = [];
  const errors: string[] = [];
  if (list.length > MAX_ITEMS) errors.push(`Terlalu banyak resep (${list.length}). Hanya ${MAX_ITEMS} pertama yang dibaca; bagi file menjadi beberapa bagian.`);
  list.slice(0, MAX_ITEMS).forEach((o, i) => {
    const r = build(o, i + 1);
    if (typeof r === "string") errors.push(r);
    else items.push(r);
  });
  return { items, errors };
}

export function parseImport(raw: string): { items: ImportItem[]; errors: string[] } {
  if (raw.length > MAX_CHARS) return { items: [], errors: ["Berkas terlalu besar (maksimal 1 MB)."] };
  const text = unfence(raw);
  if (!text) return { items: [], errors: ["Berkas kosong."] };
  return /^[{[]/.test(text) ? fromJson(text) : fromMarkdown(text);
}
