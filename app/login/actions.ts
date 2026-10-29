"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PENDING } from "@/lib/pending";
import { prisma } from "@/lib/prisma";

export async function login(formData: FormData) {
  let admin = false;
  const email = String(formData.get("email")).trim();
  try {
    const res = await auth.api.signInEmail({
      body: { email, password: String(formData.get("password")) },
      headers: await headers(),
    });
    admin = res.user.role === "admin";
  } catch (e) {
    // Akun yang menunggu persetujuan atau dinonaktifkan ditolak setelah password terbukti benar; jelaskan alasannya.
    const banned = (e as { body?: { code?: string } })?.body?.code === "BANNED_USER";
    const row = banned ? await prisma.user.findUnique({ where: { email: email.toLowerCase() }, select: { banReason: true } }) : null;
    const msg = !banned
      ? "Email atau password salah"
      : row?.banReason === PENDING
        ? "Akun Anda masih menunggu persetujuan admin keluarga."
        : "Akun ini dinonaktifkan. Hubungi admin keluarga.";
    redirect(`/login?error=${encodeURIComponent(msg)}`);
  }
  // Admin masuk ke panel; anggota biasa ke beranda resep.
  redirect(admin ? "/admin" : "/");
}

export async function logout() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
