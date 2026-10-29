import Link from "next/link";
import { LogOut, Save, ShieldCheck } from "lucide-react";
import { Flash } from "@/app/admin/flash";
import { logout } from "@/app/login/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FONT_SIZE, requireUser } from "@/lib/member";
import { setFontSize } from "./actions";
import { InstallApp } from "./install-app";

const OPTIONS = [
  ["normal", "Normal"],
  ["besar", "Besar"],
  ["sangat_besar", "Sangat besar"],
] as const;

export default async function Akun({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const user = await requireUser();
  const { ok, error } = await searchParams;

  return (
    <main className="mx-auto flex max-w-[680px] flex-col gap-5">
      <h1 className="font-display text-3xl font-semibold">Akun saya</h1>
      <Flash ok={ok} error={error} />

      <Card>
        <CardContent>
          <p className="font-display text-2xl font-semibold">{user.name}</p>
          <p className="text-muted-foreground">{user.email}</p>
          <p className="mt-2 text-sm text-muted-foreground">Lupa password? Minta admin keluarga untuk mengaturnya ulang.</p>
        </CardContent>
      </Card>

      <InstallApp />

      <Card>
        <CardHeader><CardTitle className="font-display text-2xl font-semibold">Ukuran huruf</CardTitle></CardHeader>
        <CardContent>
          <form action={setFontSize} className="flex flex-col gap-3">
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">Ukuran huruf resep</legend>
              {OPTIONS.map(([value, label]) => (
                <label key={value} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-muted">
                  <input type="radio" name="fontSize" value={value} defaultChecked={user.fontSize === value} className="size-5 accent-primary" />
                  <span>
                    <span className="block font-semibold">{label}</span>
                    <span className="block text-muted-foreground" style={{ fontSize: FONT_SIZE[value] }}>Contoh tulisan resep</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <Button type="submit" size="lg"><Save aria-hidden /> Simpan</Button>
          </form>
        </CardContent>
      </Card>

      {user.role === "admin" && <Link href="/admin" className={buttonVariants({ variant: "outline", size: "lg" })}><ShieldCheck aria-hidden /> Buka panel admin</Link>}

      <form action={logout}>
        <Button type="submit" variant="outline" size="lg" className="w-full"><LogOut aria-hidden /> Keluar</Button>
      </form>
    </main>
  );
}
