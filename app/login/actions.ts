"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function login(formData: FormData) {
  try {
    await auth.api.signInEmail({
      body: { email: String(formData.get("email")).trim(), password: String(formData.get("password")) },
      headers: await headers(),
    });
  } catch {
    redirect("/login?error=Email atau password salah");
  }
  redirect("/admin");
}

export async function logout() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
