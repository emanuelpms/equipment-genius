import { tierMeta, type Tier } from "@/lib/store";
import { Gem, Crown, Star, Circle, Dot } from "lucide-react";

const icon: Record<Tier, typeof Crown> = {
  "super-premium": Gem,
  premium: Crown,
  high: Star,
  mid: Circle,
  low: Dot,
};

export function TierBadge({ tier, size = "sm" }: { tier: Tier; size?: "sm" | "md" }) {
  const meta = tierMeta[tier] ?? tierMeta.mid;
  const Ic = icon[tier] ?? icon.mid;
  const sizing = size === "md" ? "text-xs px-3 py-1" : "text-[10px] px-2 py-0.5";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider text-white ${meta.gradient} ${sizing}`}>
      <Ic className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} />
      {meta.label}
    </span>
  );
}
