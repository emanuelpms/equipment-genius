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

// Samsung Healthcare ultrasound seed data
const F = {
  imgTech: "imgTech", channels: "channels", depth: "depth", fps: "fps",
  monitorRes: "monitorRes", monitorSize: "monitorSize", weight: "weight",
  battery: "battery", touch: "touch",
  pConvex: "pConvex", pLinear: "pLinear", pEndo: "pEndo", pTEE: "pTEE",
  pMatrix: "pMatrix", pIntra: "pIntra", pMicro: "pMicro", probesTotal: "probesTotal",
  cardio: "cardio", elasto: "elasto", ceus: "ceus", ai: "ai",
  obBio: "obBio", colorDoppler: "colorDoppler", pocus: "pocus",
  vol3d4d: "vol3d4d", strain: "strain", needle: "needle",
  licModel: "licModel", licPerp: "licPerp", swUpdate: "swUpdate",
  dicom: "dicom", hisris: "hisris", autoPdf: "autoPdf", training: "training",
  warranty: "warranty", support247: "support247", trainIncl: "trainIncl",
  responseTime: "responseTime", loaner: "loaner", localStock: "localStock",
  wifi: "wifi", bluetooth: "bluetooth", usbc: "usbc", cloud: "cloud", telemed: "telemed",
} as const;

