import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  useStore.getState().login("admin", "Administrador");
  return <AppShell scope="admin" />;
}
