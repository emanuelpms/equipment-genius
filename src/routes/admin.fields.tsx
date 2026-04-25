import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, GripVertical, Plus, Star, Trash2 } from "lucide-react";
import { useStore, type SpecField } from "@/lib/store";

export const Route = createFileRoute("/admin/fields")({ component: FieldsAdmin });
const groupsPreset = ["Hardware", "Radiologia", "ObGyn", "Cardiologia", "Urologia", "Vascular", "POCUS", "Transdutores", "Geral"];

function FieldsAdmin() {
  const { fields, addField, updateField, removeField } = useStore();
  const [draft, setDraft] = useState({ label: "", group: "Hardware" });
  const grouped = useMemo(
    () => [...fields].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)).reduce<Record<string, SpecField[]>>((acc, f) => {
      const g = f.group || "Geral"; (acc[g] ||= []).push(f); return acc;
    }, {}),
    [fields]
  );
  const submit = () => {
    if (!draft.label.trim()) return;
    const key = draft.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || `f_${Date.now()}`;
    addField({ label: draft.label.trim(), key, type: "text", group: draft.group || "Geral", order: fields.length });
    setDraft({ label: "", group: draft.group });
  };

  return (
    <div className="px-8 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Comparação</div>
        <h1 className="font-display text-3xl font-bold">Colunas comparativas</h1>
        <p className="text-sm text-muted-foreground mt-1">Cada coluna é uma especificação preenchida em texto livre. Crie, agrupe e edite com um clique.</p>
      </div>

      <section className="glass rounded-2xl p-5 mb-8">
        <div className="font-display font-bold mb-4 flex items-center gap-2"><Plus className="h-4 w-4" />Nova coluna</div>
        <div className="grid lg:grid-cols-[1fr_220px_140px] gap-3">
          <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Nome da coluna (ex: Frequência máxima)" className={ic} />
          <select value={draft.group} onChange={(e) => setDraft({ ...draft, group: e.target.value })} className={ic}>
            {groupsPreset.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <button onClick={submit} className="rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Adicionar</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {groupsPreset.map((g) => (
            <button key={g} onClick={() => setDraft({ ...draft, group: g })} className={`rounded-full border px-3 py-1 text-xs font-semibold ${draft.group === g ? "bg-primary/15 border-primary text-primary" : "border-border text-muted-foreground"}`}>{g}</button>
          ))}
        </div>
      </section>

      <div className="space-y-8">
        {Object.entries(grouped).map(([group, items]) => (
          <section key={group}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="font-display text-xl font-bold">{group}</h2>
              <span className="text-xs text-muted-foreground">{items.length} colunas</span>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map((f) => (
                <FieldCard key={f.id} f={f} onUpdate={(p) => updateField(f.id, p)} onDelete={() => confirm(`Remover ${f.label}?`) && removeField(f.id)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function FieldCard({ f, onUpdate, onDelete }: { f: SpecField; onUpdate: (p: Partial<SpecField>) => void; onDelete: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <GripVertical className="h-4 w-4 text-muted-foreground mt-2" />
        <div className="flex-1 space-y-2">
          <input value={f.label} onChange={(e) => onUpdate({ label: e.target.value })} className={`${ic} font-semibold`} />
          <input value={f.group ?? ""} onChange={(e) => onUpdate({ group: e.target.value })} placeholder="Grupo" className={ic} />
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={() => onUpdate({ highlight: !f.highlight })} className={`h-8 w-8 rounded-lg grid place-items-center ${f.highlight ? "bg-primary/15 text-primary" : "hover:bg-accent text-muted-foreground"}`}>
            <Star className="h-4 w-4" fill={f.highlight ? "currentColor" : "none"} />
          </button>
          <button onClick={onDelete} className="h-8 w-8 rounded-lg grid place-items-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Check className="h-3.5 w-3.5 text-success" />Texto livre · chave {f.key}
      </div>
    </div>
  );
}

const ic = "w-full bg-input/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