const seedFields: SpecField[] = [
  // Hardware
  { id: uid(), key: F.imgTech, label: "Tecnologia de imagem", type: "text", group: "Hardware", highlight: true, order: 0 },
  { id: uid(), key: F.channels, label: "Número de canais", type: "number", group: "Hardware", highlight: true, order: 1 },
  { id: uid(), key: F.depth, label: "Profundidade máxima", type: "number", unit: "cm", group: "Hardware", order: 2 },
  { id: uid(), key: F.fps, label: "Frame rate", type: "number", unit: "fps", group: "Hardware", order: 3 },
  { id: uid(), key: F.monitorRes, label: "Resolução do monitor", type: "text", group: "Hardware", order: 4 },
  { id: uid(), key: F.monitorSize, label: "Tamanho do monitor", type: "number", unit: "pol", group: "Hardware", order: 5 },
  { id: uid(), key: F.weight, label: "Peso", type: "number", unit: "kg", group: "Hardware", order: 6 },
  { id: uid(), key: F.battery, label: "Portátil com bateria", type: "boolean", group: "Hardware", order: 7 },
  { id: uid(), key: F.touch, label: "Tela touch screen", type: "boolean", group: "Hardware", order: 8 },
  // Transdutores
  { id: uid(), key: F.pConvex, label: "Sonda convex", type: "boolean", group: "Transdutores", order: 9 },
  { id: uid(), key: F.pLinear, label: "Sonda linear", type: "boolean", group: "Transdutores", order: 10 },
  { id: uid(), key: F.pEndo, label: "Sonda endocavitária", type: "boolean", group: "Transdutores", order: 11 },
  { id: uid(), key: F.pTEE, label: "Sonda TEE (transesofágica)", type: "boolean", group: "Transdutores", order: 12 },
  { id: uid(), key: F.pMatrix, label: "Sonda matricial 4D", type: "boolean", group: "Transdutores", order: 13 },
  { id: uid(), key: F.pIntra, label: "Sonda intraoperatória", type: "boolean", group: "Transdutores", order: 14 },
  { id: uid(), key: F.pMicro, label: "Sonda micro-convexa", type: "boolean", group: "Transdutores", order: 15 },
  { id: uid(), key: F.probesTotal, label: "Total de sondas compatíveis", type: "number", group: "Transdutores", order: 16 },
  // Aplicações Clínicas
  { id: uid(), key: F.cardio, label: "Cardiologia avançada", type: "boolean", group: "Aplicações Clínicas", highlight: true, order: 17 },
  { id: uid(), key: F.elasto, label: "Elastografia", type: "boolean", group: "Aplicações Clínicas", order: 18 },
  { id: uid(), key: F.ceus, label: "Contraste (CEUS)", type: "boolean", group: "Aplicações Clínicas", order: 19 },
  { id: uid(), key: F.ai, label: "IA assistida / Auto-medição", type: "boolean", group: "Aplicações Clínicas", highlight: true, order: 20 },
  { id: uid(), key: F.obBio, label: "Biometria obstétrica", type: "boolean", group: "Aplicações Clínicas", order: 21 },
  { id: uid(), key: F.colorDoppler, label: "Doppler colorido", type: "boolean", group: "Aplicações Clínicas", order: 22 },
  { id: uid(), key: F.pocus, label: "POCUS / Urgência-Emergência", type: "boolean", group: "Aplicações Clínicas", order: 23 },
  { id: uid(), key: F.vol3d4d, label: "3D/4D em tempo real", type: "boolean", group: "Aplicações Clínicas", order: 24 },
  { id: uid(), key: F.strain, label: "Strain rate / Speckle tracking", type: "boolean", group: "Aplicações Clínicas", order: 25 },
  { id: uid(), key: F.needle, label: "Needle guidance", type: "boolean", group: "Aplicações Clínicas", order: 26 },
  // Licenças
  { id: uid(), key: F.licModel, label: "Modelo de licenciamento", type: "text", group: "Licenças e Módulos", order: 27 },
  { id: uid(), key: F.licPerp, label: "Licença perpétua disponível", type: "boolean", group: "Licenças e Módulos", order: 28 },
  { id: uid(), key: F.swUpdate, label: "Atualização de software inclusa", type: "boolean", group: "Licenças e Módulos", order: 29 },
  { id: uid(), key: F.dicom, label: "DICOM incluso", type: "boolean", group: "Licenças e Módulos", order: 30 },
  { id: uid(), key: F.hisris, label: "Conectividade HIS/RIS", type: "boolean", group: "Licenças e Módulos", order: 31 },
  { id: uid(), key: F.autoPdf, label: "Relatório automático PDF", type: "boolean", group: "Licenças e Módulos", order: 32 },
  { id: uid(), key: F.training, label: "Módulo de ensino/treinamento", type: "boolean", group: "Licenças e Módulos", order: 33 },
  // Suporte
  { id: uid(), key: F.warranty, label: "Garantia de fábrica", type: "number", unit: "anos", group: "Suporte e Garantia", order: 34 },
  { id: uid(), key: F.support247, label: "Suporte técnico 24/7", type: "boolean", group: "Suporte e Garantia", order: 35 },
  { id: uid(), key: F.trainIncl, label: "Treinamento incluso", type: "boolean", group: "Suporte e Garantia", order: 36 },
  { id: uid(), key: F.responseTime, label: "Tempo médio de atendimento", type: "number", unit: "h", group: "Suporte e Garantia", order: 37 },
  { id: uid(), key: F.loaner, label: "Empréstimo de equipamento", type: "boolean", group: "Suporte e Garantia", order: 38 },
  { id: uid(), key: F.localStock, label: "Peças em estoque local", type: "boolean", group: "Suporte e Garantia", order: 39 },
  // Conectividade
  { id: uid(), key: F.wifi, label: "Wi-Fi integrado", type: "boolean", group: "Conectividade", order: 40 },
  { id: uid(), key: F.bluetooth, label: "Bluetooth", type: "boolean", group: "Conectividade", order: 41 },
  { id: uid(), key: F.usbc, label: "USB-C / USB 3.0", type: "boolean", group: "Conectividade", order: 42 },
  { id: uid(), key: F.cloud, label: "Exportação para nuvem", type: "boolean", group: "Conectividade", order: 43 },
  { id: uid(), key: F.telemed, label: "Telemedicina / teleconsulta", type: "boolean", group: "Conectividade", order: 44 },
];

const seedCategories: Category[] = [
  { id: uid(), name: "Cardiologia", icon: "HeartPulse", description: "Exames cardíacos avançados", color: "10", order: 0 },
  { id: uid(), name: "Ginecologia", icon: "Venus", description: "Saúde da mulher", color: "330", order: 1 },
  { id: uid(), name: "Obstetrícia", icon: "Baby", description: "Pré-natal e fetal", color: "300", order: 2 },
  { id: uid(), name: "Radiologia", icon: "ScanLine", description: "Geral / abdômen / partes moles", color: "200", order: 3 },
  { id: uid(), name: "Vascular", icon: "Activity", description: "Doppler arterial e venoso", color: "150", order: 4 },
  { id: uid(), name: "POCUS", icon: "Stethoscope", description: "Point-of-care / UTI / emergência", color: "60", order: 5 },
  { id: uid(), name: "IA Clínica", icon: "Sparkles", description: "Auto-medição assistida por IA", color: "260", order: 6 },
];

