import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getCurrentRole } from "@/lib/auth";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/showcase")({ component: Layout });
function Layout() {
  const { login, logout } = useStore();
  const [serverRole, setServerRole] = useState<"loading" | "admin" | "seller" | null>("loading");

  useEffect(() => {
    getCurrentRole().then(({ role, login: name }) => {
      if (role) login(role, name ?? "Usuário");
      else logout();
      setServerRole(role ?? null);
    });
  }, [login, logout]);

  if (serverRole === "loading") return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Verificando acesso…</div>;
  if (!serverRole) return <Navigate to="/" />;
  return <AppShell scope="seller" />;
}
