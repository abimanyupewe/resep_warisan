"use client";

import { useState } from "react";
import { KeyRound, UserCheck, UserPlus, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createMember, resetPassword, setActive } from "../actions";

export type Member = { id: string; name: string; email: string; role: string | null; banned: boolean; createdAt: string };

const title = "font-display text-2xl font-semibold";

export function AddMember() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}><UserPlus aria-hidden /> Tambah anggota</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={title}>Tambah anggota</DialogTitle>
          <DialogDescription className="text-base">Buat akun baru. Bagikan email dan password awalnya kepada anggota.</DialogDescription>
        </DialogHeader>
        <form action={createMember} className="flex flex-col gap-3">
          <Input name="name" required placeholder="Nama (mis. Budhe Sri)" aria-label="Nama" />
          <Input name="email" type="email" required placeholder="Email" aria-label="Email" />
          <Input name="password" type="text" required minLength={8} placeholder="Password awal (min. 8 karakter)" aria-label="Password awal" />
          <Button type="submit">Buat akun</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MemberTable({ members, adminId }: { members: Member[]; adminId: string }) {
  const [selected, setSelected] = useState<Member | null>(null);
  const open = (m: Member) => setSelected(m);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead>Peran</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Dibuat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id} onClick={() => open(m)} className="cursor-pointer">
              <TableCell>
                <button type="button" className="min-h-12 text-left font-semibold hover:underline" onClick={(e) => { e.stopPropagation(); open(m); }}>
                  {m.name}
                </button>
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{m.email}</TableCell>
              <TableCell>{m.role === "admin" ? <Badge>Admin</Badge> : <Badge variant="secondary">Anggota</Badge>}</TableCell>
              <TableCell>{m.banned ? <Badge variant="destructive">Nonaktif</Badge> : <Badge variant="outline">Aktif</Badge>}</TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">{m.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className={title}>{selected.name}</DialogTitle>
                <DialogDescription className="text-base">{selected.email}</DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                <dt className="text-muted-foreground">Peran</dt>
                <dd>{selected.role === "admin" ? "Admin" : "Anggota"}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd>{selected.banned ? "Nonaktif" : "Aktif"}</dd>
                <dt className="text-muted-foreground">Dibuat</dt>
                <dd>{selected.createdAt}</dd>
              </dl>
              <form action={resetPassword.bind(null, selected.id)} className="flex flex-col gap-2 border-t pt-4">
                <label className="font-semibold" htmlFor="new-password">Ganti password</label>
                <div className="flex gap-2">
                  <Input id="new-password" name="password" type="text" required minLength={8} placeholder="Password baru" className="min-w-0 flex-1" />
                  <Button type="submit" variant="outline"><KeyRound aria-hidden /> Ganti</Button>
                </div>
              </form>
              {selected.id !== adminId && (
                <form action={setActive.bind(null, selected.id, selected.banned)}>
                  <Button type="submit" variant={selected.banned ? "default" : "destructive"} className="w-full">
                    {selected.banned ? <><UserCheck aria-hidden /> Aktifkan akun</> : <><UserX aria-hidden /> Nonaktifkan akun</>}
                  </Button>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
