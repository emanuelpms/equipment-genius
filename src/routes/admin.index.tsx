import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, tierMeta, tierOrder } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Package, Sliders, Tags, Sparkles, ArrowUpRight, Plus, Building2, Star } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  const { equipments, fields, categories, differentials, brands } = useStore();
  const ownBrand = brands.find((b) => b.isOwn);
  const counts = tierOrder.map((t) => ({
    tier: t, n: equipments.filter((e) => e.tier === t).length,
  }));

  const stats = [
    { label: "Marcas", v: brands.length, icon: Building2, to: "/admin/brands" },
    { label: "Equipamentos", v: equipments.length, icon: Package, to: "/admin/equipments" },
    { label: "Colunas comparativas", v: fields.length, icon: Sliders, to: "/admin/fields" },
    { label: "Categorias", v: categories.length, icon: Tags, to: "/admin/categories" },
    { label: "Diferenciais", v: differentials.length, icon: Sparkles, to: "/admin/differentials" },
  ];

  return (
    <div className="px-8 py-8 max-w-6xl">
      <PageHeader
        title="Visão geral"
        subtitle="Gerencie marcas, equipamentos, colunas comparativas, categorias e diferenciais. Tudo é dinâmico e low-code."
        action={
          <Link to="/admin/equipments" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-[oklch(0.78_0.2_280)] text-background text-sm font-semibold shadow-glow">
            <Plus className="h-4 w-4" /> Novo equipamento
          </Link>
        }
      />

      {ownBrand ? (
        <div className="rounded-2xl glass p-5 mb-6 flex items-center gap-4 border-primary/40">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.78_0.2_280)] grid place-items-center text-background overflow-hidden">
            {ownBrand.logoUrl ? <img src={ownBrand.logoUrl} alt={ownBrand.name} className="h-full w-full object-cover" /> : <Star className="h-6 w-6 fill-current" />}
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-primary font-bold">Sua marca</div>
            <div className="font-display font-bold text-lg">{ownBrand.name}</div>
            <div className="text-xs text-muted-foreground">{equipments.filter((e) => e.brandId === ownBrand.id).length} equipamentos cadastrados</div>
          </div>
          <Link to="/admin/brands" className="text-xs px-3 py-2 rounded-lg border border-border hover:border-primary">Gerenciar marcas</Link>
        </div>
      ) : (
        <div className="rounded-2xl glass p-5 mb-6 flex items-center gap-4 border-warning/40">
          <Building2 className="h-8 w-8 text-warning" />
          <div className="flex-1">
            <div className="font-semibold">Nenhuma marca marcada como sua.</div>
            <div className="text-xs text-muted-foreground">Vá em Marcas e marque uma como "Minha Empresa" para destacá-la.</div>
          </div>
          <Link to="/admin/brands" className="text-xs px-3 py-2 rounded-lg bg-warning text-background font-semibold">Configurar agora</Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="group glass rounded-xl p-5 hover:border-primary/40 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/15 grid place-items-center text-primary"><s.icon className="h-5 w-5" /></div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
            </div>
            <div className="text-3xl font-display font-bold">{s.v}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {counts.map(({ tier, n }) => {
          const meta = tierMeta[tier];
          return (
            <div key={tier} className="rounded-xl p-5 glass overflow-hidden relative">
              <div className={`absolute inset-x-0 top-0 h-1 ${meta.gradient}`} />
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{meta.label}</div>
              <div className="text-4xl font-display font-bold">{n}</div>
              <div className="text-xs text-muted-foreground mt-1">equipamentos cadastrados</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
