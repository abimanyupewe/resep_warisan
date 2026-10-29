// Parameter daftar admin (cari, urut, halaman) dibaca dari URL dan diproses di server.
type SP = Record<string, string | string[] | undefined>;

export type Sort = { value: string; label: string; orderBy: Record<string, "asc" | "desc"> };

// sort("updatedAt", "desc", "Terbaru") -> nilai URL "updatedAt:desc" + orderBy Prisma.
export const sort = (field: string, dir: "asc" | "desc", label: string): Sort => ({ value: `${field}:${dir}`, label, orderBy: { [field]: dir } });

export const one = (sp: SP, key: string) => {
  const v = sp[key];
  return (Array.isArray(v) ? v[0] : v) ?? "";
};

export function parseList(sp: SP, sorts: Sort[]) {
  return {
    q: one(sp, "q").trim().slice(0, 100),
    // Nilai sort di luar daftar jatuh ke urutan pertama, jadi tidak pernah masuk ke Prisma mentah.
    sort: sorts.find((s) => s.value === one(sp, "sort")) ?? sorts[0],
    page: Math.max(1, parseInt(one(sp, "page")) || 1),
  };
}

// Halaman di luar jangkauan (mis. setelah filter) dirapatkan ke halaman terakhir.
export function clampPage(page: number, total: number, perPage: number) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, pages);
  return { page: current, pages, skip: (current - 1) * perPage, take: perPage };
}

export const contains = (q: string) => ({ contains: q, mode: "insensitive" as const });
