import { LogIn } from "lucide-react";
import { Flash } from "@/app/admin/flash";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { login } from "./actions";

export const metadata = { title: "Masuk · Dapur Uti" };
// Membaca searchParams (pesan galat) saat request, jadi tidak punya cangkang statis.
export const instant = false;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="flex w-full max-w-md flex-col gap-6">
        <header className="text-center">
          <h1 className="font-display text-4xl font-semibold">Dapur Uti</h1>
          <p className="text-muted-foreground">Resep warisan keluarga</p>
        </header>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <Flash error={error} />
            <form action={login} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 font-semibold">
                Email
                <Input name="email" type="email" required autoComplete="username" />
              </label>
              <label className="flex flex-col gap-1 font-semibold">
                Password
                <PasswordInput name="password" required autoComplete="current-password" />
              </label>
              <Button type="submit" size="lg"><LogIn aria-hidden /> Masuk</Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">Belum punya akun atau lupa password? Hubungi admin keluarga.</p>
      </div>
    </main>
  );
}
