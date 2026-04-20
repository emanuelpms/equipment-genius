import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/showcase")({ component: Layout });
function Layout() {
  const role = useStore((s) => s.auth.role);
  if (!role) return <Navigate to="/" />;
  return <AppShell scope="seller" />;
}
