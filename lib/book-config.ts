// Konstanta dan tipe buku resep. Tanpa impor server, jadi aman dipakai di komponen klien maupun server.

// Warna aksen yang boleh dipilih admin; nilai lain ditolak saat disimpan.
export const BOOK_COLORS = [
  ["#a0472a", "Terakota"],
  ["#4f7a3f", "Hijau daun"],
  ["#2f5f8a", "Biru"],
  ["#7a4a8a", "Ungu"],
  ["#8a6a1f", "Cokelat emas"],
  ["#3f3f3f", "Abu tua"],
] as const;

// Ukuran huruf isi buku (pt). Spesifikasi: 12 pt.
export const BOOK_FONT_SIZES = [11, 12, 14] as const;

export type BookSettings = {
  title: string;
  subtitle: string | null;
  familyName: string | null;
  coverUrl: string | null;
  dedicationText: string | null;
  dedicationUrl: string | null;
  foreword: string | null;
  showDedication: boolean;
  showForeword: boolean;
  showToc: boolean;
  showDividers: boolean;
  showStory: boolean;
  showMemory: boolean;
  accentColor: string;
  fontSize: number;
};

export type BookRecipe = {
  id: string;
  title: string;
  owner: string | null;
  servings: string | null;
  cookTime: string | null;
  ingredients: string[];
  steps: string[];
  story: string | null;
  memory: string | null;
  photoUrl: string | null;
};

export type BookGroup = { id: string; name: string; recipes: BookRecipe[] };

export type BookData = { settings: BookSettings; groups: BookGroup[]; total: number };

export const DEFAULT_BOOK_TITLE = "Resep Warisan Keluarga";
