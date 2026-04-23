import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, tierMeta, type Equipment, type Tier, type SpecField } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { TierBadge } from "@/components/TierBadge";
import { Icon } from "@/components/Icon";
import { Plus, Trash2, Search, X, Save, Copy, Settings2, Star, Check, Download, Upload } from "lucide-react";
import { PhotoPicker } from "@/components/PhotoPicker";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableItem } from "@/components/SortableItem";

export const Route = createFileRoute("/admin/equipments")({ component: EquipmentsAdmin });

const emptyEq = (brandId?: string): Omit<Equipment, "id" | "createdAt"> => ({
  name: "Novo equipamento", shortName: "", brandId, tier: "mid", tagline: "", description: "", imageUrl: "",
  photos: [], categories: [], bestFor: [], differentials: [], specs: {}, highlights: [], releaseYear: new Date().getFullYear(),
});

function sortByOrder<T extends { order?: number }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

function EquipmentsAdmin() {
  const {
    equipments, fields, categories, differentials, brands,
    addEquipment, updateEquipment, removeEquipment, reorderEquipments, duplicateEquipment,
    addBrand, importCatalog,
  } = useStore();
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [q, setQ] = useState("");
  const [tierFilter, setTierFilter] = useState<Tier | "all">("all");
  const [brandFilter, setBrandFilter] = useState<string | "all">("all");
  const [newBrandFor, setNewBrandFor] = useState<string | null>(null); // equipment id awaiting brand creation
  const [importOpen, setImportOpen] = useState(false);

  const ownBrand = brands.find((b) => b.isOwn);
  const sortedEquips = sortByOrder(equipments);
  const visibleFields = sortByOrder(fields);

  const filtered = useMemo(
    () => sortedEquips.filter((e) =>
      (tierFilter === "all" || e.tier === tierFilter) &&
      (brandFilter === "all" || e.brandId === brandFilter) &&
      (q === "" || e.name.toLowerCase().includes(q.toLowerCase()))
    ),
    [sortedEquips, q, tierFilter, brandFilter]
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const ids = filtered.map((x) => x.id);
    const oldIdx = ids.indexOf(String(e.active.id));
    const newIdx = ids.indexOf(String(e.over.id));
    const newOrder = arrayMove(ids, oldIdx, newIdx);
    // merge with the rest
    const fullOrder = [...newOrder, ...sortedEquips.map((e) => e.id).filter((id) => !ids.includes(id))];
    reorderEquipments(fullOrder);
  };

  const updateSpec = (eqId: string, key: string, value: string | number | boolean | undefined) => {
    const eq = equipments.find((x) => x.id === eqId);
    if (!eq) return;
    const next = { ...eq.specs };
    if (value === undefined || value === "") delete next[key];
    else next[key] = value;
    updateEquipment(eqId, { specs: next });
  };

  return (
    <div className="px-6 py-8 max-w-[1600px]">
      <PageHeader
        title="Equipamentos"
        subtitle="Edite tudo direto na tabela. Arraste para reordenar. Clique em ⚙ para detalhes (categorias, diferenciais, fotos)."
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => exportCatalog({ fields, categories, differentials, brands, equipments })}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-border hover:border-primary text-xs font-semibold text-muted-foreground hover:text-foreground">
              <Download className="h-3.5 w-3.5" /> Exportar
            </button>
            <button onClick={() => setImportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-border hover:border-primary text-xs font-semibold text-muted-foreground hover:text-foreground">
              <Upload className="h-3.5 w-3.5" /> Importar
            </button>
            <button onClick={() => addEquipment(emptyEq(ownBrand?.id))}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-[oklch(0.78_0.2_280)] text-background text-sm font-semibold shadow-glow">
              <Plus className="h-4 w-4" /> Novo equipamento
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..."
            className="w-full bg-input/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div className="flex gap-1 bg-card/60 border border-border rounded-lg p-1">
          {(["all", "super-premium", "premium", "high", "mid", "low"] as const).map((t) => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${tierFilter === t ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "all" ? "Todos tiers" : tierMeta[t].label}
            </button>
          ))}
        </div>
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}
          className="bg-card/60 border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40">
          <option value="all">Todas as marcas</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}{b.isOwn ? " ★" : ""}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl glass scrollbar-thin">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="text-left p-3 w-8"></th>
                <th className="text-left p-3 sticky left-0 bg-card/95 backdrop-blur z-10 min-w-[220px]">Equipamento</th>
                <th className="text-left p-3 min-w-[120px]">Marca</th>
                <th className="text-left p-3 min-w-[110px]">Tier</th>
                {visibleFields.map((f) => (
                  <th key={f.id} className="text-left p-3 min-w-[120px] font-medium">
                    {f.label}
                    {f.unit && <span className="text-muted-foreground/60 ml-1">({f.unit})</span>}
                  </th>
                ))}
                <th className="text-right p-3 sticky right-0 bg-card/95 backdrop-blur z-10 w-28">Ações</th>
              </tr>
            </thead>
            <SortableContext items={filtered.map((e) => e.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {filtered.map((e) => (
                  <EquipmentRow
                    key={e.id} e={e} fields={visibleFields} brands={brands}
                    onUpdate={(p) => updateEquipment(e.id, p)}
                    onUpdateSpec={(k, v) => updateSpec(e.id, k, v)}
                    onEdit={() => setEditing(e)}
                    onDuplicate={() => duplicateEquipment(e.id)}
                    onDelete={() => confirm(`Remover ${e.name}?`) && removeEquipment(e.id)}
                    onRequestNewBrand={() => setNewBrandFor(e.id)}
                  />
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={visibleFields.length + 5} className="text-center py-16 text-muted-foreground text-sm">Nenhum equipamento. Clique em "Novo equipamento" para começar.</td></tr>
                )}
                <QuickAddRow
                  colSpan={visibleFields.length + 5}
                  brands={brands}
                  defaultBrandId={ownBrand?.id}
                  onAdd={(payload) => addEquipment({ ...emptyEq(payload.brandId), name: payload.name, tier: payload.tier, brandId: payload.brandId })}
                />
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
      </div>

      {editing && (
        <DetailDrawer
          eq={editing}
          onClose={() => setEditing(null)}
          onSave={(p) => { updateEquipment(editing.id, p); setEditing(null); }}
        />
      )}

      {newBrandFor && (
        <QuickAddBrandDialog
          onClose={() => setNewBrandFor(null)}
          onCreate={(name) => {
            const id = addBrand({ name });
            updateEquipment(newBrandFor, { brandId: id });
            setNewBrandFor(null);
          }}
        />
      )}

      {importOpen && (
        <ImportDialog
          onClose={() => setImportOpen(false)}
          onImport={(data, mode) => { importCatalog(data, mode); setImportOpen(false); }}
        />
      )}
    </div>
  );
}

function EquipmentRow({ e, fields, brands, onUpdate, onUpdateSpec, onEdit, onDuplicate, onDelete, onRequestNewBrand }: {
  e: Equipment; fields: SpecField[]; brands: ReturnType<typeof useStore.getState>["brands"];
  onUpdate: (p: Partial<Equipment>) => void;
  onUpdateSpec: (key: string, v: string | number | boolean | undefined) => void;
  onEdit: () => void; onDuplicate: () => string | undefined | void; onDelete: () => void;
  onRequestNewBrand: () => void;
}) {
  const brand = brands.find((b) => b.id === e.brandId);
  return (
    <SortableTableRow id={e.id} highlighted={brand?.isOwn}>
      <td className="p-3 align-middle">
        <input value={e.name} onChange={(ev) => onUpdate({ name: ev.target.value })}
          className="w-full bg-transparent font-semibold focus:outline-none focus:bg-input/40 rounded px-1.5 py-1 -mx-1.5" />
        {brand?.isOwn && <div className="flex items-center gap-1 text-[10px] text-primary mt-0.5 px-1.5"><Star className="h-2.5 w-2.5 fill-current" />Seu produto</div>}
      </td>
      <td className="p-3 align-middle">
        <select value={e.brandId ?? ""} onChange={(ev) => {
          if (ev.target.value === "__new__") { onRequestNewBrand(); return; }
          onUpdate({ brandId: ev.target.value || undefined });
        }}
          className="w-full bg-input/40 border border-border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40">
          <option value="">— sem marca —</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}{b.isOwn ? " ★" : ""}</option>)}
          <option value="__new__">+ Nova marca…</option>
        </select>
      </td>
      <td className="p-3 align-middle">
        <select value={e.tier} onChange={(ev) => onUpdate({ tier: ev.target.value as Tier })}
          className="w-full bg-input/40 border border-border rounded-md px-2 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40">
          <option value="premium">Premium</option>
          <option value="medium">Medium</option>
          <option value="low">Essential</option>
        </select>
      </td>
      {fields.map((f) => (
        <td key={f.id} className="p-2 align-middle">
          <SpecCell f={f} v={e.specs[f.key]} onChange={(v) => onUpdateSpec(f.key, v)} />
        </td>
      ))}
      <td className="p-3 align-middle text-right sticky right-0 bg-card/80 backdrop-blur">
        <div className="inline-flex gap-0.5">
          <button onClick={onEdit} title="Detalhes" className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Settings2 className="h-3.5 w-3.5" /></button>
          <button onClick={onDuplicate} title="Duplicar" className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
          <button onClick={onDelete} title="Remover" className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </td>
    </SortableTableRow>
  );
}

