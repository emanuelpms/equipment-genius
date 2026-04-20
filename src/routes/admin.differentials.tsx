import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/Icon";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/differentials")({ component: DifferentialsAdmin });
const ic = "w-full bg-input/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

function DifferentialsAdmin() {
  const { differentials, addDifferential, updateDifferential, removeDifferential } = useStore();
  const [d, setD] = useState({ label: "", icon: "Zap" });
  const submit = () => { if (!d.label.trim()) return; addDifferential(d); setD({ label: "", icon: "Zap" }); };

  return (
    <div className="px-8 py-8 max-w-4xl">
      <PageHeader title="Diferenciais"
        subtitle="Selos rápidos exibidos nos cards (ex: 'IA de auto-medição', 'Workflow rápido'). Personalize livremente." />

      <div className="glass rounded-xl p-5 mb-6 grid md:grid-cols-12 gap-2">
        <input placeholder="Texto do diferencial" value={d.label} onChange={(e) => setD({ ...d, label: e.target.value })} className={`md:col-span-7 ${ic}`} />
        <input placeholder="Ícone Lucide (ex: Zap, Wand2, Wifi)" value={d.icon} onChange={(e) => setD({ ...d, icon: e.target.value })} className={`md:col-span-3 ${ic}`} />
        <button onClick={submit} className="md:col-span-2 px-3 py-2 rounded-lg bg-primary text-background text-sm font-semibold inline-flex items-center justify-center gap-1.5"><Plus className="h-4 w-4" />Adicionar</button>
      </div>

      <div className="glass rounded-xl divide-y divide-border">
        {differentials.map((diff) => (
          <div key={diff.id} className="flex items-center gap-3 px-4 py-3">
            <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary grid place-items-center"><Icon name={diff.icon} className="h-4 w-4" /></div>
            <input value={diff.label} onChange={(e) => updateDifferential(diff.id, { label: e.target.value })} className={`${ic} flex-1`} />
            <input value={diff.icon} onChange={(e) => updateDifferential(diff.id, { icon: e.target.value })} className={`${ic} w-32`} />
            <button onClick={() => confirm(`Remover?`) && removeDifferential(diff.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
