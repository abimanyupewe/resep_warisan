import { login } from "./actions";

export const metadata = { title: "Masuk · Dapur Uti" };
// Membaca searchParams (pesan galat) saat request, jadi tidak punya cangkang statis.
export const instant = false;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto w-full max-w-md p-6">
      <h1 className="mb-6 text-3xl font-bold">Dapur Uti</h1>
      {error && <p role="alert" className="mb-4 bg-red-100 p-3 text-red-900">{error}</p>}
      <form action={login} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          Email
          <input name="email" type="email" required autoComplete="username" className="min-h-12 border-2 border-neutral-400 px-3 text-black" />
        </label>
        <label className="flex flex-col gap-1">
          Password
          <input name="password" type="password" required autoComplete="current-password" className="min-h-12 border-2 border-neutral-400 px-3 text-black" />
        </label>
        <button className="min-h-12 bg-amber-800 px-4 font-semibold text-white">Masuk</button>
      </form>
    </main>
  );
}
