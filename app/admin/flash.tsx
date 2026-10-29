import { CircleAlert, CircleCheck } from "lucide-react";

export function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  const Icon = error ? CircleAlert : CircleCheck;
  return (
    <p role={error ? "alert" : "status"} className={`flex items-center gap-2 rounded-lg p-4 ${error ? "bg-jambu text-red-900" : "bg-pandan text-green-900"}`}>
      <Icon className="size-5 shrink-0" aria-hidden /> {error ?? ok}
    </p>
  );
}
