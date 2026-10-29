"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Batas akun baru per 24 jam. Pendaftaran langsung aktif tanpa persetujuan, jadi batas ini yang mencegah
// bot membanjiri database dan mengisi resep sampah. shortcut: batas global, bukan per IP; ganti ke Turnstile bila disalahgunakan.
const MAX_PER_DAY = 30;

const fail = (msg: string): never => redirect(`/daftar?error=${encodeURIComponent(msg)}`);

// Pendaftaran mandiri, langsung aktif dan langsung masuk. Endpoint sign-up Better Auth tetap ditutup (disableSignUp);
// akun dibuat di sini lewat adapter internal, sama seperti cara seed membuat akun.
export async function daftar(formData: FormData) {
  // Kolom jebakan: tersembunyi bagi manusia, diisi otomatis oleh bot. Pura-pura berhasil agar bot tidak belajar.
  if (formData.get("website")) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2 || name.length > 60) fail("Nama harus 2 sampai 60 huruf.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 120) fail("Alamat email belum benar.");
  if (password.length < 8) fail("Password minimal 8 karakter.");
  if (password.length > 128) fail("Password terlalu panjang.");
  if ((await prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 864e5) } } })) >= MAX_PER_DAY)
    fail("Pendaftaran hari ini sudah penuh. Coba lagi besok, atau hubungi admin keluarga.");

  const ctx = await auth.$context;
  if (await ctx.internalAdapter.findUserByEmail(email)) fail("Email ini sudah terdaftar. Coba masuk, atau hubungi admin keluarga.");

  const user = await ctx.internalAdapter.createUser({ email, name, emailVerified: false, role: "anggota" }, { method: "admin" });
  await ctx.internalAdapter.linkAccount({ userId: user.id, providerId: "credential", accountId: user.id, password: await ctx.password.hash(password) });
  await audit(user.id, "user.signup", "user", user.id);

  // Langsung masuk supaya anggota baru tidak perlu mengetik ulang email dan password.
  try {
    await auth.api.signInEmail({ body: { email, password }, headers: await headers() });
  } catch {
    redirect("/login?ok=" + encodeURIComponent("Akun berhasil dibuat. Silakan masuk."));
  }
  redirect("/beranda");
}
