import { CheckCircle2, Loader2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IndexStatus } from "@/lib/types";

const CONFIG: Record<
  IndexStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  indexed: {
    label: "Indexed",
    icon: CheckCircle2,
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    className: "text-accent-300 bg-accent-500/10 border-accent-500/20",
  },
  uploading: {
    label: "Uploading",
    icon: Clock,
    className: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "text-red-400 bg-red-500/10 border-red-500/20",
  },
};

export function StatusBadge({ status }: { status: IndexStatus }) {
  const cfg = CONFIG[status] ?? CONFIG.indexed;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        cfg.className
      )}
    >
      <Icon className={cn("h-3 w-3", status === "processing" && "animate-spin")} />
      {cfg.label}
    </span>
  );
}
