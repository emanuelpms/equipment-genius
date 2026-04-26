import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/showcase")({ component: Layout });
function Layout() {
  useStore.getState().login("admin", "Administrador");
  return <AppShell scope="seller" />;
}
