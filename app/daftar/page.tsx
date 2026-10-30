import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Flash } from "@/app/admin/flash";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { daftar } from "./actions";

export const metadata = { title: "Daftar · Dapur Uti" };
// Membaca searchParams (pesan galat) saat request, jadi tidak punya cangkang statis.
export const instant = false;

const label = "flex flex-col gap-1 text-sm font-semibold text-muted-foreground focus-within:text-primary";

export default async function DaftarPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <AuthShell>
      <Card className="rounded-2xl shadow-lg">
        <CardContent className="flex flex-col gap-6 py-2">
          <Flash error={error} />
          <form action={daftar} className="flex flex-col gap-6">
            <label className={label}>
              Nama
              <Input name="name" required minLength={2} maxLength={60} autoComplete="name" placeholder="mis. Budhe Sri" />
            </label>
            <label className={label}>
              Email
              <Input name="email" type="email" required autoComplete="username" />
            </label>
            <label className={label}>
              <span>Password <span className="font-normal">(minimal 8 karakter)</span></span>
              <PasswordInput name="password" required minLength={8} autoComplete="new-password" />
            </label>
            {/* Kolom jebakan untuk bot; disembunyikan dari pengguna dan pembaca layar. */}
            <div aria-hidden className="absolute -left-[9999px]"><input name="website" tabIndex={-1} autoComplete="off" /></div>
            <Button type="submit" size="lg" className="w-full"><UserPlus aria-hidden /> Daftar</Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">Setelah mendaftar, Anda langsung bisa membaca, menambah, dan mengubah resep keluarga.</p>
      <p className="text-center">Sudah punya akun? <Link href="/login" className="font-semibold text-primary underline">Masuk</Link></p>
    </AuthShell>
  );
}
