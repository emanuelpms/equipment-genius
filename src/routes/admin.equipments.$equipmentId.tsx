import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Image, Save, X } from "lucide-react";
import { Icon } from "@/components/Icon";
import { PhotoPicker } from "@/components/PhotoPicker";
import { TierBadge } from "@/components/TierBadge";
import { useStore, type Equipment, type SpecField, type Tier } from "@/lib/store";

export const Route = createFileRoute("/admin/equipments/$equipmentId")({ component: EquipmentEditPage });

function sortByOrder<T extends { order?: number }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

function EquipmentEditPage() {
  const { equipmentId } = Route.useParams();
  const nav = useNavigate();
  const { equipments, fields, categories, differentials, brands, updateEquipment } = useStore();
  const equipment = equipments.find((e) => e.id === equipmentId);
  const [form, setForm] = useState<Equipment | null>(equipment ? { ...equipment, photos: equipment.photos ?? [], highlights: equipment.highlights ?? [] } : null);
  const groups = useMemo(() => Array.from(new Set(sortByOrder(fields).map((f) => f.group || "Geral"))), [fields]);

  if (!equipment || !form) {
    return (
      <div className="px-6 py-20 max-w-2xl mx-auto text-center">
        <h1 className="font-display text-2xl font-bold mb-2">Equipamento não encontrado</h1>
        <Link to="/admin/equipments" className="text-sm text-primary font-semibold">Voltar para equipamentos</Link>
      </div>
    );
  }

  const save = () => {
    updateEquipment(form.id, form);
    nav({ to: "/admin/equipments" });
  };
  const toggle = (key: "categories" | "bestFor" | "differentials", id: string) => {
    setForm((f) => f && ({ ...f, [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id] }));
  };
  const setSpec = (field: SpecField, value: string | number | boolean | undefined) => {
    setForm((f) => {
      if (!f) return f;
      const specs = { ...f.specs };
      if (value === undefined || value === "") delete specs[field.key];
      else specs[field.key] = value;
      return { ...f, specs };
    });
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Link to="/admin/equipments" className="h-10 w-10 rounded-lg border border-border grid place-items-center hover:bg-accent"><ArrowLeft className="h-4 w-4" /></Link>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-primary font-bold">Edição completa</div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{form.name}</h1>
        </div>
        <button onClick={save} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-glow">
          <Save className="h-4 w-4" /> Salvar alterações
        </button>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        <aside className="space-y-4">
          <div className="rounded-2xl glass overflow-hidden">
            <div className="aspect-[4/3] bg-input/40 grid place-items-center overflow-hidden">
              {form.imageUrl ? <img src={form.imageUrl} alt={form.name} className="h-full w-full object-cover" /> : <Image className="h-10 w-10 text-muted-foreground" />}
            </div>
            <div className="p-4 space-y-3">
              <TierBadge tier={form.tier} size="md" />
              <Field label="Foto principal"><PhotoPicker value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v ?? "" })} /></Field>
            </div>
          </div>
          <Panel title="Classificação">
            <Field label="Marca"><select value={form.brandId ?? ""} onChange={(e) => setForm({ ...form, brandId: e.target.value || undefined })} className={inputCls}><option value="">Sem marca</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}{b.isOwn ? " ★" : ""}</option>)}</select></Field>
            <Field label="Tier"><TierSelect value={form.tier} onChange={(tier) => setForm({ ...form, tier })} /></Field>
            <Field label="Ano"><input type="number" value={form.releaseYear ?? ""} onChange={(e) => setForm({ ...form, releaseYear: +e.target.value || undefined })} className={inputCls} /></Field>
          </Panel>
        </aside>

        <main className="space-y-6">
          <Panel title="Identificação e apresentação">
            <div className="grid md:grid-cols-2 gap-3"><Field label="Nome"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field><Field label="Apelido / sigla"><input value={form.shortName ?? ""} onChange={(e) => setForm({ ...form, shortName: e.target.value })} className={inputCls} /></Field></div>
            <Field label="Tagline"><input value={form.tagline ?? ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={inputCls} /></Field>
            <Field label="Descrição"><textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className={inputCls} /></Field>
          </Panel>

          <Panel title="Especialidades e diferenciais">
            <TokenGrid items={categories} selected={form.categories} onToggle={(id) => toggle("categories", id)} />
            <div className="pt-3 border-t border-border"><div className="text-xs font-semibold mb-2">Melhor para</div><TokenGrid items={categories.filter((c) => form.categories.includes(c.id))} selected={form.bestFor} onToggle={(id) => toggle("bestFor", id)} /></div>
            <div className="pt-3 border-t border-border"><div className="text-xs font-semibold mb-2">Diferenciais</div><TokenGrid items={differentials} selected={form.differentials} onToggle={(id) => toggle("differentials", id)} /></div>
          </Panel>

          <Panel title="Especificações comparativas">
            {groups.map((group) => (
              <div key={group} className={`rounded-xl border p-4 ${groupClass(group)}`}>
                <div className="text-[11px] uppercase tracking-widest font-bold mb-3">{group}</div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {sortByOrder(fields).filter((f) => (f.group || "Geral") === group).map((f) => <Field key={f.id} label={`${f.label}${f.unit ? ` (${f.unit})` : ""}`}><SpecInput field={f} value={form.specs[f.key]} onChange={(v) => setSpec(f, v)} /></Field>)}
                </div>
              </div>
            ))}
          </Panel>
        </main>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-input/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl glass p-5 space-y-4"><h2 className="font-display text-lg font-bold">{title}</h2>{children}</section>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><div className="text-[11px] font-semibold text-muted-foreground mb-1.5">{label}</div>{children}</label>; }
function TierSelect({ value, onChange }: { value: Tier; onChange: (tier: Tier) => void }) { return <select value={value} onChange={(e) => onChange(e.target.value as Tier)} className={inputCls}><option value="super-premium">Super Premium</option><option value="premium">Premium</option><option value="high">High</option><option value="mid">Mid</option><option value="low">Low</option></select>; }
function TokenGrid({ items, selected, onToggle }: { items: { id: string; name?: string; label?: string; icon: string }[]; selected: string[]; onToggle: (id: string) => void }) { return <div className="flex flex-wrap gap-2">{items.map((item) => { const active = selected.includes(item.id); return <button key={item.id} type="button" onClick={() => onToggle(item.id)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${active ? "bg-primary/15 border-primary text-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"}`}><Icon name={item.icon} className="h-3.5 w-3.5" />{item.name ?? item.label}</button>; })}</div>; }
function SpecInput({ field, value, onChange }: { field: SpecField; value: string | number | boolean | undefined; onChange: (v: string | number | boolean | undefined) => void }) { if (field.type === "boolean") return <button type="button" onClick={() => onChange(value === true ? false : value === false ? undefined : true)} className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold ${value === true ? "bg-success/15 border-success/40 text-success" : value === false ? "bg-destructive/10 border-destructive/30 text-destructive" : "bg-input/40 border-border text-muted-foreground"}`}>{value === true ? <Check className="h-4 w-4 mx-auto" /> : value === false ? <X className="h-4 w-4 mx-auto" /> : "—"}</button>; if (field.type === "select") return <select value={String(value ?? "")} onChange={(e) => onChange(e.target.value || undefined)} className={inputCls}><option value="">—</option>{field.options?.map((o) => <option key={o} value={o}>{o}</option>)}</select>; return <input type={field.type === "number" ? "number" : "text"} value={value === undefined ? "" : String(value)} onChange={(e) => onChange(field.type === "number" ? (e.target.value === "" ? undefined : +e.target.value) : (e.target.value || undefined))} className={inputCls} />; }
function groupClass(group: string) { const g = group.toLowerCase(); if (g.includes("radiologia")) return "spec-radiologia-bg"; if (g.includes("obgyn")) return "spec-obgyn-bg"; if (g.includes("cardio")) return "spec-cardiologia-bg"; if (g.includes("uro")) return "spec-urologia-bg"; return "bg-card/60"; }