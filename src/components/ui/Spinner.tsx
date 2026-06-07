import { Loader2 } from "lucide-react";

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
      <Loader2 className="h-8 w-8 animate-spin text-grass" />
      {label && <p className="text-sm font-bold">{label}</p>}
    </div>
  );
}
