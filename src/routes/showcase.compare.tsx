import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useStore, tierMeta, type Equipment, type Tier, type SpecField } from "@/lib/store";
import { TierBadge } from "@/components/TierBadge";
import { Icon } from "@/components/Icon";
import {
  Check, X, Plus, Star, Save, Maximize2, Minimize2, Bookmark, Trash2, Search,
  Building2, ArrowLeft, Trophy, TrendingUp, Settings2, ChevronDown, ChevronUp,
} from "lucide-react";

export const Route = createFileRoute("/showcase/compare")({ component: Compare });

type Mode = "vs-competitors" | "vs-own" | "free";

function sortByOrder<T extends { order?: number }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

// ────────────────────────────────────────────────────────────
// Scoring: every visible field contributes
//   boolean true = +1, numeric > others = +1, text non-empty = +0.25
// Final score is normalized to 0-10 scale
// Returns score per equipment id and per-equip list of advantages
// ────────────────────────────────────────────────────────────
function computeScores(equips: Equipment[], fields: SpecField[]) {
  const rawScores: Record<string, number> = {};
  const advantages: Record<string, { field: SpecField; value: string }[]> = {};
  equips.forEach((e) => { rawScores[e.id] = 0; advantages[e.id] = []; });

  fields.forEach((f) => {
    const values = equips.map((e) => e.specs[f.key]);
    if (f.type === "boolean") {
      equips.forEach((e, i) => {
        if (values[i] === true) {
          rawScores[e.id] += 1;
          if (values.filter((v) => v === true).length < equips.length) {
            advantages[e.id].push({ field: f, value: "Sim" });
          }
        }
      });
    } else if (f.type === "number") {
      const nums = values.map((v) => (typeof v === "number" ? v : NaN));
      const valid = nums.filter((n) => !isNaN(n));
      if (valid.length === 0) return;
      // for "weight" lower is better; for everything else higher is better
      const lowerIsBetter = f.key === "weight";
      const best = lowerIsBetter ? Math.min(...valid) : Math.max(...valid);
      equips.forEach((e, i) => {
        if (!isNaN(nums[i]) && nums[i] === best && valid.length > 1 && new Set(valid).size > 1) {
          rawScores[e.id] += 1;
          advantages[e.id].push({ field: f, value: `${nums[i]}${f.unit ? " " + f.unit : ""}${lowerIsBetter ? " (mais leve)" : " (maior)"}` });
        }
      });
    } else {
      equips.forEach((e, i) => {
        if (values[i] !== undefined && values[i] !== "") rawScores[e.id] += 0.25;
      });
    }
  });

  // Normalize scores to 0-10 scale
  const maxRaw = Math.max(1, ...Object.values(rawScores));
  const scores: Record<string, number> = {};
  equips.forEach((e) => {
    scores[e.id] = Math.min(10, parseFloat(((rawScores[e.id] / maxRaw) * 10).toFixed(1)));
  });

  return { scores, advantages };
}

