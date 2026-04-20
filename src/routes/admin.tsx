import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const role = useStore((s) => s.auth.role);
  if (!role) return <Navigate to="/" />;
  if (role !== "admin") return <Navigate to="/showcase" />;
  return <AppShell scope="admin" />;
}
