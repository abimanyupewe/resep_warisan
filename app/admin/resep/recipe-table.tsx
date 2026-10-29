"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type Recipe = {
  id: string; title: string; category: string; owner: string; status: string; difficulty: string | null;
  servings: string | null; cookTime: string | null; ingredients: string; steps: string; originStory: string; memoryNote: string;
  createdBy: string; createdAt: string; updatedBy: string; updatedAt: string;
};

const STATUS: Record<string, { label: string; tone: string }> = {
  draf: { label: "Draf", tone: "bg-secondary text-secondary-foreground" },
  perlu_dicek: { label: "Perlu dicek", tone: "bg-kunyit text-amber-950" },
  lengkap: { label: "Lengkap", tone: "bg-pandan text-green-950" },
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, tone: "" };
  return <Badge className={s.tone}>{s.label}</Badge>;
}

export function RecipeTable({ rows }: { rows: Recipe[] }) {
  const [selected, setSelected] = useState<Recipe | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resep</TableHead>
            <TableHead className="hidden sm:table-cell">Kategori</TableHead>
            <TableHead className="hidden md:table-cell">Pemilik</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Diperbarui</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} onClick={() => setSelected(r)} className="cursor-pointer">
              <TableCell>
                <button type="button" className="min-h-12 text-left font-semibold hover:underline" onClick={(e) => { e.stopPropagation(); setSelected(r); }}>
                  {r.title}
                </button>
                <span className="block text-sm text-muted-foreground sm:hidden">{r.category}</span>
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">{r.category}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{r.owner}</TableCell>
              <TableCell><StatusBadge status={r.status} /></TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">{r.updatedAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-semibold">{selected.title}</DialogTitle>
                <DialogDescription className="text-base">Diperbarui {selected.updatedBy}, {selected.updatedAt}</DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2">
                <dt className="text-muted-foreground">Status</dt>
                <dd><StatusBadge status={selected.status} /></dd>
                <dt className="text-muted-foreground">Kategori</dt>
                <dd>{selected.category}</dd>
                <dt className="text-muted-foreground">Pemilik</dt>
                <dd>{selected.owner}</dd>
                {selected.difficulty && <><dt className="text-muted-foreground">Kesulitan</dt><dd>{cap(selected.difficulty)}</dd></>}
                {selected.servings && <><dt className="text-muted-foreground">Porsi</dt><dd>{selected.servings}</dd></>}
                {selected.cookTime && <><dt className="text-muted-foreground">Waktu</dt><dd>{selected.cookTime}</dd></>}
                <dt className="text-muted-foreground">Dibuat</dt>
                <dd>{selected.createdBy}, {selected.createdAt}</dd>
              </dl>
              {[["Bahan", selected.ingredients], ["Langkah", selected.steps], ["Asal-usul", selected.originStory], ["Catatan kenangan", selected.memoryNote]].map(([h, t]) =>
                t || h === "Bahan" || h === "Langkah" ? (
                  <section key={h}>
                    <h3 className="font-semibold">{h}</h3>
                    <p className="whitespace-pre-line text-muted-foreground">{t || "Belum diisi."}</p>
                  </section>
                ) : null,
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
