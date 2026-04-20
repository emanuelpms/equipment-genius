import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/Icon";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({ component: CategoriesAdmin });
const ic = "w-full bg-input/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

function CategoriesAdmin() {
  const { categories, addCategory, updateCategory, removeCategory } = useStore();
  const [d, setD] = useState({ name: "", icon: "Sparkles", description: "" });
  const submit = () => { if (!d.name.trim()) return; addCategory(d); setD({ name: "", icon: "Sparkles", description: "" }); };

  return (
    <div className="px-8 py-8 max-w-5xl">
      <PageHeader title="Categorias de uso"
        subtitle="Tipos de exames / funcionalidades. Use nomes de ícones do Lucide (Sparkles, HeartPulse, Baby, Bone, Stethoscope, Activity, Brain...)." />

      <div className="glass rounded-xl p-5 mb-6 grid md:grid-cols-12 gap-2">
        <input placeholder="Nome (ex: Cardiologia)" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} className={`md:col-span-3 ${ic}`} />
        <input placeholder="Ícone Lucide" value={d.icon} onChange={(e) => setD({ ...d, icon: e.target.value })} className={`md:col-span-2 ${ic}`} />
        <input placeholder="Descrição curta" value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} className={`md:col-span-5 ${ic}`} />
        <button onClick={submit} className="md:col-span-2 px-3 py-2 rounded-lg bg-primary text-background text-sm font-semibold inline-flex items-center justify-center gap-1.5"><Plus className="h-4 w-4" />Adicionar</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((c) => (
          <div key={c.id} className="glass rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/15 grid place-items-center text-primary"><Icon name={c.icon} className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <input value={c.name} onChange={(e) => updateCategory(c.id, { name: e.target.value })} className={`${ic} font-semibold`} />
              </div>
              <button onClick={() => confirm(`Remover ${c.name}?`) && removeCategory(c.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input value={c.icon} onChange={(e) => updateCategory(c.id, { icon: e.target.value })} className={ic} placeholder="ícone" />
              <input value={c.description ?? ""} onChange={(e) => updateCategory(c.id, { description: e.target.value })} className={`${ic} col-span-2`} placeholder="descrição" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
