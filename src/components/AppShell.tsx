import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { LayoutDashboard, Package, Sliders, Tags, Sparkles, LogOut, Settings, ShoppingBag } from "lucide-react";

export function AppShell({ scope }: { scope: "admin" | "seller" }) {
  const { auth, logout } = useStore();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const adminLinks = [
    { to: "/admin", label: "Visão Geral", icon: LayoutDashboard, end: true },
    { to: "/admin/equipments", label: "Equipamentos", icon: Package },
    { to: "/admin/fields", label: "Colunas Comparativas", icon: Sliders },
    { to: "/admin/categories", label: "Categorias de Uso", icon: Tags },
    { to: "/admin/differentials", label: "Diferenciais", icon: Sparkles },
  ];
  const sellerLinks = [
    { to: "/showcase", label: "Vitrine", icon: ShoppingBag, end: true },
    { to: "/showcase/compare", label: "Comparar", icon: Sliders },
  ];
  const links = scope === "admin" ? adminLinks : sellerLinks;

  const isActive = (to: string, end?: boolean) => (end ? path === to : path.startsWith(to));

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar">
        <div className="px-5 py-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-[oklch(0.78_0.2_280)] grid place-items-center shadow-glow">
              <Package className="h-5 w-5 text-background" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-foreground leading-none">Catálogo</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{scope === "admin" ? "Admin" : "Vendas"}</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {links.map((l) => {
            const active = isActive(l.to, l.end);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active ? "bg-primary/15 text-foreground shadow-[inset_0_0_0_1px_oklch(0.68_0.18_270/0.3)]" : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                }`}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          {scope === "admin" ? (
            <Link to="/showcase" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40">
              <ShoppingBag className="h-4 w-4" /> Ver vitrine
            </Link>
          ) : (
            auth.role === "admin" && (
              <Link to="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40">
                <Settings className="h-4 w-4" /> Painel admin
              </Link>
            )
          )}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-accent grid place-items-center text-xs font-semibold">{auth.name?.[0]?.toUpperCase() ?? "U"}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{auth.name}</div>
              <div className="text-[10px] text-muted-foreground capitalize">{auth.role}</div>
            </div>
            <button onClick={() => { logout(); nav({ to: "/" }); }} className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-accent/60">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <Outlet />
      </main>
    </div>
  );
}
