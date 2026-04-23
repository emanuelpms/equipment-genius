import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { LayoutDashboard, Package, Sliders, Tags, Sparkles, LogOut, Settings, ShoppingBag, Building2, Swords } from "lucide-react";

export function AppShell({ scope }: { scope: "admin" | "seller" }) {
  const { auth, logout } = useStore();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const adminLinks = [
    { to: "/admin", label: "Visão Geral", icon: LayoutDashboard, end: true },
    { to: "/admin/brands", label: "Marcas", icon: Building2 },
    { to: "/admin/equipments", label: "Equipamentos", icon: Package },
    { to: "/admin/fields", label: "Colunas Comparativas", icon: Sliders },
    { to: "/admin/categories", label: "Categorias de Uso", icon: Tags },
    { to: "/admin/differentials", label: "Diferenciais", icon: Sparkles },
  ];
  const sellerLinks = [
    { to: "/showcase", label: "Vitrine", icon: ShoppingBag, end: true },
    { to: "/showcase/compare", label: "Comparar", icon: Swords },
  ];
  const links = scope === "admin" ? adminLinks : sellerLinks;

  const isActive = (to: string, end?: boolean) => (end ? path === to : path.startsWith(to));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside
        className="hidden md:flex w-64 flex-col text-sidebar-foreground border-r border-sidebar-border"
        style={{ background: "var(--sidebar)" }}
      >
        <div className="px-5 py-5 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[oklch(0.65_0.2_250)] to-[oklch(0.55_0.22_270)] grid place-items-center shadow-glow">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-sm leading-none">Samsung Medison</div>
              <div className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest mt-1">{scope === "admin" ? "Admin · Catálogo" : "Sales Intelligence"}</div>
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
                  active
                    ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_oklch(1_0_0/0.12)]"
                    : "text-sidebar-foreground/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-1">
          {scope === "admin" ? (
            <Link to="/showcase" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:text-white hover:bg-white/5">
              <ShoppingBag className="h-4 w-4" /> Ver vitrine
            </Link>
          ) : (
            auth.role === "admin" && (
              <Link to="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:text-white hover:bg-white/5">
                <Settings className="h-4 w-4" /> Painel admin
              </Link>
            )
          )}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-white/10 grid place-items-center text-xs font-semibold">{auth.name?.[0]?.toUpperCase() ?? "U"}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{auth.name}</div>
              <div className="text-[10px] text-sidebar-foreground/60 capitalize">{auth.role}</div>
            </div>
            <button onClick={() => { logout(); nav({ to: "/" }); }} className="text-sidebar-foreground/60 hover:text-destructive p-1.5 rounded-md hover:bg-white/5">
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
