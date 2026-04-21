import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Tier = "premium" | "medium" | "low";
export type FieldType = "text" | "number" | "boolean" | "select";

export interface SpecField {
  id: string;
  key: string;        // identifier
  label: string;      // display name
  type: FieldType;
  unit?: string;
  options?: string[]; // for select
  group?: string;     // grouping in compare table
  highlight?: boolean;
  order?: number;
}

export interface Category {
  id: string;
  name: string;       // ex: "IA", "Cardiologia", "Obstetrícia"
  icon: string;       // lucide icon name
  description?: string;
  color?: string;     // optional accent
  order?: number;
}

export interface Differential {
  id: string;
  label: string;
  icon: string;
  order?: number;
}

export interface Brand {
  id: string;
  name: string;
  isOwn?: boolean;     // true = "minha empresa"
  logoUrl?: string;    // url or base64
  color?: string;      // accent
  order?: number;
}

export interface Equipment {
  id: string;
  name: string;
  shortName?: string;
  brandId?: string;
  tier: Tier;
  tagline?: string;
  description?: string;
  imageUrl?: string;
  photos?: string[];          // url or base64
  categories: string[];      // category ids
  bestFor: string[];          // category ids where it shines
  differentials: string[];   // differential ids
  specs: Record<string, string | number | boolean>;
  highlights?: string[];     // free-text bullets
  releaseYear?: number;
  order?: number;
  createdAt: number;
}

export interface SavedComparison {
  id: string;
  name: string;
  ownEquipmentId: string;
  competitorIds: string[];
  createdAt: number;
}

export type Role = "admin" | "seller";
export interface AuthState { role: Role | null; name: string | null; }

interface AppState {
  auth: AuthState;
  login: (role: Role, name: string) => void;
  logout: () => void;

  fields: SpecField[];
  categories: Category[];
  differentials: Differential[];
  equipments: Equipment[];
  brands: Brand[];
  savedComparisons: SavedComparison[];

  addField: (f: Omit<SpecField, "id">) => void;
  updateField: (id: string, patch: Partial<SpecField>) => void;
  removeField: (id: string) => void;
  reorderFields: (ids: string[]) => void;

  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  reorderCategories: (ids: string[]) => void;

  addDifferential: (d: Omit<Differential, "id">) => void;
  updateDifferential: (id: string, patch: Partial<Differential>) => void;
  removeDifferential: (id: string) => void;
  reorderDifferentials: (ids: string[]) => void;

  addBrand: (b: Omit<Brand, "id">) => string;
  updateBrand: (id: string, patch: Partial<Brand>) => void;
  removeBrand: (id: string) => void;
  setOwnBrand: (id: string) => void;

  addEquipment: (e: Omit<Equipment, "id" | "createdAt">) => void;
  updateEquipment: (id: string, patch: Partial<Equipment>) => void;
  removeEquipment: (id: string) => void;
  reorderEquipments: (ids: string[]) => void;
  duplicateEquipment: (id: string) => void;

  addSavedComparison: (c: Omit<SavedComparison, "id" | "createdAt">) => string;
  removeSavedComparison: (id: string) => void;

