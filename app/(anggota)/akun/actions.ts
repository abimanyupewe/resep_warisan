"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/member";
import { prisma } from "@/lib/prisma";

const SIZES = ["normal", "besar", "sangat_besar"] as const;

export async function setFontSize(formData: FormData) {
  const user = await requireUser();
  const size = SIZES.find((s) => s === formData.get("fontSize"));
  if (!size) redirect("/akun?error=" + encodeURIComponent("Pilih salah satu ukuran huruf"));
  await prisma.user.update({ where: { id: user.id }, data: { fontSize: size } });
  redirect("/akun?ok=" + encodeURIComponent("Ukuran huruf disimpan"));
}
