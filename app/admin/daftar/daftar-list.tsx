"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteItem, saveItem } from "./actions";

export type Item = { id: string; name: string; sortOrder: number; relationNote?: string | null; used: number };

export function DaftarCard({ kind, title, noun, items }: { kind: "category" | "person"; title: string; noun: string; items: Item[] }) {
  const person = kind === "person";
  // null = tertutup, "new" = tambah, Item = ubah.
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const it = editing && editing !== "new" ? editing : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl font-semibold">{title} ({items.length})</CardTitle>
        <CardAction><Button onClick={() => setEditing("new")}><Plus aria-hidden /> Tambah</Button></CardAction>
      </CardHeader>
      <CardContent>
        {items.length === 0 && <p className="text-muted-foreground">Belum ada {noun}.</p>}
        {items.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                {person && <TableHead className="hidden sm:table-cell">Hubungan</TableHead>}
                <TableHead className="text-right">Resep</TableHead>
                <TableHead className="text-right">Urutan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((x) => (
                <TableRow key={x.id} onClick={() => setEditing(x)} className="cursor-pointer">
                  <TableCell>
                    <button type="button" className="min-h-12 text-left font-semibold hover:underline" onClick={(e) => { e.stopPropagation(); setEditing(x); }}>
                      {x.name}
                    </button>
                  </TableCell>
                  {person && <TableCell className="hidden text-muted-foreground sm:table-cell">{x.relationNote || "-"}</TableCell>}
                  <TableCell className="text-right">{x.used}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{x.sortOrder}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-semibold">{it ? it.name : `Tambah ${noun}`}</DialogTitle>
                <DialogDescription className="text-base">
                  {it ? `Ubah data ${noun} ini.` : `Isi data ${noun} baru.`} Urutan kecil tampil lebih dulu.
                </DialogDescription>
              </DialogHeader>
              <form action={saveItem.bind(null, kind, it?.id ?? null)} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1 font-semibold">
                  Nama
                  <Input name="name" required defaultValue={it?.name} placeholder="Nama" />
                </label>
                {person && (
                  <label className="flex flex-col gap-1 font-semibold">
                    Hubungan
                    <Input name="relationNote" defaultValue={it?.relationNote ?? ""} placeholder="mis. Nenek" />
                  </label>
                )}
                <label className="flex flex-col gap-1 font-semibold">
                  Urutan
                  <Input name="sortOrder" type="number" defaultValue={it?.sortOrder ?? 0} />
                </label>
                <Button type="submit"><Save aria-hidden /> Simpan</Button>
              </form>
              {it && (
                <form action={deleteItem.bind(null, kind, it.id)} className="border-t pt-4">
                  <Button type="submit" variant="destructive" className="w-full" disabled={it.used > 0}>
                    <Trash2 aria-hidden /> Hapus {noun}
                  </Button>
                  {it.used > 0 && <p className="mt-2 text-sm text-muted-foreground">Masih dipakai {it.used} resep (termasuk di sampah), jadi belum bisa dihapus.</p>}
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