function Compare() {
  const { equipments, fields, brands, savedComparisons, addSavedComparison, removeSavedComparison } = useStore();
  const ownBrand = brands.find((b) => b.isOwn);
  const ownEquips = useMemo(() => equipments.filter((e) => ownBrand && e.brandId === ownBrand.id), [equipments, ownBrand]);
  const competitorEquips = useMemo(() => equipments.filter((e) => !ownBrand || e.brandId !== ownBrand.id), [equipments, ownBrand]);

  const initialUrl = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const initialOwn = initialUrl.get("own") ?? "";
  const initialIds = (initialUrl.get("ids") ?? "").split(",").filter(Boolean);

  const [mode, setMode] = useState<Mode>("vs-competitors");
  const [selected, setSelected] = useState<string[]>(initialIds.length ? initialIds : (initialOwn ? [initialOwn] : []));
  const [presenting, setPresenting] = useState(false);
  const [showAdder, setShowAdder] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selected.length === 0 && ownEquips[0]) setSelected([ownEquips[0].id]);
  }, [ownEquips, selected.length]);

  const selectedEquipments = selected.map((id) => equipments.find((e) => e.id === id)).filter(Boolean) as Equipment[];
  const all = [...selectedEquipments.filter((e) => brands.find((b) => b.id === e.brandId)?.isOwn), ...selectedEquipments.filter((e) => !brands.find((b) => b.id === e.brandId)?.isOwn)];
  const visibleFields = sortByOrder(fields);
  const groups = Array.from(new Set(visibleFields.map((f) => f.group || "Geral")));
  const { scores, advantages } = useMemo(() => computeScores(all, visibleFields), [all, visibleFields]);
  const maxScore = 10; // Fixed 0-10 scale

  const remove = (id: string) => setSelected((s) => s.filter((x) => x !== id));
  const add = (id: string) => {
    if (selected.length >= 20) { alert("Máximo 20 equipamentos por comparação."); return; }
    if (!selected.includes(id)) setSelected([...selected, id]);
    setShowAdder(false);
  };

  const pickerPool = mode === "vs-own" ? ownEquips
    : mode === "vs-competitors" ? competitorEquips
    : equipments;

  const saveComparison = () => {
    if (all.length < 2) { alert("Selecione ao menos 2 equipamentos."); return; }
    const own = all.find((e) => brands.find((b) => b.id === e.brandId)?.isOwn);
    const others = all.filter((e) => e.id !== own?.id).map((e) => e.id);
    const name = prompt("Nome desta comparação:", all.map((e) => e.shortName || e.name).join(" vs "));
    if (!name) return;
    addSavedComparison({ name, ownEquipmentId: own?.id ?? all[0].id, competitorIds: others });
  };

  const loadSaved = (id: string) => {
    const s = savedComparisons.find((x) => x.id === id);
    if (!s) return;
    setSelected([s.ownEquipmentId, ...s.competitorIds]);
    setShowSaved(false);
  };

  const toggleGroup = (g: string) => setOpenGroups((s) => ({ ...s, [g]: !s[g] }));

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
    <div className={presenting ? "fixed inset-0 z-50 bg-background overflow-auto" : "px-6 py-8 max-w-[1700px] mx-auto"}>
      {/* Top bar */}
      <div className={`flex flex-wrap items-center gap-3 mb-6 ${presenting ? "p-6 sticky top-0 bg-background/95 backdrop-blur z-30 border-b border-border" : ""}`}>
        {presenting && (
          <button onClick={() => setPresenting(false)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /></button>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-0.5">Comparativo técnico</div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{all.length > 0 ? all.map((e) => e.shortName || e.name).join(" · ") : "Selecione equipamentos"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowSaved((v) => !v)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:border-primary text-xs font-medium">
              <Bookmark className="h-3.5 w-3.5" /> Salvos ({savedComparisons.length})
            </button>
            {showSaved && (
              <div className="absolute right-0 top-full mt-1 w-72 max-h-80 overflow-y-auto bg-popover border border-border rounded-xl shadow-xl z-30 p-2">
                {savedComparisons.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-3 text-center">Nenhuma comparação salva ainda.</div>
                ) : [...savedComparisons].sort((a, b) => b.createdAt - a.createdAt).map((s) => (
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

      {/* Mode + adder */}
      {!presenting && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex bg-card/60 border border-border rounded-lg p-1 text-xs font-semibold">
            {([
              { k: "vs-competitors", label: "Meus vs Concorrentes" },
              { k: "vs-own", label: "Entre meus modelos" },
              { k: "free", label: "Livre" },
            ] as const).map((m) => (
              <button key={m.k} onClick={() => setMode(m.k)}
                className={`px-3 py-1.5 rounded-md transition ${mode === m.k ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground"}`}>
                {m.label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdder(!showAdder)} disabled={selected.length >= 20}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-[oklch(0.78_0.2_280)] text-background text-xs font-bold disabled:opacity-40">
            <Plus className="h-3.5 w-3.5" /> Adicionar ({selected.length}/20)
          </button>
          {selected.length > 0 && (
            <button onClick={() => setSelected([])} className="text-xs text-muted-foreground hover:text-destructive">Limpar tudo</button>
          )}
        </div>
      )}

      {showAdder && !presenting && (
        <div className="mb-6 glass rounded-xl p-4">
          <Picker pool={pickerPool} brands={brands} excludeIds={selected} onPick={add} />
        </div>
      )}

      {all.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground border border-dashed border-border rounded-2xl">
          <Settings2 className="h-8 w-8 mx-auto mb-3 opacity-40" />
          Adicione equipamentos para começar a comparar.
        </div>
      ) : (
        <>
          {/* Hero cards with image + score */}
          <div className={`grid gap-4 mb-8 ${all.length === 1 ? "grid-cols-1 max-w-md" : all.length === 2 ? "md:grid-cols-2" : all.length === 3 ? "md:grid-cols-3" : all.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-5"}`}>
            {all.map((e) => {
              const b = brands.find((x) => x.id === e.brandId);
              const isOwn = b?.isOwn;
              const isWinner = scores[e.id] === maxScore && all.length > 1;
              return (
                <div key={e.id} className={`relative rounded-2xl overflow-hidden border transition ${isWinner ? "border-tier-premium shadow-glow" : isOwn ? "border-primary/50" : "border-border"} bg-card`}>
                  {!presenting && (
                    <button onClick={() => remove(e.id)} className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-background/80 backdrop-blur grid place-items-center text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {isWinner && (
                    <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-tier-premium text-background shadow-lg">
                      <Trophy className="h-3 w-3" /> Vencedor
                    </div>
                  )}
                  <div className={`h-44 relative ${tierMeta[e.tier].gradient}`}>
                    {e.imageUrl ? (
                      <img src={e.imageUrl} alt={e.name} className="h-full w-full object-cover mix-blend-overlay opacity-90" />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-background/70 font-display text-5xl font-bold opacity-40">{e.shortName || e.name.slice(0, 3)}</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TierBadge tier={e.tier} />
                      {isOwn && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary"><Star className="h-2.5 w-2.5 fill-current" />Nosso</span>}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{b?.name ?? "—"}</div>
                    <h3 className="font-display font-bold text-lg leading-tight">{e.name}</h3>
                    {e.tagline && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{e.tagline}</p>}

                    {/* Score */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Nota geral</span>
                        <span className={`font-display text-2xl font-bold ${isWinner ? "text-tier-premium" : isOwn ? "text-primary" : ""}`}>
                          {scores[e.id].toFixed(1)}
                          <span className="text-sm font-normal text-muted-foreground">/10</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-input/40 overflow-hidden">
                        <div className={`h-full ${isWinner ? "bg-tier-premium" : isOwn ? "bg-primary" : "bg-muted-foreground/40"}`} style={{ width: `${(scores[e.id] / maxScore) * 100}%` }} />
                      </div>
                    </div>

                    {/* Advantages */}
                    {advantages[e.id].length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-success font-semibold mb-1.5">
                          <TrendingUp className="h-3 w-3" /> Vantagens ({advantages[e.id].length})
                        </div>
                        <ul className="space-y-1 max-h-44 overflow-y-auto scrollbar-thin pr-1">
                          {advantages[e.id].slice(0, 12).map((a, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug">
                              <Check className="h-3 w-3 text-success mt-0.5 shrink-0" />
                              <span><span className="text-muted-foreground">{a.field.label}:</span> <span className="font-medium">{a.value}</span></span>
                            </li>
                          ))}
                          {advantages[e.id].length > 12 && (
                            <li className="text-[10px] text-muted-foreground italic">+ {advantages[e.id].length - 12} outras…</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spec table */}
          {all.length >= 1 && (
            <div className="rounded-2xl glass overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-card/40">
                      <th className="sticky left-0 bg-card/95 backdrop-blur z-20 text-left p-3 w-56 min-w-56 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Especificação</th>
                      {all.map((e, index) => {
                        const b = brands.find((x) => x.id === e.brandId);
                        const ownSticky = b?.isOwn && index === 0;
                        return (
                          <th key={e.id} className={`text-left p-3 min-w-[190px] text-xs font-semibold ${b?.isOwn ? "bg-primary/5" : ""} ${ownSticky ? "sticky left-56 z-20 bg-card/95 backdrop-blur shadow-[8px_0_18px_-18px_oklch(0.2_0.05_260/0.5)]" : ""}`}>
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-normal">{b?.name ?? "—"}</div>
                            {e.shortName || e.name}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((g) => {
                      const open = openGroups[g] ?? true;
                      const groupFields = visibleFields.filter((f) => (f.group || "Geral") === g);
                      return (
                        <GroupBlock key={g} group={g} open={open} onToggle={() => toggleGroup(g)} fields={groupFields} all={all} brands={brands} colSpan={all.length + 1} />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GroupBlock({ group, open, onToggle, fields, all, brands, colSpan }: {
  group: string; open: boolean; onToggle: () => void; fields: SpecField[]; all: Equipment[];
  brands: ReturnType<typeof useStore.getState>["brands"]; colSpan: number;
}) {
  return (
    <>
      <tr className="border-t border-border bg-accent/30">
        <td colSpan={colSpan} className={`px-3 py-2 sticky left-0 z-10 backdrop-blur ${groupClass(group)}`}>
          <button onClick={onToggle} className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold text-foreground/80 hover:text-foreground">
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {group}
            <span className="text-muted-foreground/60 normal-case font-normal tracking-normal">({fields.length})</span>
          </button>
        </td>
      </tr>
      {open && fields.map((f) => {
        // determine winners per row
        const vals = all.map((e) => e.specs[f.key]);
        let winnerIdxs = new Set<number>();
        if (f.type === "boolean") {
          vals.forEach((v, i) => { if (v === true) winnerIdxs.add(i); });
          if (winnerIdxs.size === all.length) winnerIdxs = new Set();
        } else if (f.type === "number") {
          const nums = vals.map((v) => (typeof v === "number" ? v : NaN)).filter((n) => !isNaN(n));
          if (nums.length > 1 && new Set(nums).size > 1) {
            const lower = f.key === "weight";
            const best = lower ? Math.min(...nums) : Math.max(...nums);
            vals.forEach((v, i) => { if (typeof v === "number" && v === best) winnerIdxs.add(i); });
          }
        }
        return (
          <tr key={f.id} className="border-t border-border/60 hover:bg-accent/10">
            <td className="p-3 text-xs text-muted-foreground sticky left-0 z-10 bg-card/95 backdrop-blur align-top min-w-56">
              {f.label}{f.unit && <span className="text-muted-foreground/60 ml-1">({f.unit})</span>}
            </td>
            {all.map((e, i) => {
              const b = brands.find((x) => x.id === e.brandId);
              const v = e.specs[f.key];
              const isWin = winnerIdxs.has(i);
              const ownSticky = b?.isOwn && i === 0;
              return (
                <td key={e.id} className={`p-3 align-top min-w-[190px] ${b?.isOwn ? "bg-primary/5" : ""} ${isWin ? "bg-success/10" : ""} ${ownSticky ? "sticky left-56 z-10 bg-card/95 backdrop-blur shadow-[8px_0_18px_-18px_oklch(0.2_0.05_260/0.5)]" : ""}`}>
                  {v === undefined || v === "" ? <span className="text-muted-foreground/40">—</span>
                    : typeof v === "boolean" ? (v ? <Check className={`h-4 w-4 ${isWin ? "text-success" : "text-success/70"}`} /> : <X className="h-4 w-4 text-muted-foreground/50" />)
                    : <span className={`text-sm ${isWin ? "font-bold text-success" : "font-medium"}`}>{String(v)}</span>}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}

function groupClass(group: string) {
  const g = group.toLowerCase();
  if (g.includes("radiologia")) return "spec-radiologia-bg";
  if (g.includes("obgyn")) return "spec-obgyn-bg";
  if (g.includes("cardio")) return "spec-cardiologia-bg";
  if (g.includes("uro")) return "spec-urologia-bg";
  return "bg-accent/30";
}

function Picker({ pool, brands, excludeIds, onPick }: {
  pool: Equipment[]; brands: ReturnType<typeof useStore.getState>["brands"]; excludeIds: string[]; onPick: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<Tier | "all">("all");
  const [brandId, setBrandId] = useState<string | "all">("all");

  const grouped = useMemo(() => {
    const filtered = pool.filter((e) =>
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
  }, [pool, excludeIds, q, tier, brandId]);

  const availableBrands = Array.from(new Set(pool.map((e) => e.brandId).filter(Boolean))) as string[];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar modelo..."
            className="w-full bg-input/40 border border-border rounded-md pl-8 pr-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="bg-input/40 border border-border rounded-md px-2 py-1.5 text-xs">
          <option value="all">Todas marcas</option>
          {availableBrands.map((id) => { const b = brands.find((x) => x.id === id); return <option key={id} value={id}>{b?.name ?? "—"}</option>; })}
        </select>
        <select value={tier} onChange={(e) => setTier(e.target.value as Tier | "all")} className="bg-input/40 border border-border rounded-md px-2 py-1.5 text-xs">
          <option value="all">Todos tiers</option>
          <option value="super-premium">Super Premium</option>
          <option value="premium">Premium</option>
          <option value="high">High</option>
          <option value="mid">Mid</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div className="max-h-72 overflow-y-auto scrollbar-thin space-y-3">
        {Array.from(grouped.entries()).map(([bid, eqs]) => {
          const b = brands.find((x) => x.id === bid);
          return (
            <div key={bid}>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5 px-1 flex items-center gap-1.5">
                {b?.isOwn && <Star className="h-2.5 w-2.5 text-primary fill-current" />}
                {b?.name ?? "Sem marca"}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                {eqs.map((e) => (
                  <button key={e.id} onClick={() => onPick(e.id)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/10 text-left text-xs transition">
                    <TierBadge tier={e.tier} />
                    <span className="font-medium truncate flex-1">{e.name}</span>
                    <Plus className="h-3 w-3 text-primary shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {grouped.size === 0 && <div className="text-xs text-muted-foreground py-8 text-center">Nada encontrado.</div>}
      </div>
    </div>
  );
}
