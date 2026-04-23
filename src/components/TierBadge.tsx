import { tierMeta, type Tier } from "@/lib/store";
import { Crown, Star, Circle } from "lucide-react";

const icon = { premium: Crown, medium: Star, low: Circle } as const;

export function TierBadge({ tier, size = "sm" }: { tier: Tier; size?: "sm" | "md" }) {
  const meta = tierMeta[tier] ?? tierMeta.medium;
  const Ic = icon[tier] ?? icon.medium;
  const sizing = size === "md" ? "text-xs px-3 py-1" : "text-[10px] px-2 py-0.5";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider text-background ${meta.gradient} ${sizing}`}>
      <Ic className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} />
      {meta.label}
    </span>
  );
}