const seedDiffs: Differential[] = [
  { id: uid(), label: "Crystal Architecture™", icon: "Gem", order: 0 },
  { id: uid(), label: "S-Vue™ Transducers", icon: "Radio", order: 1 },
  { id: uid(), label: "BiometryAssist™ (IA)", icon: "Wand2", order: 2 },
  { id: uid(), label: "HeartAssist™", icon: "HeartPulse", order: 3 },
  { id: uid(), label: "5D Heart Color™", icon: "Layers", order: 4 },
  { id: uid(), label: "Portátil com bateria", icon: "BatteryCharging", order: 5 },
  { id: uid(), label: "Workflow rápido", icon: "Zap", order: 6 },
  { id: uid(), label: "Conectividade DICOM", icon: "Wifi", order: 7 },
  { id: uid(), label: "Licença perpétua", icon: "ShieldCheck", order: 8 },
];

const seedBrands: Brand[] = [
  { id: uid(), name: "Samsung Medison", isOwn: true, color: "245", order: 0 },
  { id: uid(), name: "GE Healthcare", color: "200", order: 1 },
  { id: uid(), name: "Philips", color: "210", order: 2 },
  { id: uid(), name: "Siemens Healthineers", color: "180", order: 3 },
];

const seedEquipments = (
  fields: SpecField[],
  cats: Category[],
  diffs: Differential[],
  brands: Brand[]
): Equipment[] => {
  const f = (k: string) => fields.find((x) => x.key === k)!.key;
  const c = (n: string) => cats.find((x) => x.name === n)!.id;
  const d = (n: string) => diffs.find((x) => x.label === n)!.id;
  const b = (n: string) => brands.find((x) => x.name === n)!.id;
  return [
    {
      id: uid(),
      name: "Apex Pro X9",
      shortName: "X9",
      brandId: b("Minha Empresa"),
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
      order: 0,
      createdAt: Date.now(),
    },
    {
      id: uid(),
      name: "Vista M5",
      shortName: "M5",
      brandId: b("Minha Empresa"),
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
      order: 1,
      createdAt: Date.now(),
    },
    {
      id: uid(),
      name: "Go Lite P2",
      shortName: "P2",
      brandId: b("Minha Empresa"),
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
      order: 2,
      createdAt: Date.now(),
    },
    {
      id: uid(),
      name: "Rivalix R10",
      shortName: "R10",
      brandId: b("Concorrente A"),
      tier: "premium",
      tagline: "Top de linha do concorrente A",
      description: "Equipamento premium do concorrente, foco em cardiologia.",
      categories: [c("Cardiologia"), c("Vascular"), c("IA")],
      bestFor: [c("Cardiologia")],
      differentials: [d("Imagem premium 4K"), d("Conectividade DICOM")],
      specs: {
        [f("transducers")]: 4,
        [f("monitor")]: "21.5",
        [f("touchscreen")]: true,
        [f("battery")]: false,
        [f("aiEngine")]: "Avançado",
        [f("elastography")]: true,
        [f("contrastImaging")]: true,
        [f("weight")]: 105,
      },
      highlights: ["Cardio Suite"],
      releaseYear: 2023,
      order: 3,
      createdAt: Date.now(),
    },
    {
      id: uid(),
      name: "Compete C7",
      shortName: "C7",
      brandId: b("Concorrente B"),
      tier: "medium",
      tagline: "Linha intermediária do concorrente B",
      description: "Foco em obstetrícia e MSK.",
      categories: [c("Obstetrícia"), c("MSK")],
      bestFor: [c("MSK")],
      differentials: [d("Ergonomia premium")],
      specs: {
        [f("transducers")]: 3,
        [f("monitor")]: "19",
        [f("touchscreen")]: false,
        [f("battery")]: false,
        [f("aiEngine")]: "Básico",
        [f("elastography")]: false,
        [f("contrastImaging")]: false,
        [f("weight")]: 80,
      },
      highlights: [],
      releaseYear: 2022,
      order: 4,
      createdAt: Date.now(),
    },
  ];
};

