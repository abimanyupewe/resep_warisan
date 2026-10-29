import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/recipes";

// Dipanggil di setiap halaman dan server action anggota. fontSize dibaca dari DB karena tidak ada di sesi.
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const row = await prisma.user.findUnique({ where: { id: user.id }, select: { fontSize: true } });
  return { ...user, fontSize: row?.fontSize ?? "normal" };
}

// Ukuran teks baca per pilihan akun (KF18).
export const FONT_SIZE = { normal: "1.125rem", besar: "1.375rem", sangat_besar: "1.625rem" } as const;
