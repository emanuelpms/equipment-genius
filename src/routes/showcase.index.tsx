import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, tierMeta, type Tier, type Equipment } from "@/lib/store";
import { TierBadge } from "@/components/TierBadge";
import { Icon } from "@/components/Icon";
import { Search, Sparkles, ChevronRight, Check, X, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/showcase/")({ component: Showcase });

function Showcase() {
  const { equipments, categories, differentials, fields } = useStore();
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<Tier | "all">("all");
  const [cat, setCat] = useState<string | "all">("all");
  const [active, setActive] = useState<Equipment | null>(null);

  const filtered = useMemo(() => equipments.filter((e) =>
    (tier === "all" || e.tier === tier) &&
    (cat === "all" || e.categories.includes(cat)) &&
    (q === "" || e.name.toLowerCase().includes(q.toLowerCase()) || (e.tagline ?? "").toLowerCase().includes(q.toLowerCase()))
  ), [equipments, tier, cat, q]);

  const byTier: Record<Tier, Equipment[]> = {
    premium: filtered.filter((e) => e.tier === "premium"),
    medium: filtered.filter((e) => e.tier === "medium"),
    low: filtered.filter((e) => e.tier === "low"),
  };

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
      <div className="rounded-3xl overflow-hidden mb-8 relative" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(ellipse at top right, oklch(0.78 0.2 280 / 0.4), transparent 50%)" }} />
        <div className="relative px-8 py-10 md:py-14">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest bg-primary/15 text-primary px-3 py-1 rounded-full mb-4">
            <Sparkles className="h-3 w-3" /> Catálogo de Equipamentos
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight max-w-2xl">
            A linha completa <span className="gradient-text">para apresentar</span> ao seu cliente.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl">
            {equipments.length} modelos organizados por tier, categoria e diferenciais. Compare lado a lado em segundos.
          </p>
          <Link to="/showcase/compare" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition">
            Comparar modelos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar modelo..." className="w-full bg-card/60 border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div className="flex gap-1 bg-card/60 border border-border rounded-lg p-1">
          {(["all", "premium", "medium", "low"] as const).map((t) => (
            <button key={t} onClick={() => setTier(t)} className={`px-3 py-1.5 text-xs font-semibold rounded-md ${tier === t ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "all" ? "Todos tiers" : tierMeta[t].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-thin">
        <Chip active={cat === "all"} onClick={() => setCat("all")} icon="Layers" label="Todos" count={equipments.length} />
        {categories.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} icon={c.icon} label={c.name}
            count={equipments.filter((e) => e.categories.includes(c.id)).length} />
        ))}
      </div>

      {cat !== "all" && (() => {
        const c = categories.find((x) => x.id === cat)!;
        const best = equipments.filter((e) => e.bestFor.includes(cat));
        return (
          <section className="mb-10 rounded-2xl glass p-6 border-tier-premium/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg tier-premium-bg grid place-items-center text-background"><Icon name={c.icon} className="h-5 w-5" /></div>
              <div>
                <div className="text-xs uppercase tracking-widest text-tier-premium font-semibold">Melhores para {c.name}</div>
                <div className="text-sm text-muted-foreground">Modelos recomendados quando o foco é {c.name.toLowerCase()}.</div>
              </div>
            </div>
            {best.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum modelo destacado ainda. Marque "Melhor para" no admin.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {best.map((e) => <EquipCard key={e.id} e={e} categories={categories} differentials={differentials} onOpen={() => setActive(e)} />)}
              </div>
            )}
          </section>
        );
      })()}

      {(["premium", "medium", "low"] as const).map((t) => byTier[t].length > 0 && (
        <section key={t} className="mb-12">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1"><TierBadge tier={t} size="md" /></div>
              <h2 className="font-display text-2xl font-bold">Linha {tierMeta[t].label}</h2>
            </div>
            <span className="text-xs text-muted-foreground">{byTier[t].length} modelos</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {byTier[t].map((e) => <EquipCard key={e.id} e={e} categories={categories} differentials={differentials} onOpen={() => setActive(e)} />)}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">Nenhum modelo encontrado para os filtros.</div>
      )}

      {active && <DetailModal e={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function Chip({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: string; label: string; count: number }) {
  return (
    <button onClick={onClick} className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${active ? "bg-primary/15 border-primary text-foreground" : "bg-card/60 border-border text-muted-foreground hover:text-foreground"}`}>
      <Icon name={icon} className="h-3.5 w-3.5" />
      {label}
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/10">{count}</span>
    </button>
  );
}

function EquipCard({ e, categories, differentials, onOpen }: { e: Equipment; categories: ReturnType<typeof useStore.getState>["categories"]; differentials: ReturnType<typeof useStore.getState>["differentials"]; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="text-left group rounded-2xl overflow-hidden glass hover:border-primary/50 transition-all hover:-translate-y-0.5">
      <div className={`h-32 relative ${tierMeta[e.tier].gradient}`}>
        {e.imageUrl ? (
          <img src={e.imageUrl} alt={e.name} className="h-full w-full object-cover mix-blend-overlay opacity-90" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-background/80 font-display text-5xl font-bold opacity-40">{e.shortName || e.name.slice(0, 2)}</div>
        )}
        <div className="absolute top-3 left-3"><TierBadge tier={e.tier} /></div>
      </div>
      <div className="p-5">
        <div className="font-display font-bold text-lg leading-tight">{e.name}</div>
        <div className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[40px]">{e.tagline || e.description}</div>
        {e.differentials.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {e.differentials.slice(0, 3).map((id) => {
              const d = differentials.find((x) => x.id === id); if (!d) return null;
              return <span key={id} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary"><Icon name={d.icon} className="h-2.5 w-2.5" />{d.label}</span>;
            })}
          </div>
        )}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-1">
            {e.categories.slice(0, 3).map((cid) => { const c = categories.find((x) => x.id === cid); if (!c) return null; return <span key={cid} className="text-[10px] text-muted-foreground">{c.name}</span>; }).reduce<React.ReactNode[]>((acc, n, i) => i === 0 ? [n] : [...acc, <span key={`s${i}`} className="text-muted-foreground/50">·</span>, n], [])}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
        </div>
      </div>
    </button>
  );
}

function DetailModal({ e, onClose }: { e: Equipment; onClose: () => void }) {
  const { fields, categories, differentials } = useStore();
  const groups = Array.from(new Set(fields.map((f) => f.group || "Geral")));
  const renderVal = (k: string) => {
    const v = e.specs[k]; if (v === undefined || v === "" || v === null) return <span className="text-muted-foreground">—</span>;
    if (typeof v === "boolean") return v ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />;
    return <span className="font-medium">{String(v)}</span>;
  };
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-card border-l border-border overflow-y-auto scrollbar-thin animate-in slide-in-from-right duration-200">
        <div className={`h-48 relative ${tierMeta[e.tier].gradient}`}>
          {e.imageUrl && <img src={e.imageUrl} alt={e.name} className="h-full w-full object-cover mix-blend-overlay opacity-80" />}
          <button onClick={onClose} className="absolute top-4 right-4 h-9 w-9 rounded-full bg-background/40 backdrop-blur grid place-items-center text-foreground hover:bg-background/60"><X className="h-4 w-4" /></button>
          <div className="absolute bottom-5 left-6 right-6">
            <TierBadge tier={e.tier} size="md" />
            <h2 className="font-display text-3xl font-bold text-background mt-3 drop-shadow">{e.name}</h2>
            {e.tagline && <p className="text-background/90 text-sm mt-1">{e.tagline}</p>}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {e.description && <p className="text-sm text-muted-foreground leading-relaxed">{e.description}</p>}

          {e.highlights && e.highlights.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Destaques</div>
              <div className="flex flex-wrap gap-2">{e.highlights.map((h, i) => <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-primary/15 text-primary font-medium">{h}</span>)}</div>
            </div>
          )}

          {e.differentials.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Diferenciais</div>
              <div className="grid grid-cols-2 gap-2">
                {e.differentials.map((id) => { const d = differentials.find((x) => x.id === id); if (!d) return null;
                  return <div key={id} className="flex items-center gap-2 text-sm bg-accent/40 rounded-lg px-3 py-2"><Icon name={d.icon} className="h-4 w-4 text-primary" />{d.label}</div>;
                })}
              </div>
            </div>
          )}

          {e.bestFor.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-widest text-tier-premium mb-2 flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> Melhor para</div>
              <div className="flex flex-wrap gap-2">{e.bestFor.map((cid) => { const c = categories.find((x) => x.id === cid); if (!c) return null;
                return <span key={cid} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full tier-premium-bg text-background"><Icon name={c.icon} className="h-3 w-3" />{c.name}</span>;
              })}</div>
            </div>
          )}

          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Especificações</div>
            <div className="space-y-4">
              {groups.map((g) => {
                const gFields = fields.filter((f) => (f.group || "Geral") === g && (e.specs[f.key] !== undefined && e.specs[f.key] !== ""));
                if (gFields.length === 0) return null;
                return (
                  <div key={g}>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">{g}</div>
                    <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                      {gFields.map((f) => (
                        <div key={f.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                          <span className="text-muted-foreground">{f.label}{f.unit ? ` (${f.unit})` : ""}</span>
                          <span className="flex items-center">{renderVal(f.key)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
