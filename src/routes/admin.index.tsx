import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, tierMeta } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Package, Sliders, Tags, Sparkles, ArrowUpRight, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  const { equipments, fields, categories, differentials } = useStore();
  const counts = (["premium", "medium", "low"] as const).map((t) => ({
    tier: t, n: equipments.filter((e) => e.tier === t).length,
  }));

  const stats = [
    { label: "Equipamentos", v: equipments.length, icon: Package, to: "/admin/equipments" },
    { label: "Colunas comparativas", v: fields.length, icon: Sliders, to: "/admin/fields" },
    { label: "Categorias", v: categories.length, icon: Tags, to: "/admin/categories" },
    { label: "Diferenciais", v: differentials.length, icon: Sparkles, to: "/admin/differentials" },
  ];

  return (
    <div className="px-8 py-8 max-w-6xl">
      <PageHeader
        title="Visão geral"
        subtitle="Gerencie equipamentos, colunas comparativas, categorias e diferenciais. Tudo é dinâmico e aparece automaticamente na vitrine de vendas."
        action={
          <Link to="/admin/equipments" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-[oklch(0.78_0.2_280)] text-background text-sm font-semibold shadow-glow">
            <Plus className="h-4 w-4" /> Novo equipamento
          </Link>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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
