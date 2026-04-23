import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, tierMeta, type Tier, type Equipment } from "@/lib/store";
import { TierBadge } from "@/components/TierBadge";
import { Icon } from "@/components/Icon";
import { Search, Sparkles, ChevronRight, Check, X, ArrowRight, Star, Building2, Swords } from "lucide-react";

export const Route = createFileRoute("/showcase/")({ component: Showcase });

function sortByOrder<T extends { order?: number }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

function Showcase() {
  const { equipments, categories, brands } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<Tier | "all">("all");
  const [cat, setCat] = useState<string | "all">("all");
  const [active, setActive] = useState<Equipment | null>(null);

  const ownBrand = brands.find((b) => b.isOwn);

  const filtered = useMemo(() => sortByOrder(equipments).filter((e) =>
    (tier === "all" || e.tier === tier) &&
    (cat === "all" || e.categories.includes(cat)) &&
    (q === "" || e.name.toLowerCase().includes(q.toLowerCase()) || (e.tagline ?? "").toLowerCase().includes(q.toLowerCase()))
  ), [equipments, tier, cat, q]);

  const myEquipments = filtered.filter((e) => ownBrand && e.brandId === ownBrand.id);
  const competitorEquips = filtered.filter((e) => !ownBrand || e.brandId !== ownBrand.id);
  const competitorBrands = sortByOrder(brands.filter((b) => !b.isOwn));

  const startCompare = (eqId: string) => {
    nav({ to: "/showcase/compare", search: undefined as any });
    // simple: encode in url manually after navigation
    setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set("own", eqId);
      window.history.replaceState(null, "", url.toString());
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, 50);
  };

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="rounded-3xl overflow-hidden mb-10 relative shadow-soft-lg" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full" style={{ background: "radial-gradient(circle, oklch(0.7 0.2 250 / 0.4), transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full" style={{ background: "radial-gradient(circle, oklch(0.6 0.18 230 / 0.3), transparent 70%)" }} />
        <div className="relative px-8 md:px-12 py-12 md:py-20">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] bg-white/10 text-white/90 backdrop-blur px-3 py-1.5 rounded-full mb-5 border border-white/15">
            <Sparkles className="h-3 w-3" /> {ownBrand?.name ?? "Sua marca"} · Competitive Intelligence
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] max-w-3xl text-white">
            Ultrassom <span className="gradient-text-light">Samsung Medison</span><br />vs concorrentes globais.
          </h1>
          <p className="text-white/70 mt-5 max-w-xl text-base md:text-lg leading-relaxed">
            {myEquipments.length} modelos Samsung · {competitorEquips.length} concorrentes (GE, Philips, Siemens) mapeados.
            Comparação técnica lado a lado para apresentações profissionais em campo.
          </p>
          <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-white/10">
            <Stat value={String(myEquipments.length)} label="Modelos Samsung" />
            <Stat value={String(competitorEquips.length)} label="Concorrentes" />
            <Stat value={String(categories.length)} label="Especialidades" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar modelo..." className="w-full bg-card/60 border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div className="flex gap-1 bg-card/60 border border-border rounded-lg p-1">
          {(["all", "super-premium", "premium", "high", "mid", "low"] as const).map((t) => (
            <button key={t} onClick={() => setTier(t)} className={`px-3 py-1.5 text-xs font-semibold rounded-md ${tier === t ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "all" ? "Todos tiers" : tierMeta[t].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-thin">
        <Chip active={cat === "all"} onClick={() => setCat("all")} icon="Layers" label="Todos" count={equipments.length} />
        {sortByOrder(categories).map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} icon={c.icon} label={c.name}
            count={equipments.filter((e) => e.categories.includes(c.id)).length} />
        ))}
      </div>

      {/* Best for highlight */}
      {cat !== "all" && (() => {
        const c = categories.find((x) => x.id === cat)!;
        const best = filtered.filter((e) => e.bestFor.includes(cat));
        return (
          <section className="mb-10 rounded-2xl glass p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg tier-premium-bg grid place-items-center text-background"><Icon name={c.icon} className="h-5 w-5" /></div>
              <div>
                <div className="text-xs uppercase tracking-widest text-tier-premium font-semibold">Melhores para {c.name}</div>
                <div className="text-sm text-muted-foreground">Modelos recomendados quando o foco é {c.name.toLowerCase()}.</div>
              </div>
            </div>
            {best.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum modelo destacado ainda.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {best.map((e) => <EquipCard key={e.id} e={e} onOpen={() => setActive(e)} onCompare={() => startCompare(e.id)} ownBrandId={ownBrand?.id} brands={brands} />)}
              </div>
            )}
          </section>
        );
      })()}

      {/* My products */}
      {myEquipments.length > 0 && (
        <section className="mb-12">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary font-bold mb-1">
                <Star className="h-3 w-3 fill-current" /> Nossa linha · {ownBrand?.name}
              </div>
              <h2 className="font-display text-2xl font-bold">Equipamentos {ownBrand?.name}</h2>
            </div>
            <span className="text-xs text-muted-foreground">{myEquipments.length} modelos</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myEquipments.map((e) => <EquipCard key={e.id} e={e} highlight onOpen={() => setActive(e)} onCompare={() => startCompare(e.id)} ownBrandId={ownBrand?.id} brands={brands} />)}
          </div>
        </section>
      )}

      {/* Competitors */}
      {competitorBrands.map((b) => {
        const eqs = competitorEquips.filter((e) => e.brandId === b.id);
        if (eqs.length === 0) return null;
        return (
          <section key={b.id} className="mb-12">
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                  <Building2 className="h-3 w-3" /> Concorrente
                </div>
                <h2 className="font-display text-2xl font-bold">{b.name}</h2>
              </div>
              <span className="text-xs text-muted-foreground">{eqs.length} modelos</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {eqs.map((e) => <EquipCard key={e.id} e={e} onOpen={() => setActive(e)} onCompare={() => startCompare(e.id)} ownBrandId={ownBrand?.id} brands={brands} />)}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">Nenhum modelo encontrado para os filtros.</div>
      )}

      {active && <DetailModal e={active} onClose={() => setActive(null)} onCompare={() => { startCompare(active.id); setActive(null); }} />}
    </div>
  );
}

function Chip({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: string; label: string; count: number }) {
  return (
    <button onClick={onClick} className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${active ? "bg-primary text-primary-foreground border-primary shadow-soft" : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"}`}>
      <Icon name={icon} className="h-3.5 w-3.5" />
      {label}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-muted"}`}>{count}</span>
    </button>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl md:text-4xl font-bold text-white tabular-nums leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/60 mt-2">{label}</div>
    </div>
  );
}

function EquipCard({ e, highlight, onOpen, onCompare, ownBrandId, brands }: {
  e: Equipment; highlight?: boolean; onOpen: () => void; onCompare: () => void;
  ownBrandId?: string; brands: ReturnType<typeof useStore.getState>["brands"];
}) {
  const isOwn = ownBrandId && e.brandId === ownBrandId;
  const brand = brands.find((b) => b.id === e.brandId);
  const tm = tierMeta[e.tier] ?? tierMeta.medium;
  return (
    <div className={`group rounded-2xl overflow-hidden glass transition-all hover:-translate-y-0.5 ${highlight || isOwn ? "border-primary/40 shadow-glow" : "hover:border-primary/40"}`}>
      <button onClick={onOpen} className="text-left w-full">
        <div className={`h-36 relative ${tm.gradient}`}>
          {e.imageUrl ? (
            <img src={e.imageUrl} alt={e.name} className="h-full w-full object-cover mix-blend-overlay opacity-90" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-background/80 font-display text-5xl font-bold opacity-40">{e.shortName || e.name.slice(0, 2)}</div>
          )}
          <div className="absolute top-3 left-3"><TierBadge tier={e.tier} /></div>
          {isOwn && (
            <div className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-background/80 backdrop-blur text-primary">
              <Star className="h-2.5 w-2.5 fill-current" /> Nosso
            </div>
          )}
        </div>
        <div className="p-5">
          {brand && <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">{brand.name}</div>}
          <div className="font-display font-bold text-lg leading-tight">{e.name}</div>
          <div className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[40px]">{e.tagline || e.description}</div>
        </div>
      </button>
      <div className="px-5 pb-5 flex gap-2">
        <button onClick={onOpen} className="flex-1 px-3 py-2 rounded-lg border border-border hover:border-primary text-xs font-semibold inline-flex items-center justify-center gap-1.5">
          Detalhes <ChevronRight className="h-3 w-3" />
        </button>
        <button onClick={onCompare} className="flex-1 px-3 py-2 rounded-lg bg-primary text-background text-xs font-semibold inline-flex items-center justify-center gap-1.5">
          <Swords className="h-3 w-3" /> Comparar
        </button>
      </div>
    </div>
  );
}

function DetailModal({ e, onClose, onCompare }: { e: Equipment; onClose: () => void; onCompare: () => void }) {
  const { fields, categories, differentials, brands } = useStore();
  const groups = Array.from(new Set(sortByOrder(fields).map((f) => f.group || "Geral")));
  const brand = brands.find((b) => b.id === e.brandId);
  const tm = tierMeta[e.tier] ?? tierMeta.medium;
  const renderVal = (k: string) => {
    const v = e.specs[k]; if (v === undefined || v === "" || v === null) return <span className="text-muted-foreground">—</span>;
    if (typeof v === "boolean") return v ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />;
    return <span className="font-medium">{String(v)}</span>;
  };
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-card border-l border-border overflow-y-auto scrollbar-thin animate-in slide-in-from-right duration-200">
        <div className={`h-56 relative ${tm.gradient}`}>
          {e.imageUrl && <img src={e.imageUrl} alt={e.name} className="h-full w-full object-cover mix-blend-overlay opacity-80" />}
          <button onClick={onClose} className="absolute top-4 right-4 h-9 w-9 rounded-full bg-background/40 backdrop-blur grid place-items-center text-foreground hover:bg-background/60"><X className="h-4 w-4" /></button>
          <div className="absolute bottom-5 left-6 right-6">
            {brand && <div className="text-[10px] uppercase tracking-widest text-background/80 font-bold mb-1">{brand.name}{brand.isOwn ? " ★" : ""}</div>}
            <TierBadge tier={e.tier} size="md" />
            <h2 className="font-display text-3xl font-bold text-background mt-3 drop-shadow">{e.name}</h2>
            {e.tagline && <p className="text-background/90 text-sm mt-1">{e.tagline}</p>}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <button onClick={onCompare} className="w-full py-3 rounded-xl bg-primary text-background font-semibold text-sm shadow-glow inline-flex items-center justify-center gap-2">
            <Swords className="h-4 w-4" /> Comparar com concorrentes
          </button>

          {e.description && <p className="text-sm text-muted-foreground leading-relaxed">{e.description}</p>}

          {e.photos && e.photos.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Galeria</div>
              <div className="grid grid-cols-3 gap-2">
                {e.photos.map((p, i) => <div key={i} className="aspect-square rounded-lg overflow-hidden bg-input/40"><img src={p} alt="" className="h-full w-full object-cover" /></div>)}
              </div>
            </div>
          )}

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
                const gFields = sortByOrder(fields).filter((f) => (f.group || "Geral") === g && (e.specs[f.key] !== undefined && e.specs[f.key] !== ""));
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