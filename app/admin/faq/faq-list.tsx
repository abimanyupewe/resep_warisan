"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteFaq, saveFaq } from "./actions";

export type FaqItem = { id: string; question: string; answer: string; sortOrder: number; published: boolean };

export function FaqList({ items }: { items: FaqItem[] }) {
  // null = tertutup, "new" = tambah, FaqItem = ubah.
  const [editing, setEditing] = useState<FaqItem | "new" | null>(null);
  const it = editing && editing !== "new" ? editing : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl font-semibold">Pertanyaan umum ({items.length})</CardTitle>
        <CardAction><Button onClick={() => setEditing("new")}><Plus aria-hidden /> Tambah</Button></CardAction>
      </CardHeader>
      <CardContent>
        {items.length === 0 && <p className="text-muted-foreground">Belum ada FAQ. Bagian FAQ di halaman depan baru tampil setelah ada yang berstatus tampil.</p>}
        {items.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pertanyaan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Urutan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((x) => (
                <TableRow key={x.id} onClick={() => setEditing(x)} className="cursor-pointer">
                  <TableCell className="whitespace-normal">
                    <button type="button" className="min-h-12 text-left font-semibold hover:underline" onClick={(e) => { e.stopPropagation(); setEditing(x); }}>
                      {x.question}
                    </button>
                  </TableCell>
                  <TableCell>{x.published ? <Badge className="bg-pandan text-foreground">Tampil</Badge> : <Badge className="bg-secondary text-secondary-foreground">Disembunyikan</Badge>}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{x.sortOrder}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-semibold">{it ? "Ubah FAQ" : "Tambah FAQ"}</DialogTitle>
                <DialogDescription className="text-base">Tampil di halaman depan. Urutan kecil tampil lebih dulu.</DialogDescription>
              </DialogHeader>
              <form action={saveFaq.bind(null, it?.id ?? null)} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1 font-semibold">
                  Pertanyaan
                  <Input name="question" required maxLength={200} defaultValue={it?.question} placeholder="mis. Siapa yang boleh menambah resep?" />
                </label>
                <label className="flex flex-col gap-1 font-semibold">
                  Jawaban
                  <Textarea name="answer" required maxLength={2000} rows={5} defaultValue={it?.answer} />
                </label>
                <label className="flex flex-col gap-1 font-semibold">
                  Urutan
                  <Input name="sortOrder" type="number" defaultValue={it?.sortOrder ?? 0} />
                </label>
                <label className="flex min-h-12 items-center gap-3 font-semibold">
                  <input type="checkbox" name="published" defaultChecked={it?.published ?? true} className="size-5 accent-primary" />
                  Tampilkan di halaman depan
                </label>
                <Button type="submit"><Save aria-hidden /> Simpan</Button>
              </form>
              {it && (
                <form action={deleteFaq.bind(null, it.id)} className="border-t pt-4">
                  <Button type="submit" variant="destructive" className="w-full"><Trash2 aria-hidden /> Hapus FAQ</Button>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
