import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, tierMeta, type Equipment, type Tier } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { TierBadge } from "@/components/TierBadge";
import { Icon } from "@/components/Icon";
import { Plus, Pencil, Trash2, Search, X, Save, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/admin/equipments")({ component: EquipmentsAdmin });

const emptyEq = (): Omit<Equipment, "id" | "createdAt"> => ({
  name: "", shortName: "", tier: "medium", tagline: "", description: "", imageUrl: "",
  categories: [], bestFor: [], differentials: [], specs: {}, highlights: [], releaseYear: new Date().getFullYear(),
});

function EquipmentsAdmin() {
  const { equipments, fields, categories, differentials, addEquipment, updateEquipment, removeEquipment } = useStore();
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState("");
  const [tierFilter, setTierFilter] = useState<Tier | "all">("all");

  const filtered = useMemo(
    () => equipments.filter((e) =>
      (tierFilter === "all" || e.tier === tierFilter) &&
      (q === "" || e.name.toLowerCase().includes(q.toLowerCase()))
    ),
    [equipments, q, tierFilter]
  );

  return (
    <div className="px-8 py-8 max-w-7xl">
      <PageHeader
        title="Equipamentos"
        subtitle="Cadastre cada modelo, defina seu tier (Premium / Medium / Essential), categorias de uso e diferenciais."
        action={
          <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-[oklch(0.78_0.2_280)] text-background text-sm font-semibold shadow-glow">
            <Plus className="h-4 w-4" /> Novo
          </button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..."
            className="w-full bg-input/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div className="flex gap-1 bg-card/60 border border-border rounded-lg p-1">
          {(["all", "premium", "medium", "low"] as const).map((t) => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${tierFilter === t ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "all" ? "Todos" : tierMeta[t].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((e) => (
          <div key={e.id} className="glass rounded-xl p-5 group hover:border-primary/40 transition">
            <div className="flex items-start justify-between mb-3">
              <TierBadge tier={e.tier} />
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => setEditing(e)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => confirm(`Remover ${e.name}?`) && removeEquipment(e.id)} className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="font-display font-bold text-lg leading-tight">{e.name}</div>
            <div className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[32px]">{e.tagline || e.description}</div>
            <div className="flex flex-wrap gap-1 mt-3">
              {e.categories.slice(0, 4).map((cid) => {
                const c = categories.find((x) => x.id === cid);
                if (!c) return null;
                return (
                  <span key={cid} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-accent/60 text-muted-foreground">
                    <Icon name={c.icon} className="h-2.5 w-2.5" />{c.name}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground text-sm">Nenhum equipamento encontrado.</div>
        )}
      </div>

      {(creating || editing) && (
        <EquipmentDrawer
          initial={editing ?? emptyEq()}
          isEdit={!!editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSave={(data) => {
            if (editing) updateEquipment(editing.id, data);
            else addEquipment(data);
            setCreating(false); setEditing(null);
          }}
          fields={fields}
          categories={categories}
          differentials={differentials}
        />
      )}
    </div>
  );
}

function EquipmentDrawer({
  initial, isEdit, onClose, onSave, fields, categories, differentials,
}: {
  initial: Omit<Equipment, "id" | "createdAt"> | Equipment;
  isEdit: boolean;
  onClose: () => void;
  onSave: (data: Omit<Equipment, "id" | "createdAt">) => void;
  fields: ReturnType<typeof useStore.getState>["fields"];
  categories: ReturnType<typeof useStore.getState>["categories"];
  differentials: ReturnType<typeof useStore.getState>["differentials"];
}) {
  const [form, setForm] = useState<Omit<Equipment, "id" | "createdAt">>({
    name: initial.name, shortName: initial.shortName ?? "", tier: initial.tier, tagline: initial.tagline ?? "",
    description: initial.description ?? "", imageUrl: initial.imageUrl ?? "",
    categories: initial.categories, bestFor: initial.bestFor, differentials: initial.differentials,
    specs: { ...initial.specs }, highlights: [...(initial.highlights ?? [])], releaseYear: initial.releaseYear,
  });

  const toggle = (k: "categories" | "bestFor" | "differentials", id: string) =>
    setForm((f) => ({ ...f, [k]: f[k].includes(id) ? f[k].filter((x) => x !== id) : [...f[k], id] }));

  const groups = Array.from(new Set(fields.map((f) => f.group || "Geral")));

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-card border-l border-border overflow-y-auto scrollbar-thin shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-xs text-muted-foreground">{isEdit ? "Editar" : "Novo"} equipamento</div>
            <div className="font-display font-bold text-lg">{form.name || "Sem nome"}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent text-muted-foreground"><X className="h-4 w-4" /></button>
            <button onClick={() => form.name.trim() && onSave(form)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background font-semibold text-sm shadow-glow disabled:opacity-50">
              <Save className="h-4 w-4" /> Salvar
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Section title="Identificação">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nome do modelo *">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Apelido / Sigla">
                <input value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Tier *">
                <div className="flex gap-2">
                  {(["premium", "medium", "low"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, tier: t })}
                      className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition ${
                        form.tier === t ? `${tierMeta[t].gradient} text-background border-transparent` : "border-border text-muted-foreground hover:text-foreground"
                      }`}>{tierMeta[t].label}</button>
                  ))}
                </div>
              </Field>
              <Field label="Ano">
                <input type="number" value={form.releaseYear ?? ""} onChange={(e) => setForm({ ...form, releaseYear: +e.target.value || undefined })} className={inputCls} />
              </Field>
            </div>
            <Field label="Tagline (curta)">
              <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Descrição">
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls} />
            </Field>
            <Field label="URL da imagem">
              <div className="flex gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground self-center" />
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className={inputCls} />
              </div>
            </Field>
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

          <Section title="Melhor para" hint="Categorias onde este modelo é destaque (aparece em 'Melhores para')">
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

          <Section title="Especificações" hint="Preenche as colunas comparativas. Edite as colunas em 'Colunas Comparativas'.">
            {groups.map((g) => (
              <div key={g} className="space-y-2 mb-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{g}</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {fields.filter((f) => (f.group || "Geral") === g).map((f) => (
                    <Field key={f.id} label={`${f.label}${f.unit ? ` (${f.unit})` : ""}`}>
                      {f.type === "boolean" ? (
                        <select value={String(form.specs[f.key] ?? "")} onChange={(e) => setForm({ ...form, specs: { ...form.specs, [f.key]: e.target.value === "true" } })} className={inputCls}>
                          <option value="">—</option><option value="true">Sim</option><option value="false">Não</option>
                        </select>
                      ) : f.type === "select" ? (
                        <select value={String(form.specs[f.key] ?? "")} onChange={(e) => setForm({ ...form, specs: { ...form.specs, [f.key]: e.target.value } })} className={inputCls}>
                          <option value="">—</option>
                          {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input type={f.type === "number" ? "number" : "text"} value={String(form.specs[f.key] ?? "")}
                          onChange={(e) => setForm({ ...form, specs: { ...form.specs, [f.key]: f.type === "number" ? +e.target.value : e.target.value } })} className={inputCls} />
                      )}
                    </Field>
                  ))}
                </div>
              </div>
            ))}
          </Section>

          <Section title="Destaques (bullets curtos)">
            <HighlightsEditor value={form.highlights ?? []} onChange={(v) => setForm({ ...form, highlights: v })} />
          </Section>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-input/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";

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
        <input value={v} onChange={(e) => setV(e.target.value)} placeholder="Ex: Workflow turbo" className={inputCls}
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
