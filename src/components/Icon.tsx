import {
  Activity,
  Baby,
  BatteryCharging,
  Box,
  Droplets,
  Gem,
  HeartPulse,
  Layers,
  Radio,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Wand2,
  Wifi,
  Zap,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

const icons: Record<string, React.ComponentType<LucideProps>> = {
  Activity,
  Baby,
  BatteryCharging,
  Box,
  Droplets,
  Gem,
  HeartPulse,
  Layers,
  Radio,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Wand2,
  Wifi,
  Zap,
};

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = icons[name] || Box;
  return <Cmp {...props} />;
}