function SortableTableRow({ id, highlighted, children }: { id: string; highlighted?: boolean; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      className={`border-t border-border hover:bg-accent/20 ${highlighted ? "bg-primary/5" : ""}`}>
      <td className="p-3 align-middle">
        <button {...attributes} {...listeners} className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
          <Icon name="GripVertical" className="h-4 w-4" />
        </button>
      </td>
      {children}
    </tr>
  );
}

function SpecCell({ f, v, onChange }: { f: SpecField; v: string | number | boolean | undefined; onChange: (v: string | number | boolean | undefined) => void }) {
  const cls = "w-full bg-input/30 border border-transparent hover:border-border focus:border-primary focus:bg-input/60 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40";
  if (f.type === "boolean") {
    return (
      <button onClick={() => onChange(v === true ? false : v === false ? undefined : true)}
        className={`w-full px-2 py-1.5 rounded-md border text-xs font-medium transition ${
          v === true ? "bg-success/20 border-success/40 text-success" :
          v === false ? "bg-destructive/15 border-destructive/30 text-destructive" :
          "bg-input/30 border-transparent hover:border-border text-muted-foreground"
        }`}>
        {v === true ? <Check className="h-3.5 w-3.5 inline" /> : v === false ? <X className="h-3.5 w-3.5 inline" /> : "—"}
      </button>
    );
  }
  if (f.type === "select") {
    return (
      <select value={String(v ?? "")} onChange={(e) => onChange(e.target.value || undefined)} className={cls}>
        <option value="">—</option>
        {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  return (
    <input type={f.type === "number" ? "number" : "text"}
      value={v === undefined ? "" : String(v)}
      onChange={(e) => onChange(f.type === "number" ? (e.target.value === "" ? undefined : +e.target.value) : (e.target.value || undefined))}
      className={cls} placeholder="—" />
  );
}

function DetailDrawer({ eq, onClose, onSave }: {
  eq: Equipment; onClose: () => void;
  onSave: (p: Partial<Equipment>) => void;
}) {
  const { categories, differentials } = useStore();
  const [form, setForm] = useState<Equipment>({ ...eq, photos: eq.photos ?? [], highlights: eq.highlights ?? [] });

  const toggle = (k: "categories" | "bestFor" | "differentials", id: string) =>
    setForm((f) => ({ ...f, [k]: f[k].includes(id) ? f[k].filter((x) => x !== id) : [...f[k], id] }));

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-card border-l border-border overflow-y-auto scrollbar-thin shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-xs text-muted-foreground">Detalhes do equipamento</div>
            <div className="font-display font-bold text-lg">{form.name}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent text-muted-foreground"><X className="h-4 w-4" /></button>
            <button onClick={() => onSave(form)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background font-semibold text-sm shadow-glow">
              <Save className="h-4 w-4" /> Salvar
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Section title="Identificação rápida">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Apelido / Sigla">
                <input value={form.shortName ?? ""} onChange={(e) => setForm({ ...form, shortName: e.target.value })} className={ic} />
              </Field>
              <Field label="Ano">
                <input type="number" value={form.releaseYear ?? ""} onChange={(e) => setForm({ ...form, releaseYear: +e.target.value || undefined })} className={ic} />
              </Field>
            </div>
            <Field label="Tagline (curta)">
              <input value={form.tagline ?? ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={ic} />
            </Field>
            <Field label="Descrição">
              <textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={ic} />
            </Field>
          </Section>

          <Section title="Foto principal">
            <PhotoPicker value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v ?? "" })} />
          </Section>

          <Section title="Galeria de fotos" hint="Fotos adicionais que aparecem no detalhe">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(form.photos ?? []).map((p, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-input/40 group">
                  <img src={p} alt="" className="h-full w-full object-cover" />
                  <button onClick={() => setForm({ ...form, photos: form.photos!.filter((_, j) => j !== i) })}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 grid place-items-center opacity-0 group-hover:opacity-100 transition hover:bg-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <PhotoPicker value={undefined} onChange={(v) => v && setForm({ ...form, photos: [...(form.photos ?? []), v] })} aspect="square" />
          </Section>

          <Section title="Categorias de uso" hint="Onde este equipamento pode ser usado">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c.id} type="button" onClick={() => toggle("categories", c.id)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                    form.categories.includes(c.id) ? "bg-primary/20 border-primary text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                  }`}>
                  <Icon name={c.icon} className="h-3 w-3" /> {c.name}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Melhor para" hint="Categorias onde este modelo é destaque">
            <div className="flex flex-wrap gap-2">
              {categories.filter((c) => form.categories.includes(c.id)).map((c) => (
                <button key={c.id} type="button" onClick={() => toggle("bestFor", c.id)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                    form.bestFor.includes(c.id) ? "bg-tier-premium/20 border-tier-premium text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                  }`}>
                  <Icon name={c.icon} className="h-3 w-3" /> {c.name}
                </button>
              ))}
              {form.categories.length === 0 && <p className="text-xs text-muted-foreground">Selecione categorias acima primeiro.</p>}
            </div>
          </Section>

          <Section title="Diferenciais">
            <div className="grid grid-cols-2 gap-2">
              {differentials.map((d) => (
                <button key={d.id} type="button" onClick={() => toggle("differentials", d.id)}
                  className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border transition ${
                    form.differentials.includes(d.id) ? "bg-primary/15 border-primary text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                  }`}>
                  <Icon name={d.icon} className="h-3.5 w-3.5" /> {d.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Destaques">
            <HighlightsEditor value={form.highlights ?? []} onChange={(v) => setForm({ ...form, highlights: v })} />
          </Section>
        </div>
      </div>
    </div>
  );
}

const ic = "w-full bg-input/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2.5">
        <div className="text-sm font-semibold">{title}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] font-medium text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  );
}
function HighlightsEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [v, setV] = useState("");
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input value={v} onChange={(e) => setV(e.target.value)} placeholder="Ex: Workflow turbo" className={ic}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (v.trim()) { onChange([...value, v.trim()]); setV(""); } } }} />
        <button type="button" onClick={() => { if (v.trim()) { onChange([...value, v.trim()]); setV(""); } }}
          className="px-3 rounded-lg bg-accent text-sm font-medium hover:bg-accent/80">Add</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((h, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-primary/15 text-foreground rounded-full pl-3 pr-1.5 py-1">
            {h}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="h-4 w-4 rounded-full hover:bg-destructive/30 grid place-items-center"><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ───────────────── Quick add: row at bottom of the table ─────────────────
function QuickAddRow({ colSpan, brands, defaultBrandId, onAdd }: {
  colSpan: number;
  brands: ReturnType<typeof useStore.getState>["brands"];
  defaultBrandId?: string;
  onAdd: (p: { name: string; brandId?: string; tier: Tier }) => void;
}) {
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState<string | undefined>(defaultBrandId);
  const [tier, setTier] = useState<Tier>("mid");
  const submit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), brandId, tier });
    setName("");
  };
  return (
    <tr className="border-t border-border bg-primary/5">
      <td className="p-3 align-middle text-center"><Plus className="h-3.5 w-3.5 text-primary mx-auto" /></td>
      <td className="p-3 align-middle" colSpan={1}>
        <input value={name} onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Digite o nome do equipamento e Enter…"
          className="w-full bg-input/40 border border-dashed border-primary/40 focus:border-primary rounded-md px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40" />
      </td>
      <td className="p-3 align-middle">
        <select value={brandId ?? ""} onChange={(e) => setBrandId(e.target.value || undefined)}
          className="w-full bg-input/40 border border-border rounded-md px-2 py-1.5 text-xs">
          <option value="">— sem marca —</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}{b.isOwn ? " ★" : ""}</option>)}
        </select>
      </td>
      <td className="p-3 align-middle">
        <select value={tier} onChange={(e) => setTier(e.target.value as Tier)}
          className="w-full bg-input/40 border border-border rounded-md px-2 py-1.5 text-xs font-semibold">
          <option value="premium">Premium</option>
          <option value="medium">Medium</option>
          <option value="low">Essential</option>
        </select>
      </td>
      <td colSpan={Math.max(1, colSpan - 5)} className="p-3 text-xs text-muted-foreground italic">
        Pressione Enter ou clique em Adicionar →
      </td>
      <td className="p-3 align-middle text-right sticky right-0 bg-card/80 backdrop-blur">
        <button onClick={submit} disabled={!name.trim()}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-background text-xs font-bold disabled:opacity-40">
          <Plus className="h-3 w-3" /> Adicionar
        </button>
      </td>
    </tr>
  );
}

