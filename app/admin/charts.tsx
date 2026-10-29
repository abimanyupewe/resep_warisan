"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

type Row = { label: string; n: number };

const config = (label: string, color: string) => ({ n: { label, color } }) satisfies ChartConfig;

// Batang mendatar: label panjang (nama kategori/pemilik) tetap terbaca.
export function HBars({ rows, unit, color }: { rows: Row[]; unit: string; color: string }) {
  return (
    <ChartContainer config={config(unit, color)} className="w-full" style={{ height: Math.max(rows.length, 2) * 48 }}>
      <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 16 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis dataKey="label" type="category" width={96} tickLine={false} axisLine={false} tick={{ fontSize: 15 }} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
        <Bar dataKey="n" fill="var(--color-n)" radius={4} barSize={20}>
          <LabelList dataKey="n" position="right" fontSize={15} className="fill-foreground" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function DayBars({ rows, unit, color }: { rows: Row[]; unit: string; color: string }) {
  return (
    <ChartContainer config={config(unit, color)} className="h-56 w-full">
      <BarChart data={rows} margin={{ top: 20 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 15 }} />
        <YAxis hide allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
        <Bar dataKey="n" fill="var(--color-n)" radius={[4, 4, 0, 0]}>
          <LabelList dataKey="n" position="top" fontSize={15} className="fill-foreground" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
