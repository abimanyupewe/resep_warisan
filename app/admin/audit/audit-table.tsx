"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type Log = { id: string; action: string; targetType: string; targetId: string | null; user: string; at: string; detail: string | null };

export function AuditTable({ logs }: { logs: Log[] }) {
  const [selected, setSelected] = useState<Log | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aksi</TableHead>
            <TableHead className="hidden sm:table-cell">Target</TableHead>
            <TableHead>Pengguna</TableHead>
            <TableHead className="hidden md:table-cell">Waktu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((l) => (
            <TableRow key={l.id} onClick={() => setSelected(l)} className="cursor-pointer">
              <TableCell>
                <button type="button" className="min-h-12 text-left font-semibold hover:underline" onClick={(e) => { e.stopPropagation(); setSelected(l); }}>
                  {l.action}
                </button>
                <span className="block text-sm text-muted-foreground md:hidden">{l.at}</span>
              </TableCell>
              <TableCell className="hidden sm:table-cell"><Badge variant="secondary">{l.targetType}</Badge></TableCell>
              <TableCell>{l.user}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{l.at}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-semibold">{selected.action}</DialogTitle>
                <DialogDescription className="text-base">{selected.at}</DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                <dt className="text-muted-foreground">Pengguna</dt>
                <dd>{selected.user}</dd>
                <dt className="text-muted-foreground">Target</dt>
                <dd>{selected.targetType}</dd>
                <dt className="text-muted-foreground">ID target</dt>
                <dd className="break-all text-sm">{selected.targetId ?? "-"}</dd>
              </dl>
              {selected.detail && (
                <section>
                  <h3 className="font-semibold">Rincian</h3>
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-sm">{selected.detail}</pre>
                </section>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
