import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, tierMeta } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { TierBadge } from "@/components/TierBadge";
import { Icon } from "@/components/Icon";
import { Check, X, Plus } from "lucide-react";

export const Route = createFileRoute("/showcase/compare")({ component: Compare });

function Compare() {
  const { equipments, fields, categories, differentials } = useStore();
  const [selected, setSelected] = useState<string[]>(equipments.slice(0, 3).map((e) => e.id));
  const groups = Array.from(new Set(fields.map((f) => f.group || "Geral")));
  const sel = selected.map((id) => equipments.find((e) => e.id === id)!).filter(Boolean);

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
      <PageHeader title="Comparar modelos" subtitle="Selecione até 4 equipamentos e veja todas as colunas lado a lado." />

      <div className="flex flex-wrap gap-2 mb-6">
        {equipments.map((e) => {
          const on = selected.includes(e.id);
          return (
            <button key={e.id} onClick={() => setSelected(on ? selected.filter((x) => x !== e.id) : selected.length < 4 ? [...selected, e.id] : selected)}
              className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border transition ${on ? "bg-primary/15 border-primary text-foreground" : "bg-card/60 border-border text-muted-foreground hover:text-foreground"}`}>
              {on ? <Check className="h-3.5 w-3.5 text-primary" /> : <Plus className="h-3.5 w-3.5" />}
              <TierBadge tier={e.tier} /> {e.name}
            </button>
          );
        })}
      </div>

      {sel.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">Selecione modelos para comparar.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl glass">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-card/80 backdrop-blur z-10 text-left p-4 w-56 border-b border-border"></th>
                {sel.map((e) => (
                  <th key={e.id} className="p-4 min-w-[200px] text-left align-top border-b border-border">
                    <TierBadge tier={e.tier} />
                    <div className="font-display font-bold text-base mt-2">{e.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-1 font-normal">{e.tagline}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="Categorias" sticky>
                {sel.map((e) => (
                  <td key={e.id} className="p-4 align-top">
                    <div className="flex flex-wrap gap-1">
                      {e.categories.map((cid) => { const c = categories.find((x) => x.id === cid); if (!c) return null;
                        return <span key={cid} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground"><Icon name={c.icon} className="h-2.5 w-2.5" />{c.name}</span>; })}
                    </div>
                  </td>
                ))}
              </Row>
              <Row label="Melhor para" sticky>
                {sel.map((e) => (
                  <td key={e.id} className="p-4 align-top">
                    <div className="flex flex-wrap gap-1">
                      {e.bestFor.map((cid) => { const c = categories.find((x) => x.id === cid); if (!c) return null;
                        return <span key={cid} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full tier-premium-bg text-background font-semibold"><Icon name={c.icon} className="h-2.5 w-2.5" />{c.name}</span>; })}
                    </div>
                  </td>
                ))}
              </Row>
              <Row label="Diferenciais" sticky>
                {sel.map((e) => (
                  <td key={e.id} className="p-4 align-top">
                    <div className="flex flex-col gap-1">
                      {e.differentials.map((id) => { const d = differentials.find((x) => x.id === id); if (!d) return null;
                        return <div key={id} className="inline-flex items-center gap-1.5 text-xs text-foreground"><Icon name={d.icon} className="h-3 w-3 text-primary" />{d.label}</div>; })}
                    </div>
                  </td>
                ))}
              </Row>

              {groups.map((g) => (
                <>
                  <tr key={`g-${g}`}>
                    <td colSpan={sel.length + 1} className="px-4 pt-6 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold sticky left-0 bg-card/30">{g}</td>
                  </tr>
                  {fields.filter((f) => (f.group || "Geral") === g).map((f) => (
                    <Row key={f.id} label={`${f.label}${f.unit ? ` (${f.unit})` : ""}`}>
                      {sel.map((e) => {
                        const v = e.specs[f.key];
                        return (
                          <td key={e.id} className="p-4 align-top">
                            {v === undefined || v === "" ? <span className="text-muted-foreground/50">—</span>
                              : typeof v === "boolean" ? (v ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />)
                              : <span className="font-medium">{String(v)}</span>}
                          </td>
                        );
                      })}
                    </Row>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, sticky, children }: { label: string; sticky?: boolean; children: React.ReactNode }) {
  return (
    <tr className="border-t border-border">
      <td className={`p-4 text-xs text-muted-foreground font-medium align-top w-56 ${sticky ? "sticky left-0 bg-card/80 backdrop-blur" : ""}`}>{label}</td>
      {children}
    </tr>
  );
}
