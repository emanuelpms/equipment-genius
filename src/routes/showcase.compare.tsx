import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useStore, tierMeta, type Equipment, type Tier, type SpecField } from "@/lib/store";
import { TierBadge } from "@/components/TierBadge";
import { Icon } from "@/components/Icon";
import { Check, X, Plus, Star, Save, Maximize2, Minimize2, Bookmark, Trash2, Search, ChevronDown, Building2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/showcase/compare")({ component: Compare });

function sortByOrder<T extends { order?: number }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

function Compare() {
  const { equipments, fields, categories, differentials, brands, savedComparisons, addSavedComparison, removeSavedComparison } = useStore();
  const nav = useNavigate();
  const ownBrand = brands.find((b) => b.isOwn);
  const ownEquips = equipments.filter((e) => ownBrand && e.brandId === ownBrand.id);
  const competitorEquips = equipments.filter((e) => !ownBrand || e.brandId !== ownBrand.id);

  // Read query state
  const initialUrl = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const initialOwn = initialUrl.get("own") ?? ownEquips[0]?.id ?? "";
  const initialComp = (initialUrl.get("vs") ?? "").split(",").filter(Boolean);

  const [ownId, setOwnId] = useState<string>(initialOwn);
  const [competitors, setCompetitors] = useState<string[]>(initialComp);
  const [presenting, setPresenting] = useState(false);
  const [showAdder, setShowAdder] = useState(false);
  const [showOwnPicker, setShowOwnPicker] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Auto-select first own equipment if none
  useEffect(() => {
    if (!ownId && ownEquips[0]) setOwnId(ownEquips[0].id);
  }, [ownEquips, ownId]);

  const own = equipments.find((e) => e.id === ownId);
  const compEquips = competitors.map((id) => equipments.find((e) => e.id === id)).filter(Boolean) as Equipment[];
  const all = own ? [own, ...compEquips] : compEquips;
  const visibleFields = sortByOrder(fields);
  const groups = Array.from(new Set(visibleFields.map((f) => f.group || "Geral")));

  const addCompetitor = (id: string) => {
    if (competitors.length >= 4) { alert("Máximo 4 concorrentes para boa visualização."); return; }
    if (!competitors.includes(id)) setCompetitors([...competitors, id]);
    setShowAdder(false);
  };

  const saveComparison = () => {
    if (!own || competitors.length === 0) { alert("Selecione seu equipamento e ao menos 1 concorrente."); return; }
    const name = prompt("Nome desta comparação:", `${own.name} vs ${compEquips.map((e) => e.shortName || e.name).join(", ")}`);
    if (!name) return;
    addSavedComparison({ name, ownEquipmentId: own.id, competitorIds: competitors });
    alert("Comparação salva!");
  };

  const loadSaved = (id: string) => {
    const s = savedComparisons.find((x) => x.id === id);
    if (!s) return;
    setOwnId(s.ownEquipmentId);
    setCompetitors(s.competitorIds);
    setShowSaved(false);
  };

  if (!ownBrand) {
    return (
      <div className="px-8 py-20 max-w-2xl mx-auto text-center">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold mb-2">Configure sua marca primeiro</h2>
        <p className="text-muted-foreground text-sm mb-6">Vá em Admin → Marcas e marque uma como "Minha Empresa".</p>
      </div>
    );
  }

  return (
    <div className={presenting ? "fixed inset-0 z-50 bg-background overflow-auto" : "px-6 py-6 max-w-[1600px] mx-auto"}>
      {/* Top bar */}
      <div className={`flex flex-wrap items-center gap-3 mb-6 ${presenting ? "p-6 sticky top-0 bg-background/95 backdrop-blur z-20 border-b border-border" : ""}`}>
        {presenting && (
          <button onClick={() => setPresenting(false)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /></button>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-0.5">{ownBrand.name} vs Concorrentes</div>
          <h1 className="font-display text-xl md:text-2xl font-bold">Comparativo de equipamentos</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowSaved((v) => !v)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:border-primary text-xs font-medium">
              <Bookmark className="h-3.5 w-3.5" /> Salvos ({savedComparisons.length})
            </button>
            {showSaved && (
              <div className="absolute right-0 top-full mt-1 w-72 max-h-80 overflow-y-auto bg-popover border border-border rounded-xl shadow-lg z-30 p-2">
                {savedComparisons.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-3 text-center">Nenhuma comparação salva ainda.</div>
                ) : sortByOrder(savedComparisons.map((s, i) => ({ ...s, order: -s.createdAt }))).map((s) => (
                  <div key={s.id} className="flex items-center gap-1 group hover:bg-accent rounded-md">
                    <button onClick={() => loadSaved(s.id)} className="flex-1 text-left text-xs px-3 py-2 truncate">{s.name}</button>
                    <button onClick={() => removeSavedComparison(s.id)} className="p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={saveComparison} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:border-primary text-xs font-medium">
            <Save className="h-3.5 w-3.5" /> Salvar
          </button>
          <button onClick={() => setPresenting(!presenting)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-background text-xs font-semibold">
            {presenting ? <><Minimize2 className="h-3.5 w-3.5" />Sair</> : <><Maximize2 className="h-3.5 w-3.5" />Apresentar</>}
          </button>
        </div>
      </div>

      {/* Selectors */}
      {!presenting && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="glass rounded-xl p-4 border-primary/40">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary font-bold mb-2">
              <Star className="h-3 w-3 fill-current" /> Seu equipamento
            </div>
            <button onClick={() => setShowOwnPicker(!showOwnPicker)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-input/40 border border-border hover:border-primary text-sm">
              <div className="flex items-center gap-2 min-w-0">
                {own ? <><TierBadge tier={own.tier} /><span className="font-semibold truncate">{own.name}</span></> : <span className="text-muted-foreground">Selecione...</span>}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {showOwnPicker && (
              <div className="mt-2 max-h-60 overflow-y-auto bg-popover border border-border rounded-lg p-1 scrollbar-thin">
                {ownEquips.map((e) => (
                  <button key={e.id} onClick={() => { setOwnId(e.id); setShowOwnPicker(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-xs hover:bg-accent ${ownId === e.id ? "bg-primary/15" : ""}`}>
                    <TierBadge tier={e.tier} />
                    <span className="font-medium truncate">{e.name}</span>
                  </button>
                ))}
                {ownEquips.length === 0 && <div className="text-xs text-muted-foreground p-3">Cadastre equipamentos da sua marca primeiro.</div>}
              </div>
            )}
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Concorrentes ({competitors.length}/4)</div>
              <button onClick={() => setShowAdder(!showAdder)} disabled={competitors.length >= 4}
                className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-primary text-background font-bold disabled:opacity-40">
                <Plus className="h-3 w-3" /> Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {compEquips.map((e) => {
                const b = brands.find((x) => x.id === e.brandId);
                return (
                  <span key={e.id} className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-accent border border-border">
                    <span className="text-muted-foreground text-[10px]">{b?.name ?? "—"}</span>
                    <span className="font-medium">{e.name}</span>
                    <button onClick={() => setCompetitors(competitors.filter((id) => id !== e.id))} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                  </span>
                );
              })}
              {compEquips.length === 0 && <span className="text-xs text-muted-foreground">Nenhum concorrente selecionado.</span>}
            </div>
            {showAdder && (
              <CompetitorPicker equips={competitorEquips} brands={brands} excludeIds={competitors} onPick={addCompetitor} />
            )}
          </div>
        </div>
      )}

      {all.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">Selecione seu equipamento e ao menos 1 concorrente.</div>
      ) : (
        <div className={`overflow-x-auto rounded-2xl glass scrollbar-thin ${presenting ? "mx-6 mb-6" : ""}`}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-card/95 backdrop-blur z-10 text-left p-4 w-56 border-b border-border"></th>
                {all.map((e) => {
                  const b = brands.find((x) => x.id === e.brandId);
                  const isOwn = b?.isOwn;
                  return (
                    <th key={e.id} className={`p-4 min-w-[220px] text-left align-top border-b border-border relative ${isOwn ? "bg-primary/10" : ""}`}>
                      {isOwn && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-[oklch(0.78_0.2_280)]" />}
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${isOwn ? "text-primary" : "text-muted-foreground"}`}>{b?.name ?? "Sem marca"}</span>
                        {isOwn && <Star className="h-3 w-3 text-primary fill-current" />}
                      </div>
                      {e.imageUrl && (
                        <div className={`h-24 w-full rounded-lg mb-2 overflow-hidden ${tierMeta[e.tier].gradient}`}>
                          <img src={e.imageUrl} alt={e.name} className="h-full w-full object-cover mix-blend-overlay opacity-90" />
                        </div>
                      )}
                      <TierBadge tier={e.tier} />
                      <div className="font-display font-bold text-base mt-2">{e.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-1 font-normal">{e.tagline}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <Row label="Categorias" sticky highlightOwn={all.length > 0 && brands.find((b) => b.id === all[0].brandId)?.isOwn}>
                {all.map((e) => {
                  const b = brands.find((x) => x.id === e.brandId);
                  return (
                    <td key={e.id} className={`p-4 align-top ${b?.isOwn ? "bg-primary/5" : ""}`}>
                      <div className="flex flex-wrap gap-1">
                        {e.categories.map((cid) => { const c = categories.find((x) => x.id === cid); if (!c) return null;
                          return <span key={cid} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground"><Icon name={c.icon} className="h-2.5 w-2.5" />{c.name}</span>; })}
                      </div>
                    </td>
                  );
                })}
              </Row>
              <Row label="Diferenciais" sticky>
                {all.map((e) => {
                  const b = brands.find((x) => x.id === e.brandId);
                  return (
                    <td key={e.id} className={`p-4 align-top ${b?.isOwn ? "bg-primary/5" : ""}`}>
                      <div className="flex flex-col gap-1">
                        {e.differentials.map((id) => { const d = differentials.find((x) => x.id === id); if (!d) return null;
                          return <div key={id} className="inline-flex items-center gap-1.5 text-xs"><Icon name={d.icon} className="h-3 w-3 text-primary" />{d.label}</div>; })}
                      </div>
                    </td>
                  );
                })}
              </Row>

              {groups.map((g) => (
                <GroupBlock key={g} group={g} fields={visibleFields.filter((f) => (f.group || "Geral") === g)} all={all} brands={brands} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function GroupBlock({ group, fields, all, brands }: { group: string; fields: SpecField[]; all: Equipment[]; brands: ReturnType<typeof useStore.getState>["brands"] }) {
  return (
    <>
      <tr>
        <td colSpan={all.length + 1} className="px-4 pt-6 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold sticky left-0 bg-card/30">{group}</td>
      </tr>
      {fields.map((f) => (
        <Row key={f.id} label={`${f.label}${f.unit ? ` (${f.unit})` : ""}`}>
          {all.map((e) => {
            const b = brands.find((x) => x.id === e.brandId);
            const v = e.specs[f.key];
            return (
              <td key={e.id} className={`p-4 align-top ${b?.isOwn ? "bg-primary/5" : ""}`}>
                {v === undefined || v === "" ? <span className="text-muted-foreground/50">—</span>
                  : typeof v === "boolean" ? (v ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />)
                  : <span className={`font-medium ${b?.isOwn ? "text-primary" : ""}`}>{String(v)}</span>}
              </td>
            );
          })}
        </Row>
      ))}
    </>
  );
}

function Row({ label, sticky, children, highlightOwn: _ }: { label: string; sticky?: boolean; children: React.ReactNode; highlightOwn?: boolean }) {
  return (
    <tr className="border-t border-border">
      <td className={`p-4 text-xs text-muted-foreground font-medium align-top w-56 ${sticky ? "sticky left-0 bg-card/80 backdrop-blur" : ""}`}>{label}</td>
      {children}
    </tr>
  );
}

function CompetitorPicker({ equips, brands, excludeIds, onPick }: {
  equips: Equipment[]; brands: ReturnType<typeof useStore.getState>["brands"]; excludeIds: string[]; onPick: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<Tier | "all">("all");
  const [brandId, setBrandId] = useState<string | "all">("all");

  const grouped = useMemo(() => {
    const filtered = equips.filter((e) =>
      !excludeIds.includes(e.id) &&
      (tier === "all" || e.tier === tier) &&
      (brandId === "all" || e.brandId === brandId) &&
      (q === "" || e.name.toLowerCase().includes(q.toLowerCase()))
    );
    const map = new Map<string, Equipment[]>();
    filtered.forEach((e) => {
      const k = e.brandId ?? "_";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    });
    return map;
  }, [equips, excludeIds, q, tier, brandId]);

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..."
            className="w-full bg-input/40 border border-border rounded-md pl-7 pr-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="bg-input/40 border border-border rounded-md px-2 py-1.5 text-xs">
          <option value="all">Todas marcas</option>
          {brands.filter((b) => !b.isOwn).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={tier} onChange={(e) => setTier(e.target.value as Tier | "all")} className="bg-input/40 border border-border rounded-md px-2 py-1.5 text-xs">
          <option value="all">Todos tiers</option>
          <option value="premium">Premium</option>
          <option value="medium">Medium</option>
          <option value="low">Essential</option>
        </select>
      </div>
      <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-3">
        {Array.from(grouped.entries()).map(([bid, eqs]) => {
          const b = brands.find((x) => x.id === bid);
          return (
            <div key={bid}>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1 px-1">{b?.name ?? "Sem marca"}</div>
              <div className="grid grid-cols-2 gap-1">
                {eqs.map((e) => (
                  <button key={e.id} onClick={() => onPick(e.id)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-md border border-border hover:border-primary hover:bg-primary/10 text-left text-xs">
                    <TierBadge tier={e.tier} />
                    <span className="font-medium truncate flex-1">{e.name}</span>
                    <Plus className="h-3 w-3 text-primary" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {grouped.size === 0 && <div className="text-xs text-muted-foreground py-6 text-center">Nada encontrado.</div>}
      </div>
    </div>
  );
}