  resetSeed: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const seedFields: SpecField[] = [
  { id: uid(), key: "transducers", label: "Transdutores Suportados", type: "number", unit: "portas", group: "Hardware", highlight: true },
  { id: uid(), key: "monitor", label: "Monitor", type: "text", unit: "polegadas", group: "Hardware" },
  { id: uid(), key: "touchscreen", label: "Touchscreen", type: "boolean", group: "Hardware" },
  { id: uid(), key: "battery", label: "Bateria Integrada", type: "boolean", group: "Hardware" },
  { id: uid(), key: "aiEngine", label: "Motor de IA", type: "select", options: ["Nenhum", "Básico", "Avançado", "Pro"], group: "Inteligência", highlight: true },
  { id: uid(), key: "elastography", label: "Elastografia", type: "boolean", group: "Imagem" },
  { id: uid(), key: "contrastImaging", label: "Imagem com Contraste", type: "boolean", group: "Imagem" },
  { id: uid(), key: "weight", label: "Peso", type: "number", unit: "kg", group: "Físico" },
];

const seedCategories: Category[] = [
  { id: uid(), name: "IA", icon: "Sparkles", description: "Inteligência artificial e automação", color: "270" },
  { id: uid(), name: "Cardiologia", icon: "HeartPulse", description: "Exames cardíacos avançados", color: "10" },
  { id: uid(), name: "Obstetrícia", icon: "Baby", description: "Pré-natal e ginecologia", color: "330" },
  { id: uid(), name: "MSK", icon: "Bone", description: "Musculoesquelético", color: "200" },
  { id: uid(), name: "Vascular", icon: "Activity", description: "Estudos vasculares", color: "150" },
  { id: uid(), name: "Point-of-Care", icon: "Stethoscope", description: "Ultrassom à beira leito", color: "60" },
];

const seedDiffs: Differential[] = [
  { id: uid(), label: "Imagem premium 4K", icon: "Monitor" },
  { id: uid(), label: "IA de auto-medição", icon: "Wand2" },
  { id: uid(), label: "Workflow rápido", icon: "Zap" },
  { id: uid(), label: "Conectividade DICOM", icon: "Wifi" },
  { id: uid(), label: "Ergonomia premium", icon: "Hand" },
  { id: uid(), label: "Portátil leve", icon: "Briefcase" },
];

const seedEquipments = (
  fields: SpecField[],
  cats: Category[],
  diffs: Differential[]
): Equipment[] => {
  const f = (k: string) => fields.find((x) => x.key === k)!.key;
  const c = (n: string) => cats.find((x) => x.name === n)!.id;
  const d = (n: string) => diffs.find((x) => x.label === n)!.id;
  return [
    {
      id: uid(),
      name: "Apex Pro X9",
      shortName: "X9",
      tier: "premium",
      tagline: "Topo de linha com IA Pro",
      description: "Plataforma flagship com motor de IA mais avançado, imagem 4K e workflow turbo.",
      categories: [c("IA"), c("Cardiologia"), c("Obstetrícia"), c("Vascular")],
      bestFor: [c("IA"), c("Cardiologia")],
      differentials: [d("Imagem premium 4K"), d("IA de auto-medição"), d("Workflow rápido")],
      specs: {
        [f("transducers")]: 4,
        [f("monitor")]: "23.8",
        [f("touchscreen")]: true,
        [f("battery")]: true,
        [f("aiEngine")]: "Pro",
        [f("elastography")]: true,
        [f("contrastImaging")]: true,
        [f("weight")]: 90,
      },
      highlights: ["Auto-NT", "Cardio AI Suite", "Live HQ Beamforming"],
      releaseYear: 2024,
      createdAt: Date.now(),
    },
    {
      id: uid(),
      name: "Vista M5",
      shortName: "M5",
      tier: "medium",
      tagline: "Equilíbrio entre desempenho e custo",
      description: "Versátil para uso geral com IA avançada e excelente ergonomia.",
      categories: [c("Obstetrícia"), c("MSK"), c("Vascular"), c("IA")],
      bestFor: [c("Obstetrícia"), c("MSK")],
      differentials: [d("IA de auto-medição"), d("Ergonomia premium"), d("Conectividade DICOM")],
      specs: {
        [f("transducers")]: 3,
        [f("monitor")]: "21.5",
        [f("touchscreen")]: true,
        [f("battery")]: false,
        [f("aiEngine")]: "Avançado",
        [f("elastography")]: true,
        [f("contrastImaging")]: false,
        [f("weight")]: 75,
      },
      highlights: ["Pré-natal AI", "Workflow OB"],
      releaseYear: 2023,
      createdAt: Date.now(),
    },
    {
      id: uid(),
      name: "Go Lite P2",
      shortName: "P2",
      tier: "low",
      tagline: "Portátil para POC",
      description: "Ultra portátil para point-of-care, simples e confiável.",
      categories: [c("Point-of-Care"), c("Vascular")],
      bestFor: [c("Point-of-Care")],
      differentials: [d("Portátil leve"), d("Conectividade DICOM")],
      specs: {
        [f("transducers")]: 2,
        [f("monitor")]: "15.6",
        [f("touchscreen")]: true,
        [f("battery")]: true,
        [f("aiEngine")]: "Básico",
        [f("elastography")]: false,
        [f("contrastImaging")]: false,
        [f("weight")]: 8,
      },
      highlights: ["Bateria 4h", "Ultraportátil"],
      releaseYear: 2024,
      createdAt: Date.now(),
    },
  ];
};

const initialFields = seedFields;
const initialCats = seedCategories;
const initialDiffs = seedDiffs;
const initialEquips = seedEquipments(initialFields, initialCats, initialDiffs);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      auth: { role: null, name: null },
      login: (role, name) => set({ auth: { role, name } }),
      logout: () => set({ auth: { role: null, name: null } }),

