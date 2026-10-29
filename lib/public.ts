// Resep yang boleh dilihat pengunjung tanpa login: bukan yang di sampah dan bukan draf (belum layak dibaca).
export const PUBLIC_WHERE = { deletedAt: null, status: { not: "draf" as const } };
