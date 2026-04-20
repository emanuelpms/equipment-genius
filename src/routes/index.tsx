import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Shield, Users, ArrowRight, Package } from "lucide-react";

export const Route = createFileRoute("/")({ component: Login });

function Login() {
  const { auth, login } = useStore();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "seller">("seller");

  if (auth.role) return <Navigate to={auth.role === "admin" ? "/admin" : "/showcase"} />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login(role, name.trim() || (role === "admin" ? "Admin" : "Vendedor"));
    nav({ to: role === "admin" ? "/admin" : "/showcase" });
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.78_0.2_280)] grid place-items-center shadow-glow">
            <Package className="h-6 w-6 text-background" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Catálogo Pro</h1>
            <p className="text-xs text-muted-foreground">Plataforma de equipamentos</p>
          </div>
        </div>

        <form onSubmit={submit} className="glass rounded-2xl p-7 shadow-lg">
          <h2 className="font-display text-2xl font-bold mb-1.5">Entrar</h2>
          <p className="text-sm text-muted-foreground mb-6">Selecione seu perfil para continuar</p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {([
              { v: "seller", icon: Users, t: "Vendedor", d: "Vitrine" },
              { v: "admin", icon: Shield, t: "Admin", d: "Gerenciar" },
            ] as const).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setRole(o.v)}
                className={`relative rounded-xl border p-4 text-left transition-all ${
                  role === o.v ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <o.icon className={`h-5 w-5 mb-2 ${role === o.v ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-sm font-semibold">{o.t}</div>
                <div className="text-[11px] text-muted-foreground">{o.d}</div>
              </button>
            ))}
          </div>

          <label className="block text-xs font-medium text-muted-foreground mb-2">Seu nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como devemos te chamar?"
            className="w-full bg-input/40 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary mb-5"
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-[oklch(0.78_0.2_280)] text-background font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-95 transition shadow-glow"
          >
            Entrar <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          Demonstração local — dados salvos no navegador
        </p>
      </div>
    </div>
  );
}
