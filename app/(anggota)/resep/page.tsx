import { Flash } from "@/app/admin/flash";
import { requireUser } from "@/lib/member";
import { RecipeList } from "../recipe-list";

export default async function DaftarResep({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireUser();
  const sp = await searchParams;
  return <RecipeList sp={sp} basePath="/resep" title="Resep masakan" flash={<Flash ok={sp.ok} error={sp.error} />} />;
}
