"use client";

import { useState } from "react";
import { Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { restoreRecipe } from "./actions";

export type Trashed = {
  id: string;
  title: string;
  category: string;
  owner: string;
  status: string;
  deletedBy: string;
  deletedAt: string;
  ingredients: string;
  steps: string;
};

const STATUS: Record<string, string> = { draf: "Draf", perlu_dicek: "Perlu dicek", lengkap: "Lengkap" };

export function TrashTable({ rows }: { rows: Trashed[] }) {
  const [selected, setSelected] = useState<Trashed | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resep</TableHead>
            <TableHead className="hidden sm:table-cell">Kategori</TableHead>
            <TableHead className="hidden md:table-cell">Dihapus oleh</TableHead>
            <TableHead>Waktu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} onClick={() => setSelected(r)} className="cursor-pointer">
              <TableCell>
                <button type="button" className="min-h-12 text-left font-semibold hover:underline" onClick={(e) => { e.stopPropagation(); setSelected(r); }}>
                  {r.title}
                </button>
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">{r.category}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{r.deletedBy}</TableCell>
              <TableCell className="text-muted-foreground">{r.deletedAt}</TableCell>
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
                <DialogDescription className="text-base">Dihapus oleh {selected.deletedBy}, {selected.deletedAt}</DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2">
                <dt className="text-muted-foreground">Kategori</dt>
                <dd>{selected.category}</dd>
                <dt className="text-muted-foreground">Pemilik</dt>
                <dd>{selected.owner}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd><Badge variant="outline">{STATUS[selected.status] ?? selected.status}</Badge></dd>
              </dl>
              <section>
                <h3 className="font-semibold">Bahan</h3>
                <p className="whitespace-pre-line text-muted-foreground">{selected.ingredients || "Belum diisi."}</p>
              </section>
              <section>
                <h3 className="font-semibold">Langkah</h3>
                <p className="whitespace-pre-line text-muted-foreground">{selected.steps || "Belum diisi."}</p>
              </section>
              <form action={restoreRecipe.bind(null, selected.id)}>
                <Button type="submit" className="w-full"><Undo2 aria-hidden /> Kembalikan resep</Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
