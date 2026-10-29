"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { audit } from "@/lib/audit";
import { auth } from "@/lib/auth";

// Hasil akhir dilaporkan lewat ?ok= / ?error=; &t= membuat URL selalu baru agar modal di halaman menutup ulang.
async function run(action: string, userId: string | null, fn: () => Promise<unknown>, okMsg: string): Promise<never> {
  const admin = await requireAdmin();
  try {
    await fn();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal";
    redirect(`/admin/anggota?error=${encodeURIComponent(msg)}&t=${Date.now()}`);
  }
  await audit(admin.id, action, "user", userId ?? undefined);
  redirect(`/admin/anggota?ok=${encodeURIComponent(okMsg)}&t=${Date.now()}`);
}

export async function createMember(formData: FormData) {
  const email = String(formData.get("email")).trim();
  await run(
    "user.create",
    null,
    async () =>
      auth.api.createUser({
        body: { email, name: String(formData.get("name")).trim(), password: String(formData.get("password")) },
        headers: await headers(),
      }),
    `Akun ${email} dibuat`,
  );
}

export async function resetPassword(userId: string, formData: FormData) {
  await run(
    "user.reset_password",
    userId,
    async () => auth.api.setUserPassword({ body: { userId, newPassword: String(formData.get("password")) }, headers: await headers() }),
    "Password diganti",
  );
}

export async function setActive(userId: string, active: boolean) {
  const admin = await requireAdmin();
  if (userId === admin.id) redirect("/admin/anggota?error=" + encodeURIComponent("Akun sendiri tidak bisa dinonaktifkan") + `&t=${Date.now()}`);
  await run(
    active ? "user.unban" : "user.ban",
    userId,
    async () => (active ? auth.api.unbanUser : auth.api.banUser)({ body: { userId }, headers: await headers() }),
    active ? "Akun diaktifkan" : "Akun dinonaktifkan",
  );
}
