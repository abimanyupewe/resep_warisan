import { RecipeList } from "../../(anggota)/recipe-list";

export default async function Jelajah({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <RecipeList sp={await searchParams} basePath="/jelajah" title="Resep keluarga" />;
}
