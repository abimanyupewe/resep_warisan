import Link from "next/link";
import { LogIn } from "lucide-react";
import { Flash } from "@/app/admin/flash";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { login } from "./actions";

export const metadata = { title: "Masuk · Dapur Uti" };
// Membaca searchParams (pesan galat) saat request, jadi tidak punya cangkang statis.
export const instant = false;

const label = "flex flex-col gap-1 text-sm font-semibold text-muted-foreground focus-within:text-primary";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { error, ok } = await searchParams;
  return (
    <AuthShell>
      <Card className="rounded-2xl shadow-lg">
        <CardContent className="flex flex-col gap-6 py-2">
          <Flash ok={ok} error={error} />
          <form action={login} className="flex flex-col gap-6">
            <label className={label}>
              Email
              <Input name="email" type="email" required autoComplete="username" />
            </label>
            <label className={label}>
              Password
              <PasswordInput name="password" required autoComplete="current-password" />
            </label>
            <Button type="submit" size="lg" className="w-full"><LogIn aria-hidden /> Masuk</Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-center">Belum punya akun? <Link href="/daftar" className="font-semibold text-primary underline">Daftar</Link></p>
      <p className="text-center text-sm text-muted-foreground">Lupa password? Hubungi admin keluarga.</p>
    </AuthShell>
  );
}
