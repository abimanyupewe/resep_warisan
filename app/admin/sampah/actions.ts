"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export async function restoreRecipe(id: string) {
  const admin = await requireAdmin();
  const { count } = await prisma.recipe.updateMany({
    where: { id, deletedAt: { not: null } },
    data: { deletedAt: null, updatedById: admin.id },
  });
  if (!count) redirect("/admin/sampah?error=" + encodeURIComponent("Resep tidak ada di sampah") + `&t=${Date.now()}`);
  await audit(admin.id, "recipe.restore", "recipe", id);
  redirect("/admin/sampah?ok=" + encodeURIComponent("Resep dikembalikan") + `&t=${Date.now()}`);
}
