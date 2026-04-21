import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, type Brand } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Plus, Trash2, Star, Image as ImageIcon, X, Building2 } from "lucide-react";
import { PhotoPicker } from "@/components/PhotoPicker";

export const Route = createFileRoute("/admin/brands")({ component: BrandsAdmin });

function BrandsAdmin() {
  const { brands, addBrand, updateBrand, removeBrand, setOwnBrand, equipments } = useStore();
  const [name, setName] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    addBrand({ name: name.trim() });
    setName("");
  };

  const sorted = [...brands].sort((a, b) => Number(b.isOwn) - Number(a.isOwn));

  return (
    <div className="px-8 py-8 max-w-5xl">
      <PageHeader
        title="Marcas"
        subtitle="Cadastre sua marca e as marcas concorrentes. Marque uma como 'Minha Empresa' — ela ficará destacada em toda a plataforma."
      />

      <div className="glass rounded-xl p-5 mb-6">
        <div className="text-sm font-semibold mb-3">Adicionar marca</div>
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Philips, GE, Samsung..."
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="flex-1 bg-input/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          <button onClick={submit} className="px-4 py-2 rounded-lg bg-primary text-background text-sm font-semibold inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4" />Adicionar
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((b) => {
          const count = equipments.filter((e) => e.brandId === b.id).length;
          return (
            <BrandCard key={b.id} b={b} count={count} onUpdate={(p) => updateBrand(b.id, p)}
              onSetOwn={() => setOwnBrand(b.id)}
              onDelete={() => confirm(`Remover marca "${b.name}"? Os equipamentos ficarão sem marca.`) && removeBrand(b.id)} />
          );
        })}
      </div>
    </div>
  );
}

function BrandCard({ b, count, onUpdate, onSetOwn, onDelete }: {
  b: Brand; count: number;
  onUpdate: (p: Partial<Brand>) => void;
  onSetOwn: () => void;
  onDelete: () => void;
}) {
  const [editingLogo, setEditingLogo] = useState(false);
  return (
    <div className={`glass rounded-2xl p-5 transition relative ${b.isOwn ? "border-primary/60 shadow-glow" : ""}`}>
      {b.isOwn && (
        <div className="absolute -top-2 left-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-[oklch(0.78_0.2_280)] text-background">
          <Star className="h-2.5 w-2.5 fill-current" /> Minha Empresa
        </div>
      )}
      <div className="flex items-start gap-3 mb-4">
        <button onClick={() => setEditingLogo(true)} className="h-14 w-14 shrink-0 rounded-xl bg-accent/40 grid place-items-center overflow-hidden hover:bg-accent transition relative group">
          {b.logoUrl ? (
            <img src={b.logoUrl} alt={b.name} className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-6 w-6 text-muted-foreground" />
          )}
          <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition grid place-items-center">
            <ImageIcon className="h-4 w-4" />
          </div>
        </button>
        <div className="flex-1 min-w-0">
          <input value={b.name} onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full bg-transparent font-display font-bold text-base focus:outline-none focus:bg-input/40 rounded px-1 -mx-1" />
          <div className="text-xs text-muted-foreground mt-0.5">{count} equipamento{count !== 1 ? "s" : ""}</div>
        </div>
        <button onClick={onDelete} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/15"><Trash2 className="h-4 w-4" /></button>
      </div>

      {!b.isOwn && (
        <button onClick={onSetOwn} className="w-full text-xs px-3 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition font-medium">
          Marcar como minha empresa
        </button>
      )}

      {editingLogo && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setEditingLogo(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-display font-bold">Logo da marca</div>
              <button onClick={() => setEditingLogo(false)} className="p-1.5 rounded-md hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <PhotoPicker value={b.logoUrl} onChange={(v) => onUpdate({ logoUrl: v })} />
          </div>
        </div>
      )}
    </div>
  );
}