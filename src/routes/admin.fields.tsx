import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, type SpecField, type FieldType } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Plus, Trash2, GripVertical, Star } from "lucide-react";

export const Route = createFileRoute("/admin/fields")({ component: FieldsAdmin });

function FieldsAdmin() {
  const { fields, addField, updateField, removeField } = useStore();
  const [draft, setDraft] = useState({ label: "", key: "", type: "text" as FieldType, unit: "", group: "Geral", options: "" });

  const submit = () => {
    if (!draft.label.trim()) return;
    const key = draft.key.trim() || draft.label.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    addField({
      label: draft.label.trim(), key, type: draft.type, unit: draft.unit || undefined,
      group: draft.group || "Geral",
      options: draft.type === "select" ? draft.options.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
    });
    setDraft({ label: "", key: "", type: "text", unit: "", group: "Geral", options: "" });
  };

  const groups = Array.from(new Set(fields.map((f) => f.group || "Geral")));

  return (
    <div className="px-8 py-8 max-w-5xl">
      <PageHeader title="Colunas comparativas"
        subtitle="Defina quais especificações aparecem na ficha técnica e na comparação. Você pode criar quantas quiser." />

      <div className="glass rounded-xl p-5 mb-6">
        <div className="text-sm font-semibold mb-3">Adicionar nova coluna</div>
        <div className="grid md:grid-cols-6 gap-2">
          <input placeholder="Nome (ex: Peso)" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} className={`md:col-span-2 ${ic}`} />
          <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as FieldType })} className={ic}>
            <option value="text">Texto</option><option value="number">Número</option><option value="boolean">Sim/Não</option><option value="select">Lista</option>
          </select>
          <input placeholder="Unidade" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} className={ic} />
          <input placeholder="Grupo" value={draft.group} onChange={(e) => setDraft({ ...draft, group: e.target.value })} className={ic} />
          <button onClick={submit} className="px-3 py-2 rounded-lg bg-primary text-background text-sm font-semibold inline-flex items-center justify-center gap-1.5"><Plus className="h-4 w-4" />Add</button>
        </div>
        {draft.type === "select" && (
          <input placeholder="Opções separadas por vírgula" value={draft.options} onChange={(e) => setDraft({ ...draft, options: e.target.value })} className={`mt-2 ${ic}`} />
        )}
      </div>

      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g}>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{g}</div>
            <div className="glass rounded-xl divide-y divide-border">
              {fields.filter((f) => (f.group || "Geral") === g).map((f) => (
                <FieldRow key={f.id} f={f} onUpdate={(p) => updateField(f.id, p)} onDelete={() => confirm(`Remover coluna "${f.label}"?`) && removeField(f.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ic = "w-full bg-input/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

function FieldRow({ f, onUpdate, onDelete }: { f: SpecField; onUpdate: (p: Partial<SpecField>) => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <input value={f.label} onChange={(e) => onUpdate({ label: e.target.value })} className={`${ic} flex-1`} />
      <input value={f.unit ?? ""} onChange={(e) => onUpdate({ unit: e.target.value })} placeholder="unidade" className={`${ic} w-28`} />
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider w-16 text-center">{f.type}</span>
      <button onClick={() => onUpdate({ highlight: !f.highlight })} title="Destaque" className={`p-1.5 rounded-md ${f.highlight ? "text-tier-premium" : "text-muted-foreground hover:text-foreground"}`}>
        <Star className="h-4 w-4" fill={f.highlight ? "currentColor" : "none"} />
      </button>
      <button onClick={onDelete} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/15"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}
