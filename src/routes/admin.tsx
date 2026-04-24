import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getCurrentRole } from "@/lib/auth";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const { auth, login, logout } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getCurrentRole().then(({ role, login: name }) => {
      if (role) login(role, name ?? "Usuário");
      else logout();
      setReady(true);
    });
  }, [login, logout]);

  if (!ready) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Verificando acesso…</div>;
  if (!auth.role) return <Navigate to="/" />;
  if (auth.role !== "admin") return <Navigate to="/showcase" />;
  return <AppShell scope="admin" />;
}
