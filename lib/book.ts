import { photoUrl } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { PUBLIC_WHERE } from "@/lib/public";
import { type BookData, type BookGroup, type BookSettings, DEFAULT_BOOK_TITLE } from "@/lib/book-config";

// JPG, bukan f_auto: @react-pdf tidak mendukung WebP.
const pdfImg = (publicId: string, width: number) => photoUrl(publicId, `c_limit,w_${width},q_auto:good,f_jpg`);
const lines = (s: string | null) => (s ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

// Pengaturan template buku dari admin; bila belum pernah disimpan, pakai nilai bawaan.
export async function bookSettings(): Promise<BookSettings> {
  const p = await prisma.bookProfile.findFirst({ include: { coverPhoto: true, dedicationPhoto: true } });
  return {
    title: p?.title ?? DEFAULT_BOOK_TITLE,
    subtitle: p?.subtitle ?? null,
    familyName: p?.familyName ?? null,
    coverUrl: p?.coverPhoto ? pdfImg(p.coverPhoto.cloudinaryPublicId, 1200) : null,
    dedicationText: p?.dedicationText ?? null,
    dedicationUrl: p?.dedicationPhoto ? pdfImg(p.dedicationPhoto.cloudinaryPublicId, 600) : null,
    foreword: p?.foreword ?? null,
    showDedication: p?.showDedication ?? true,
    showForeword: p?.showForeword ?? true,
    showToc: p?.showToc ?? true,
    showDividers: p?.showDividers ?? true,
    showStory: p?.showStory ?? true,
    showMemory: p?.showMemory ?? true,
    accentColor: p?.accentColor ?? "#a0472a",
    fontSize: p?.fontSize ?? 12,
  };
}

// Isi buku: hanya resep yang boleh dibaca publik (bukan draf, bukan di sampah), dikelompokkan menurut urutan
// kategori, lalu judul sesuai abjad (spesifikasi 8.1). Kategori kosong tidak dimuat.
export async function bookData(filter: { categoryId?: string; ownerPersonId?: string }): Promise<BookData> {
  const [settings, categories, recipes] = await Promise.all([
    bookSettings(),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.recipe.findMany({
      where: { ...PUBLIC_WHERE, ...(filter.categoryId && { categoryId: filter.categoryId }), ...(filter.ownerPersonId && { ownerPersonId: filter.ownerPersonId }) },
      include: {
        owner: true,
        photos: { where: { kind: "masakan", includeInBook: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], take: 1 },
      },
    }),
  ]);

  const toBook = (r: (typeof recipes)[number]) => ({
    id: r.id,
    title: r.title,
    owner: r.owner?.name ?? null,
    servings: r.servings,
    cookTime: r.cookTime,
    ingredients: lines(r.ingredientsText),
    steps: lines(r.stepsText),
    story: r.originStory?.trim() || null,
    memory: r.memoryNote?.trim() || null,
    photoUrl: r.photos[0] ? pdfImg(r.photos[0].cloudinaryPublicId, 1000) : null,
  });
  const byTitle = (a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title, "id");

  const groups: BookGroup[] = categories
    .map((c) => ({ id: c.id, name: c.name, recipes: recipes.filter((r) => r.categoryId === c.id).map(toBook).sort(byTitle) }))
    .filter((g) => g.recipes.length > 0);
  const loose = recipes.filter((r) => !r.categoryId).map(toBook).sort(byTitle);
  if (loose.length) groups.push({ id: "tanpa-kategori", name: "Tanpa kategori", recipes: loose });

  return { settings, groups, total: recipes.length };
}

// Pilihan "semua / per kategori / per pemilik" beserta jumlah resep publiknya; yang kosong tidak ditampilkan.
export async function bookOptions() {
  const [categories, people, byCategory, byOwner] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.person.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.recipe.groupBy({ by: ["categoryId"], where: PUBLIC_WHERE, _count: true }),
    prisma.recipe.groupBy({ by: ["ownerPersonId"], where: PUBLIC_WHERE, _count: true }),
  ]);
  const cat = new Map(byCategory.map((g) => [g.categoryId, g._count]));
  const own = new Map(byOwner.map((g) => [g.ownerPersonId, g._count]));
  return {
    total: byCategory.reduce((n, g) => n + g._count, 0),
    categories: categories.filter((c) => cat.get(c.id)).map((c) => ({ id: c.id, name: c.name, count: cat.get(c.id) ?? 0 })),
    people: people.filter((p) => own.get(p.id)).map((p) => ({ id: p.id, name: p.name, count: own.get(p.id) ?? 0 })),
  };
}
