import { redirect } from "next/navigation";
import { currentUser } from "@/lib/recipes";

// Dipanggil di setiap halaman dan server action admin; layout saja tidak cukup karena tidak dirender ulang saat navigasi.
export async function requireAdmin() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");
  return user;
}
