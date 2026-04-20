import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name] || Icons.Box;
  return <Cmp {...props} />;
}
