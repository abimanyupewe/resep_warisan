"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Opt = { value: string; label: string };
const select = "h-12 min-w-0 rounded-md border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";

// `values` = parameter aktif dari server (q, sort, filter), supaya tidak perlu useSearchParams.
export function ListControls({ values, sorts, filters = [], placeholder }: {
  values: Record<string, string>;
  sorts: Opt[];
  filters?: { name: string; label: string; options: Opt[] }[];
  placeholder: string;
}) {
  const router = useRouter();
  const path = usePathname();
  const [q, setQ] = useState(values.q ?? "");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Ubah satu parameter; halaman kembali ke 1 karena hasilnya berubah.
  const go = (patch: Record<string, string>) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...values, ...patch })) if (v) next.set(k, v);
    router.replace(`${path}?${next}`);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={q}
          placeholder={placeholder}
          aria-label="Cari"
          className="pl-10"
          onChange={(e) => {
            setQ(e.target.value);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => go({ q: e.target.value.trim() }), 350);
          }}
        />
      </div>
      <div className="flex gap-2">
        {filters.map((f) => (
          <select key={f.name} aria-label={f.label} value={values[f.name] ?? ""} onChange={(e) => go({ [f.name]: e.target.value })} className={`${select} flex-1 sm:w-44 sm:flex-none`}>
            <option value="">{f.label}</option>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
        <select aria-label="Urutkan" value={values.sort || sorts[0].value} onChange={(e) => go({ sort: e.target.value })} className={`${select} flex-1 sm:w-56 sm:flex-none`}>
          {sorts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}