      fields: initialFields,
      categories: initialCats,
      differentials: initialDiffs,
      equipments: initialEquips,

      addField: (f) => set((s) => ({ fields: [...s.fields, { ...f, id: uid() }] })),
      updateField: (id, patch) => set((s) => ({ fields: s.fields.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeField: (id) => set((s) => {
        const key = s.fields.find((f) => f.id === id)?.key;
        return {
          fields: s.fields.filter((x) => x.id !== id),
          equipments: key
            ? s.equipments.map((e) => {
                const { [key]: _, ...rest } = e.specs;
                return { ...e, specs: rest };
              })
            : s.equipments,
        };
      }),

      addCategory: (c) => set((s) => ({ categories: [...s.categories, { ...c, id: uid() }] })),
      updateCategory: (id, patch) => set((s) => ({ categories: s.categories.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeCategory: (id) => set((s) => ({
        categories: s.categories.filter((x) => x.id !== id),
        equipments: s.equipments.map((e) => ({
          ...e,
          categories: e.categories.filter((c) => c !== id),
          bestFor: e.bestFor.filter((c) => c !== id),
        })),
      })),

      addDifferential: (d) => set((s) => ({ differentials: [...s.differentials, { ...d, id: uid() }] })),
      updateDifferential: (id, patch) => set((s) => ({ differentials: s.differentials.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeDifferential: (id) => set((s) => ({
        differentials: s.differentials.filter((x) => x.id !== id),
        equipments: s.equipments.map((e) => ({ ...e, differentials: e.differentials.filter((d) => d !== id) })),
      })),

      addEquipment: (e) => set((s) => ({ equipments: [...s.equipments, { ...e, id: uid(), createdAt: Date.now() }] })),
      updateEquipment: (id, patch) => set((s) => ({ equipments: s.equipments.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeEquipment: (id) => set((s) => ({ equipments: s.equipments.filter((x) => x.id !== id) })),

      resetSeed: () => set({
        fields: initialFields,
        categories: initialCats,
        differentials: initialDiffs,
        equipments: initialEquips,
      }),
    }),
    { name: "equip-catalog-v1" }
  )
);

export const tierMeta: Record<Tier, { label: string; gradient: string; ring: string; text: string }> = {
  premium: { label: "Premium", gradient: "tier-premium-bg", ring: "ring-tier-premium/40", text: "text-tier-premium" },
  medium:  { label: "Medium",  gradient: "tier-medium-bg",  ring: "ring-tier-medium/40",  text: "text-tier-medium"  },
  low:     { label: "Essential", gradient: "tier-low-bg",   ring: "ring-tier-low/40",     text: "text-tier-low"     },
};
