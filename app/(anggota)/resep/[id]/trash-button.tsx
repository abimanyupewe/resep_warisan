"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trashRecipe } from "../actions";

// Hapus selalu minta konfirmasi (prinsip 9 aksesibilitas); resep tetap bisa dikembalikan dari tempat sampah.
export function TrashButton({ id, title }: { id: string; title: string }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="lg" />}><Trash2 aria-hidden /> Hapus</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold">Hapus resep ini?</DialogTitle>
          <DialogDescription className="text-base">
            &quot;{title}&quot; akan dipindah ke tempat sampah. Resep masih bisa dikembalikan, jadi tidak hilang selamanya.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <form action={trashRecipe.bind(null, id)}>
            <Button type="submit" variant="destructive" size="lg" className="w-full"><Trash2 aria-hidden /> Ya, hapus</Button>
          </form>
          <DialogClose render={<Button variant="outline" size="lg" className="w-full" />}>Batal</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
