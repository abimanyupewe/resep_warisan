"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function login(formData: FormData) {
  let admin = false;
  try {
    const res = await auth.api.signInEmail({
      body: { email: String(formData.get("email")).trim(), password: String(formData.get("password")) },
      headers: await headers(),
    });
    admin = res.user.role === "admin";
  } catch {
    redirect("/login?error=Email atau password salah");
  }
  // Admin masuk ke panel; anggota biasa ke beranda resep.
  redirect(admin ? "/admin" : "/");
}

export async function logout() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
