import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getCurrentRole } from "@/lib/auth";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const [serverRole, setServerRole] = useState<"loading" | "admin" | "seller" | null>("loading");

  useEffect(() => {
    getCurrentRole().then(({ role, login: name }) => {
      if (role) useStore.getState().login(role, name ?? "Usuário");
      else useStore.getState().logout();
      setServerRole(role ?? null);
    });
  }, []);

  if (serverRole === "loading") return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Verificando acesso…</div>;
  if (!serverRole) return <Navigate to="/" />;
  if (serverRole !== "admin") return <Navigate to="/showcase" />;
  return <AppShell scope="admin" />;
}