const initialFields = seedFields;
const initialCats = seedCategories;
const initialDiffs = seedDiffs;
const initialBrands = seedBrands;
const initialEquips = seedEquipments(initialFields, initialCats, initialDiffs, initialBrands);

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
      brands: initialBrands,
      savedComparisons: [],

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
      reorderFields: (ids) => set((s) => ({
        fields: ids.map((id, i) => ({ ...s.fields.find((f) => f.id === id)!, order: i })).filter(Boolean),
      })),

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
      reorderCategories: (ids) => set((s) => ({
        categories: ids.map((id, i) => ({ ...s.categories.find((c) => c.id === id)!, order: i })),
      })),

      addDifferential: (d) => set((s) => ({ differentials: [...s.differentials, { ...d, id: uid() }] })),
      updateDifferential: (id, patch) => set((s) => ({ differentials: s.differentials.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeDifferential: (id) => set((s) => ({
        differentials: s.differentials.filter((x) => x.id !== id),
        equipments: s.equipments.map((e) => ({ ...e, differentials: e.differentials.filter((d) => d !== id) })),
      })),
      reorderDifferentials: (ids) => set((s) => ({
        differentials: ids.map((id, i) => ({ ...s.differentials.find((d) => d.id === id)!, order: i })),
      })),

      addBrand: (b) => {
        const id = uid();
        set((s) => ({ brands: [...s.brands, { ...b, id, order: s.brands.length }] }));
        return id;
      },
      updateBrand: (id, patch) => set((s) => ({ brands: s.brands.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeBrand: (id) => set((s) => ({
        brands: s.brands.filter((x) => x.id !== id),
        equipments: s.equipments.map((e) => (e.brandId === id ? { ...e, brandId: undefined } : e)),
      })),
      setOwnBrand: (id) => set((s) => ({
        brands: s.brands.map((b) => ({ ...b, isOwn: b.id === id })),
      })),

      addEquipment: (e) => set((s) => ({ equipments: [...s.equipments, { ...e, id: uid(), createdAt: Date.now() }] })),
      updateEquipment: (id, patch) => set((s) => ({ equipments: s.equipments.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeEquipment: (id) => set((s) => ({ equipments: s.equipments.filter((x) => x.id !== id) })),
      reorderEquipments: (ids) => set((s) => ({
        equipments: ids.map((id, i) => ({ ...s.equipments.find((e) => e.id === id)!, order: i })),
      })),
      duplicateEquipment: (id) => set((s) => {
        const e = s.equipments.find((x) => x.id === id);
        if (!e) return s;
        return { equipments: [...s.equipments, { ...e, id: uid(), name: `${e.name} (cópia)`, createdAt: Date.now() }] };
      }),

      addSavedComparison: (c) => {
        const id = uid();
        set((s) => ({ savedComparisons: [...s.savedComparisons, { ...c, id, createdAt: Date.now() }] }));
        return id;
      },
      removeSavedComparison: (id) => set((s) => ({ savedComparisons: s.savedComparisons.filter((x) => x.id !== id) })),

      resetSeed: () => set({
        fields: initialFields,
        categories: initialCats,
        differentials: initialDiffs,
        equipments: initialEquips,
        brands: initialBrands,
        savedComparisons: [],
      }),
    }),
    { name: "equip-catalog-v2" }
  )
);

export const tierMeta: Record<Tier, { label: string; gradient: string; ring: string; text: string }> = {
  premium: { label: "Premium", gradient: "tier-premium-bg", ring: "ring-tier-premium/40", text: "text-tier-premium" },
  medium:  { label: "Medium",  gradient: "tier-medium-bg",  ring: "ring-tier-medium/40",  text: "text-tier-medium"  },
  low:     { label: "Essential", gradient: "tier-low-bg",   ring: "ring-tier-low/40",     text: "text-tier-low"     },
};