// ───────────────── Quick add: nova marca inline ─────────────────
function QuickAddBrandDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="font-display font-bold text-lg mb-1">Nova marca concorrente</div>
        <div className="text-xs text-muted-foreground mb-4">Cadastro rápido — você pode adicionar logo e ajustes em Admin → Marcas.</div>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onCreate(name.trim()); }}
          placeholder="Ex: Mindray, Canon, Fujifilm…"
          className="w-full bg-input/40 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary mb-4" />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent">Cancelar</button>
          <button onClick={() => name.trim() && onCreate(name.trim())} disabled={!name.trim()}
            className="px-4 py-2 rounded-lg bg-primary text-background text-sm font-semibold disabled:opacity-40">Criar marca</button>
        </div>
      </div>
    </div>
  );
}

// ───────────────── Import / Export do catálogo ─────────────────
function exportCatalog(data: object) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `catalogo-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function ImportDialog({ onClose, onImport }: {
  onClose: () => void;
  onImport: (data: Record<string, unknown>, mode: "merge" | "replace") => void;
}) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [error, setError] = useState("");

  const onFile = (file: File) => {
    const r = new FileReader();
    r.onload = () => setText(String(r.result ?? ""));
    r.readAsText(file);
  };

  const submit = () => {
    try {
      const parsed = JSON.parse(text);
      onImport(parsed, mode);
    } catch {
      setError("JSON inválido. Cole o conteúdo exportado anteriormente.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-display font-bold text-lg">Importar catálogo</div>
            <div className="text-xs text-muted-foreground">Cole o JSON ou escolha um arquivo exportado.</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        <input type="file" accept="application/json" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-accent file:text-foreground file:text-xs file:font-semibold mb-3" />
        <textarea value={text} onChange={(e) => { setText(e.target.value); setError(""); }} rows={8}
          placeholder='{ "equipments": [...], "brands": [...] }'
          className="w-full bg-input/40 border border-border rounded-lg p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 mb-3" />
        <div className="flex items-center gap-4 mb-4 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" checked={mode === "merge"} onChange={() => setMode("merge")} /> Mesclar (mantém os existentes)
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" checked={mode === "replace"} onChange={() => setMode("replace")} /> Substituir tudo
          </label>
        </div>
        {error && <div className="text-xs text-destructive mb-3">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent">Cancelar</button>
          <button onClick={submit} disabled={!text.trim()}
            className="px-4 py-2 rounded-lg bg-primary text-background text-sm font-semibold disabled:opacity-40">Importar</button>
        </div>
      </div>
    </div>
  );
}