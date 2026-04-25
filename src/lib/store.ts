import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Tier = "super-premium" | "premium" | "high" | "mid" | "low";
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
  websiteUrl?: string;
  description?: string;
  country?: string;
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

  addEquipment: (e: Omit<Equipment, "id" | "createdAt">) => string;
  updateEquipment: (id: string, patch: Partial<Equipment>) => void;
  removeEquipment: (id: string) => void;
  reorderEquipments: (ids: string[]) => void;
  duplicateEquipment: (id: string) => string | undefined;

  importCatalog: (data: Partial<Pick<AppState, "fields" | "categories" | "differentials" | "brands" | "equipments">>, mode: "merge" | "replace") => void;

  addSavedComparison: (c: Omit<SavedComparison, "id" | "createdAt">) => string;
  removeSavedComparison: (id: string) => void;

  resetSeed: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

// Samsung Healthcare ultrasound seed data
const F = {
  // Hardware
  price: "price", channels: "channels", os: "os", wifi: "wifi",
  monitorType: "monitorType", monitorSize: "monitorSize", touch: "touch",
  storage: "storage", activePorts: "activePorts", usbPorts: "usbPorts",
  weight: "weight", dimensions: "dimensions", heightAdjust: "heightAdjust",
  artArm: "artArm", gelWarmer: "gelWarmer", pedal: "pedal",
  keyboard: "keyboard", battery: "battery", probeHolders: "probeHolders",
  // Radiologia
  radAutoMeas: "radAutoMeas", radAI: "radAI", swConvex: "swConvex", swLinear: "swLinear",
  ceus: "ceus", singleCrystal: "singleCrystal", maxFreq: "maxFreq",
  // ObGyn
  obAutoMeas: "obAutoMeas", vol3d4d: "vol3d4d", fovEndo: "fovEndo",
  tumorEndo: "tumorEndo", tumorOV: "tumorOV",
  // Cardiologia
  strainLV: "strainLV", strainLARV: "strainLARV", tee3d: "tee3d", tte3d: "tte3d",
  echoStress: "echoStress", efAuto: "efAuto",
  // Urologia
  bladderAuto: "bladderAuto", prostateFusion: "prostateFusion",
  // Transdutores
  pConvex: "pConvex", pMicro: "pMicro", pConvexVol: "pConvexVol",
  pLinear: "pLinear", pTV: "pTV", pBiplanar: "pBiplanar", pHockey: "pHockey",
  pEndoVol: "pEndoVol", pSecAdult: "pSecAdult", pSecPed: "pSecPed", pSecNeo: "pSecNeo",
  pTEEAdult: "pTEEAdult", pTEEPed: "pTEEPed",
} as const;

const seedFields: SpecField[] = [
  // Hardware
  { id: uid(), key: F.price, label: "Média de preço", type: "text", unit: "BRL", group: "Hardware", highlight: true, order: 0 },
  { id: uid(), key: F.channels, label: "Canais", type: "number", group: "Hardware", highlight: true, order: 1 },
  { id: uid(), key: F.os, label: "Sistema operacional", type: "text", group: "Hardware", order: 2 },
  { id: uid(), key: F.wifi, label: "Wi-Fi", type: "boolean", group: "Hardware", order: 3 },
  { id: uid(), key: F.monitorType, label: "Tipo de monitor", type: "text", group: "Hardware", order: 4 },
  { id: uid(), key: F.monitorSize, label: "Tamanho do monitor", type: "number", unit: "pol", group: "Hardware", order: 5 },
  { id: uid(), key: F.touch, label: "Tela touch", type: "boolean", group: "Hardware", order: 6 },
  { id: uid(), key: F.storage, label: "Armazenamento", type: "text", group: "Hardware", order: 7 },
  { id: uid(), key: F.activePorts, label: "Portas ativas", type: "number", group: "Hardware", order: 8 },
  { id: uid(), key: F.usbPorts, label: "Portas USB", type: "number", group: "Hardware", order: 9 },
  { id: uid(), key: F.weight, label: "Peso", type: "number", unit: "kg", group: "Hardware", order: 10 },
  { id: uid(), key: F.dimensions, label: "Dimensões (AxLxP)", type: "text", group: "Hardware", order: 11 },
  { id: uid(), key: F.heightAdjust, label: "Ajuste de altura", type: "boolean", group: "Hardware", order: 12 },
  { id: uid(), key: F.artArm, label: "Braço articulado", type: "boolean", group: "Hardware", order: 13 },
  { id: uid(), key: F.gelWarmer, label: "Aquecedor de gel", type: "boolean", group: "Hardware", order: 14 },
  { id: uid(), key: F.pedal, label: "Possibilidade de pedal", type: "boolean", group: "Hardware", order: 15 },
  { id: uid(), key: F.keyboard, label: "Tipo de teclado", type: "select", options: ["Físico", "Virtual", "Híbrido"], group: "Hardware", order: 16 },
  { id: uid(), key: F.battery, label: "Bateria", type: "boolean", group: "Hardware", order: 17 },
  { id: uid(), key: F.probeHolders, label: "Suporte para transdutores", type: "number", group: "Hardware", order: 18 },
  // Radiologia
  { id: uid(), key: F.radAutoMeas, label: "Medidas automáticas", type: "boolean", group: "Radiologia", order: 19 },
  { id: uid(), key: F.radAI, label: "Recursos de IA", type: "boolean", group: "Radiologia", highlight: true, order: 20 },
  { id: uid(), key: F.swConvex, label: "Share Wave no convexo", type: "boolean", group: "Radiologia", order: 21 },
  { id: uid(), key: F.swLinear, label: "Share Wave no linear", type: "boolean", group: "Radiologia", order: 22 },
  { id: uid(), key: F.ceus, label: "Contraste por microbolhas", type: "boolean", group: "Radiologia", order: 23 },
  { id: uid(), key: F.singleCrystal, label: "Single crystal", type: "boolean", group: "Radiologia", order: 24 },
  { id: uid(), key: F.maxFreq, label: "Maior frequência", type: "number", unit: "MHz", group: "Radiologia", order: 25 },
  // ObGyn
  { id: uid(), key: F.obAutoMeas, label: "Medidas OB automáticas", type: "boolean", group: "ObGyn", order: 26 },
  { id: uid(), key: F.vol3d4d, label: "3D e 4D", type: "boolean", group: "ObGyn", order: 27 },
  { id: uid(), key: F.fovEndo, label: "FOV endocavitário volumétrico", type: "boolean", group: "ObGyn", order: 28 },
  { id: uid(), key: F.tumorEndo, label: "Detecção de tumores Endo", type: "boolean", group: "ObGyn", order: 29 },
  { id: uid(), key: F.tumorOV, label: "Detecção de tumores OV", type: "boolean", group: "ObGyn", order: 30 },
  // Cardiologia
  { id: uid(), key: F.strainLV, label: "Strain do VE", type: "boolean", group: "Cardiologia", order: 31 },
  { id: uid(), key: F.strainLARV, label: "Strain LA/RV", type: "boolean", group: "Cardiologia", order: 32 },
  { id: uid(), key: F.tee3d, label: "3D transesofágico", type: "boolean", group: "Cardiologia", order: 33 },
  { id: uid(), key: F.tte3d, label: "3D transtorácico", type: "boolean", group: "Cardiologia", order: 34 },
  { id: uid(), key: F.echoStress, label: "Eco stress", type: "boolean", group: "Cardiologia", order: 35 },
  { id: uid(), key: F.efAuto, label: "Fração de ejeção automática", type: "boolean", group: "Cardiologia", order: 36 },
  // Urologia
  { id: uid(), key: F.bladderAuto, label: "Medida automática da bexiga", type: "boolean", group: "Urologia", order: 37 },
  { id: uid(), key: F.prostateFusion, label: "Fusão de próstata", type: "boolean", group: "Urologia", order: 38 },
  // Transdutores
  { id: uid(), key: F.pConvex, label: "Convexos", type: "boolean", group: "Transdutores", order: 39 },
  { id: uid(), key: F.pMicro, label: "Microconvexos", type: "boolean", group: "Transdutores", order: 40 },
  { id: uid(), key: F.pConvexVol, label: "Convexo volumétrico", type: "boolean", group: "Transdutores", order: 41 },
  { id: uid(), key: F.pLinear, label: "Lineares", type: "boolean", group: "Transdutores", order: 42 },
  { id: uid(), key: F.pTV, label: "Transvaginal", type: "boolean", group: "Transdutores", order: 43 },
  { id: uid(), key: F.pBiplanar, label: "Biplanares", type: "boolean", group: "Transdutores", order: 44 },
  { id: uid(), key: F.pHockey, label: "Hockey stick", type: "boolean", group: "Transdutores", order: 45 },
  { id: uid(), key: F.pEndoVol, label: "Endocavitário volumétrico", type: "boolean", group: "Transdutores", order: 46 },
  { id: uid(), key: F.pSecAdult, label: "Setorial adulto", type: "boolean", group: "Transdutores", order: 47 },
  { id: uid(), key: F.pSecPed, label: "Setorial pediátrico", type: "boolean", group: "Transdutores", order: 48 },
  { id: uid(), key: F.pSecNeo, label: "Setorial neonatal", type: "boolean", group: "Transdutores", order: 49 },
  { id: uid(), key: F.pTEEAdult, label: "Transesofágico adulto", type: "boolean", group: "Transdutores", order: 50 },
  { id: uid(), key: F.pTEEPed, label: "Transesofágico pediátrico", type: "boolean", group: "Transdutores", order: 51 },
];

const seedCategories: Category[] = [
  // Cores extraídas das faixas da planilha original
  { id: uid(), name: "Radiologia",  icon: "ScanLine",    description: "Geral / abdômen / partes moles", color: "85",  order: 0 }, // amarelo claro
  { id: uid(), name: "ObGyn",       icon: "Baby",        description: "Obstetrícia e ginecologia",       color: "30",  order: 1 }, // laranja claro
  { id: uid(), name: "Cardiologia", icon: "HeartPulse",  description: "Eco e cardiologia avançada",      color: "20",  order: 2 }, // marrom/laranja
  { id: uid(), name: "Urologia",    icon: "Droplets",    description: "Próstata, bexiga e fusão",         color: "95",  order: 3 }, // amarelo
  { id: uid(), name: "Vascular",    icon: "Activity",    description: "Doppler arterial e venoso",       color: "150", order: 4 }, // verde
  { id: uid(), name: "POCUS",       icon: "Stethoscope", description: "Point-of-care / UTI / emergência", color: "60",  order: 5 },
  { id: uid(), name: "IA Clínica",  icon: "Sparkles",    description: "Auto-medição assistida por IA",   color: "260", order: 6 },
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
  { id: uid(), name: "GE Healthcare",          color: "200", order: 1 },
  { id: uid(), name: "Philips",                color: "230", order: 2 },
  { id: uid(), name: "Canon Medical",          color: "30",  order: 3 },
  { id: uid(), name: "Siemens Healthineers",   color: "180", order: 4 },
  { id: uid(), name: "Mindray",                color: "10",  order: 5 },
  { id: uid(), name: "Fujifilm (SonoSite)",    color: "120", order: 6 },
  { id: uid(), name: "Vinno",                  color: "60",  order: 7 },
];

const seedEquipments = (
  _fields: SpecField[],
  cats: Category[],
  diffs: Differential[],
  brands: Brand[]
): Equipment[] => {
  const c = (n: string) => cats.find((x) => x.name === n)!.id;
  const d = (n: string) => diffs.find((x) => x.label === n)!.id;
  const b = (n: string) => brands.find((x) => x.name === n)!.id;
  const now = Date.now();
  const empty = (
    name: string, brand: string, tier: Tier, cats: string[], order: number
  ): Equipment => ({
    id: uid(), name, shortName: name, brandId: b(brand), tier,
    tagline: "", description: "",
    categories: cats, bestFor: [], differentials: [], specs: {}, highlights: [],
    order, createdAt: now,
  });
  return [
    // ─────────────────────────────────────────────────────────
    // SAMSUNG MEDISON — linha completa real (own brand)
    // ─────────────────────────────────────────────────────────

    // ── Super Premium ──
    {
      id: uid(), name: "RS85 Prestige", shortName: "RS85", brandId: b("Samsung Medison"), tier: "super-premium",
      tagline: "Flagship Samsung — Crystal Architecture™ + IA completa",
      description: "Plataforma Super Premium da Samsung Medison. Crystal Architecture, S-Vue Transducers e IA assistida em todas as especialidades. Para grandes hospitais de referência.",
      categories: [c("Cardiologia"), c("ObGyn"), c("Radiologia"), c("Vascular"), c("Urologia"), c("IA Clínica")],
      bestFor: [c("Cardiologia"), c("Radiologia"), c("IA Clínica")],
      differentials: [d("Crystal Architecture™"), d("S-Vue™ Transducers"), d("BiometryAssist™ (IA)"), d("HeartAssist™"), d("5D Heart Color™"), d("Licença perpétua")],
      specs: {
        price: "R$ 720k–950k", channels: 256, os: "Linux Embedded", wifi: true,
        monitorType: "LED IPS 4K", monitorSize: 23.8, touch: true, storage: "2 TB SSD",
        activePorts: 4, usbPorts: 6, weight: 130, dimensions: "151 x 60 x 95 cm",
        heightAdjust: true, artArm: true, gelWarmer: true, pedal: true, keyboard: "Híbrido", battery: false, probeHolders: 5,
        radAutoMeas: true, radAI: true, swConvex: true, swLinear: true, ceus: true, singleCrystal: true, maxFreq: 22,
        obAutoMeas: true, vol3d4d: true, fovEndo: true, tumorEndo: true, tumorOV: true,
        strainLV: true, strainLARV: true, tee3d: true, tte3d: true, echoStress: true, efAuto: true,
        bladderAuto: true, prostateFusion: true,
        pConvex: true, pMicro: true, pConvexVol: true, pLinear: true, pTV: true, pBiplanar: true, pHockey: true,
        pEndoVol: true, pSecAdult: true, pSecPed: true, pSecNeo: true, pTEEAdult: true, pTEEPed: true,
      },
      highlights: ["Crystal Architecture™", "S-Vue 256e", "IA Clínica"],
      releaseYear: 2024, order: 0, createdAt: now,
    },
    {
      id: uid(), name: "HERA W10 Elite", shortName: "W10 Elite", brandId: b("Samsung Medison"), tier: "super-premium",
      tagline: "Topo absoluto em ginecologia, obstetrícia e medicina fetal 5D",
      description: "Plataforma Super Premium dedicada à saúde da mulher. ScanNav™, 5D NT/CNS, BiometryAssist™ e suíte fetal completa.",
      categories: [c("ObGyn"), c("IA Clínica"), c("Radiologia")],
      bestFor: [c("ObGyn"), c("IA Clínica")],
      differentials: [d("Crystal Architecture™"), d("BiometryAssist™ (IA)"), d("S-Vue™ Transducers"), d("Workflow rápido"), d("Licença perpétua")],
      specs: {
        price: "R$ 680k–820k", channels: 192, os: "Linux Embedded", wifi: true,
        monitorType: "LED IPS 4K", monitorSize: 23.8, touch: true, storage: "2 TB SSD",
        activePorts: 4, usbPorts: 6, weight: 132, dimensions: "150 x 60 x 90 cm",
        heightAdjust: true, artArm: true, gelWarmer: true, pedal: true, keyboard: "Híbrido", battery: false, probeHolders: 5,
        radAutoMeas: true, radAI: true, swConvex: true, swLinear: true, ceus: true, singleCrystal: true, maxFreq: 22,
        obAutoMeas: true, vol3d4d: true, fovEndo: true, tumorEndo: true, tumorOV: true,
        strainLV: false, strainLARV: false, tee3d: false, tte3d: true, echoStress: false, efAuto: true,
        bladderAuto: true, prostateFusion: false,
        pConvex: true, pMicro: true, pConvexVol: true, pLinear: true, pTV: true, pBiplanar: true, pHockey: true,
        pEndoVol: true, pSecAdult: false, pSecPed: false, pSecNeo: false, pTEEAdult: false, pTEEPed: false,
      },
      highlights: ["5D NT/CNS", "BiometryAssist™", "ScanNav™ Assist"],
      releaseYear: 2024, order: 1, createdAt: now,
    },

    // ── Premium ──
    {
      id: uid(), name: "HS50A", shortName: "HS50A", brandId: b("Samsung Medison"), tier: "premium",
      tagline: "Premium versátil — Crystal Signature+ 3ª geração",
      description: "Plataforma premium da linha Samsung. Excelente custo-benefício para hospitais de grande porte com IA assistida em todas as especialidades.",
      categories: [c("Cardiologia"), c("ObGyn"), c("Radiologia"), c("Vascular"), c("IA Clínica")],
      bestFor: [c("Cardiologia"), c("Radiologia")],
      differentials: [d("Crystal Architecture™"), d("S-Vue™ Transducers"), d("BiometryAssist™ (IA)"), d("HeartAssist™"), d("Licença perpétua")],
      specs: {
        price: "R$ 480k–620k", channels: 135, os: "Linux Embedded", wifi: true,
        monitorType: "LED IPS Full HD", monitorSize: 21.5, touch: true, storage: "1 TB SSD",
        activePorts: 4, usbPorts: 6, weight: 65, dimensions: "146 x 56 x 80 cm",
        heightAdjust: true, artArm: true, gelWarmer: true, pedal: true, keyboard: "Híbrido", battery: false, probeHolders: 5,
        radAutoMeas: true, radAI: true, swConvex: true, swLinear: true, ceus: true, singleCrystal: true, maxFreq: 18,
        obAutoMeas: true, vol3d4d: true, fovEndo: true, tumorEndo: true, tumorOV: true,
        strainLV: true, strainLARV: true, tee3d: true, tte3d: true, echoStress: true, efAuto: true,
        bladderAuto: true, prostateFusion: true,
        pConvex: true, pMicro: true, pConvexVol: true, pLinear: true, pTV: true, pBiplanar: true, pHockey: true,
        pEndoVol: true, pSecAdult: true, pSecPed: true, pSecNeo: true, pTEEAdult: true, pTEEPed: true,
      },
      highlights: ["Crystal Signature+", "Auto-medição IA", "5D Heart Color"],
      releaseYear: 2024, order: 2, createdAt: now,
    },
    {
      id: uid(), name: "HERA W10", shortName: "W10", brandId: b("Samsung Medison"), tier: "premium",
      tagline: "Premium em ginecologia e obstetrícia 5D",
      description: "Plataforma premium dedicada à saúde da mulher com tecnologia 5D NT, IA BiometryAssist e workflow otimizado.",
      categories: [c("ObGyn"), c("IA Clínica"), c("Radiologia")],
      bestFor: [c("ObGyn")],
      differentials: [d("Crystal Architecture™"), d("BiometryAssist™ (IA)"), d("S-Vue™ Transducers"), d("Workflow rápido")],
      specs: {
        price: "R$ 580k–720k", channels: 192, os: "Linux Embedded", wifi: true,
        monitorType: "LED IPS Full HD", monitorSize: 23.8, touch: true, storage: "1 TB SSD",
        activePorts: 4, usbPorts: 6, weight: 130, dimensions: "150 x 60 x 90 cm",
        heightAdjust: true, artArm: true, gelWarmer: true, pedal: true, keyboard: "Híbrido", battery: false, probeHolders: 5,
        radAutoMeas: true, radAI: true, swConvex: true, swLinear: true, ceus: true, singleCrystal: true, maxFreq: 22,
        obAutoMeas: true, vol3d4d: true, fovEndo: true, tumorEndo: true, tumorOV: true,
        strainLV: false, strainLARV: false, tee3d: false, tte3d: true, echoStress: false, efAuto: true,
        bladderAuto: true, prostateFusion: false,
        pConvex: true, pMicro: false, pConvexVol: true, pLinear: true, pTV: true, pBiplanar: true, pHockey: true,
        pEndoVol: true, pSecAdult: false, pSecPed: false, pSecNeo: false, pTEEAdult: false, pTEEPed: false,
      },
      highlights: ["5D NT", "BiometryAssist™", "ScanNav™"],
      releaseYear: 2024, order: 3, createdAt: now,
    },

    // ── High ──
    {
      id: uid(), name: "V8", shortName: "V8", brandId: b("Samsung Medison"), tier: "high",
      tagline: "High-end versátil — Crystal Architecture e MV-Flow™",
      description: "High-end da Samsung com Crystal Architecture e S-Vue. Multiuso para clínicas e hospitais de médio porte.",
      categories: [c("Radiologia"), c("ObGyn"), c("Cardiologia"), c("Vascular"), c("IA Clínica")],
      bestFor: [c("Radiologia"), c("Vascular")],
      differentials: [d("Crystal Architecture™"), d("S-Vue™ Transducers"), d("BiometryAssist™ (IA)"), d("Conectividade DICOM"), d("Licença perpétua")],
      specs: {
        price: "R$ 380k–460k", channels: 128, os: "Linux Embedded", wifi: true,
        monitorType: "LED IPS Full HD", monitorSize: 23.8, touch: true, storage: "1 TB SSD",
        activePorts: 4, usbPorts: 6, weight: 120, dimensions: "150 x 60 x 88 cm",
        heightAdjust: true, artArm: true, gelWarmer: true, pedal: true, keyboard: "Físico", battery: false, probeHolders: 5,
        radAutoMeas: true, radAI: true, swConvex: true, swLinear: true, ceus: true, singleCrystal: false, maxFreq: 18,
        obAutoMeas: true, vol3d4d: true, fovEndo: true, tumorEndo: false, tumorOV: false,
        strainLV: true, strainLARV: false, tee3d: false, tte3d: true, echoStress: true, efAuto: true,
        bladderAuto: true, prostateFusion: false,
        pConvex: true, pMicro: true, pConvexVol: true, pLinear: true, pTV: true, pBiplanar: false, pHockey: true,
        pEndoVol: true, pSecAdult: true, pSecPed: true, pSecNeo: true, pTEEAdult: false, pTEEPed: false,
      },
      highlights: ["Crystal Architecture", "S-Vue", "MV-Flow™"],
      releaseYear: 2023, order: 4, createdAt: now,
    },
    {
      id: uid(), name: "V7", shortName: "V7", brandId: b("Samsung Medison"), tier: "high",
      tagline: "High-end OBGYN com NerveTrack™ e ElastoScan",
      description: "Plataforma High-end com forte apelo em obstetrícia e ginecologia. Boa relação custo-benefício.",
      categories: [c("ObGyn"), c("Radiologia"), c("Vascular")],
      bestFor: [c("ObGyn")],
      differentials: [d("S-Vue™ Transducers"), d("BiometryAssist™ (IA)"), d("Conectividade DICOM"), d("Licença perpétua")],
      specs: {
        price: "R$ 300k–380k", channels: 128, os: "Linux Embedded", wifi: true,
        monitorType: "LED IPS Full HD", monitorSize: 21.5, touch: true, storage: "1 TB SSD",
        activePorts: 4, usbPorts: 4, weight: 110, dimensions: "148 x 58 x 85 cm",
        heightAdjust: true, artArm: true, gelWarmer: true, pedal: true, keyboard: "Físico", battery: false, probeHolders: 4,
        radAutoMeas: true, radAI: true, swConvex: true, swLinear: false, ceus: false, singleCrystal: false, maxFreq: 16,
        obAutoMeas: true, vol3d4d: true, fovEndo: false, tumorEndo: false, tumorOV: false,
        strainLV: true, strainLARV: false, tee3d: false, tte3d: false, echoStress: false, efAuto: true,
        bladderAuto: true, prostateFusion: false,
        pConvex: true, pMicro: true, pConvexVol: true, pLinear: true, pTV: true, pBiplanar: false, pHockey: true,
        pEndoVol: true, pSecAdult: true, pSecPed: false, pSecNeo: false, pTEEAdult: false, pTEEPed: false,
      },
      highlights: ["NerveTrack™", "ElastoScan™", "S-Detect™"],
      releaseYear: 2023, order: 5, createdAt: now,
    },

    // ── Mid ──
    {
      id: uid(), name: "HS40", shortName: "HS40", brandId: b("Samsung Medison"), tier: "mid",
      tagline: "Mid-range robusto para clínicas multiprofissionais",
      description: "Mid-range Samsung com plataforma compartilhada da linha premium. Excelente para clínicas e hospitais de médio porte.",
      categories: [c("Radiologia"), c("ObGyn"), c("Vascular")],
      bestFor: [c("Radiologia")],
      differentials: [d("S-Vue™ Transducers"), d("Conectividade DICOM"), d("Licença perpétua")],
      specs: {
        price: "R$ 220k–290k", channels: 96, os: "Linux Embedded", wifi: true,
        monitorType: "LED Full HD", monitorSize: 21.5, touch: true, storage: "500 GB SSD",
        activePorts: 4, usbPorts: 4, weight: 95, dimensions: "146 x 56 x 82 cm",
        heightAdjust: true, artArm: true, gelWarmer: false, pedal: true, keyboard: "Físico", battery: false, probeHolders: 4,
        radAutoMeas: true, radAI: false, swConvex: false, swLinear: false, ceus: false, singleCrystal: false, maxFreq: 14,
        obAutoMeas: true, vol3d4d: true, fovEndo: false, tumorEndo: false, tumorOV: false,
        strainLV: false, strainLARV: false, tee3d: false, tte3d: false, echoStress: false, efAuto: true,
        bladderAuto: true, prostateFusion: false,
        pConvex: true, pMicro: true, pConvexVol: true, pLinear: true, pTV: true, pBiplanar: false, pHockey: false,
        pEndoVol: false, pSecAdult: true, pSecPed: true, pSecNeo: false, pTEEAdult: false, pTEEPed: false,
      },
      highlights: ["S-Vue", "Workflow Samsung"],
      releaseYear: 2022, order: 6, createdAt: now,
    },
    {
      id: uid(), name: "HM70 EVO", shortName: "HM70", brandId: b("Samsung Medison"), tier: "mid",
      tagline: "Portátil com bateria — UTI, emergência e POCUS",
      description: "Compacto e leve com bateria integrada, ideal para point-of-care, ambulância, UTI e emergência. EzExam+ AI para protocolos rápidos.",
      categories: [c("POCUS"), c("Vascular"), c("Radiologia"), c("IA Clínica")],
      bestFor: [c("POCUS")],
      differentials: [d("Portátil com bateria"), d("BiometryAssist™ (IA)"), d("Workflow rápido"), d("Conectividade DICOM")],
      specs: {
        price: "R$ 180k–240k", channels: 96, os: "Windows 10 IoT", wifi: true,
        monitorType: "LED HD", monitorSize: 15, touch: true, storage: "512 GB SSD",
        activePorts: 3, usbPorts: 4, weight: 3.5, dimensions: "37 x 35 x 6 cm",
        heightAdjust: false, artArm: false, gelWarmer: false, pedal: true, keyboard: "Virtual", battery: true, probeHolders: 3,
        radAutoMeas: true, radAI: true, swConvex: false, swLinear: false, ceus: false, singleCrystal: false, maxFreq: 13,
        obAutoMeas: true, vol3d4d: false, fovEndo: false, tumorEndo: false, tumorOV: false,
        strainLV: false, strainLARV: false, tee3d: false, tte3d: false, echoStress: false, efAuto: true,
        bladderAuto: true, prostateFusion: false,
        pConvex: true, pMicro: true, pConvexVol: false, pLinear: true, pTV: true, pBiplanar: false, pHockey: true,
        pEndoVol: false, pSecAdult: true, pSecPed: true, pSecNeo: true, pTEEAdult: false, pTEEPed: false,
      },
      highlights: ["3.5 kg", "Bateria 90 min", "EzExam+ AI"],
      releaseYear: 2023, order: 7, createdAt: now,
    },

    // ── Low ──
    {
      id: uid(), name: "HS30", shortName: "HS30", brandId: b("Samsung Medison"), tier: "low",
      tagline: "Entry-level Samsung — UBM e clínicas de menor porte",
      description: "Sistema entry da Samsung com qualidade de imagem confiável e workflow simples. Ótimo para começar com a marca.",
      categories: [c("Radiologia"), c("ObGyn")],
      bestFor: [],
      differentials: [d("Conectividade DICOM"), d("Licença perpétua")],
      specs: {
        price: "R$ 110k–150k", channels: 64, os: "Linux Embedded", wifi: false,
        monitorType: "LED FHD", monitorSize: 19.5, touch: false, storage: "320 GB HDD",
        activePorts: 3, usbPorts: 3, weight: 75, dimensions: "140 x 54 x 80 cm",
        heightAdjust: true, artArm: false, gelWarmer: false, pedal: true, keyboard: "Físico", battery: false, probeHolders: 3,
        radAutoMeas: false, radAI: false, swConvex: false, swLinear: false, ceus: false, singleCrystal: false, maxFreq: 10,
        obAutoMeas: true, vol3d4d: false, fovEndo: false, tumorEndo: false, tumorOV: false,
        strainLV: false, strainLARV: false, tee3d: false, tte3d: false, echoStress: false, efAuto: false,
        bladderAuto: true, prostateFusion: false,
        pConvex: true, pMicro: false, pConvexVol: false, pLinear: true, pTV: true, pBiplanar: false, pHockey: false,
        pEndoVol: false, pSecAdult: true, pSecPed: false, pSecNeo: false, pTEEAdult: false, pTEEPed: false,
      },
      highlights: ["Entry-level", "DICOM completo"],
      releaseYear: 2021, order: 8, createdAt: now,
    },

    // ─────────────────────────────────────────────────────────
    // CONCORRENTES — estrutura vazia para o admin preencher
    // ─────────────────────────────────────────────────────────
    // GE Healthcare
    empty("Logiq E10",          "GE Healthcare", "super-premium", [c("Cardiologia"), c("Radiologia"), c("Vascular")], 100),
    empty("Vivid E95",          "GE Healthcare", "super-premium", [c("Cardiologia")], 101),
    empty("Voluson E10",        "GE Healthcare", "super-premium", [c("ObGyn")], 102),
    empty("Logiq E9",           "GE Healthcare", "premium",       [c("Radiologia"), c("Cardiologia")], 103),
    empty("Voluson E8",         "GE Healthcare", "premium",       [c("ObGyn")], 104),
    empty("Logiq Fortis",       "GE Healthcare", "high",          [c("Radiologia"), c("Cardiologia")], 105),
    empty("Versana Premier",    "GE Healthcare", "mid",           [c("Radiologia")], 106),
    empty("Versana Essential",  "GE Healthcare", "low",           [c("Radiologia")], 107),
    // Philips
    empty("EPIQ Elite",         "Philips", "super-premium", [c("Cardiologia"), c("Radiologia")], 200),
    empty("EPIQ CVx",           "Philips", "super-premium", [c("Cardiologia")], 201),
    empty("Affiniti 70",        "Philips", "high",          [c("Radiologia"), c("ObGyn")], 202),
    empty("Affiniti 50",        "Philips", "mid",           [c("Radiologia")], 203),
    empty("Affiniti 30",        "Philips", "low",           [c("Radiologia")], 204),
    // Canon Medical
    empty("Aplio i900",         "Canon Medical", "super-premium", [c("Radiologia"), c("Cardiologia")], 300),
    empty("Aplio i800",         "Canon Medical", "premium",       [c("Radiologia")], 301),
    empty("Aplio a550",         "Canon Medical", "high",          [c("Radiologia")], 302),
    empty("Aplio Flex",         "Canon Medical", "mid",           [c("Radiologia")], 303),
    empty("Xario 200",          "Canon Medical", "low",           [c("Radiologia")], 304),
    // Siemens Healthineers
    empty("Sequoia",            "Siemens Healthineers", "super-premium", [c("Radiologia"), c("Cardiologia")], 400),
    empty("Acuson Redwood",     "Siemens Healthineers", "premium",       [c("Radiologia")], 401),
    empty("Acuson Juniper",     "Siemens Healthineers", "high",          [c("Radiologia")], 402),
    empty("Acuson Maple",       "Siemens Healthineers", "low",           [c("Radiologia")], 403),
    // Mindray
    empty("Resona R9",          "Mindray", "super-premium", [c("Radiologia"), c("Cardiologia")], 500),
    empty("Resona I9",          "Mindray", "premium",       [c("Radiologia")], 501),
    empty("Nuewa R9",           "Mindray", "high",          [c("Radiologia")], 502),
    empty("Consona N7",         "Mindray", "low",           [c("Radiologia")], 503),
    // Vinno
    empty("Vinno E20",          "Vinno", "premium", [c("Radiologia")], 600),
    empty("Vinno E35",          "Vinno", "high",    [c("Radiologia")], 601),
    empty("Vinno X1",           "Vinno", "low",     [c("Radiologia")], 602),
    // Fujifilm
    empty("Arietta 850",        "Fujifilm (SonoSite)", "premium", [c("Radiologia")], 700),
    empty("Arietta 65",         "Fujifilm (SonoSite)", "low",     [c("Radiologia")], 701),
  ];
};

const initialFields = seedFields;
const initialCats = seedCategories;
const initialDiffs = seedDiffs;
const initialBrands = seedBrands;
const initialEquips = seedEquipments(initialFields, initialCats, initialDiffs, initialBrands);

const toTextSpecs = (specs: Record<string, string | number | boolean>): Record<string, string | number | boolean> => {
  const out: Record<string, string> = {};
  Object.entries(specs ?? {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (typeof v === "boolean") out[k] = v ? "Sim" : "Não";
    else out[k] = String(v);
  });
  return out;
};

const forceTextFields = (fields: SpecField[]): SpecField[] =>
  fields.map((f) => ({ ...f, type: "text" as FieldType, options: undefined }));

const forceTextEquipments = (equips: Equipment[]): Equipment[] =>
  equips.map((e) => ({ ...e, specs: toTextSpecs(e.specs) }));

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      auth: { role: null, name: null },
      login: (role, name) => set({ auth: { role, name } }),
      logout: () => set({ auth: { role: null, name: null } }),

      fields: forceTextFields(initialFields),
      categories: initialCats,
      differentials: initialDiffs,
      equipments: forceTextEquipments(initialEquips),
      brands: initialBrands,
      savedComparisons: [],

      addField: (f) => set((s) => ({ fields: [...s.fields, { ...f, id: uid(), type: "text", options: undefined }] })),
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

      addEquipment: (e) => {
        const id = uid();
        set((s) => ({ equipments: [...s.equipments, { ...e, id, createdAt: Date.now(), order: e.order ?? s.equipments.length }] }));
        return id;
      },
      updateEquipment: (id, patch) => set((s) => ({ equipments: s.equipments.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeEquipment: (id) => set((s) => ({ equipments: s.equipments.filter((x) => x.id !== id) })),
      reorderEquipments: (ids) => set((s) => ({
        equipments: ids.map((id, i) => ({ ...s.equipments.find((e) => e.id === id)!, order: i })),
      })),
      duplicateEquipment: (id) => {
        const e = get().equipments.find((x) => x.id === id);
        if (!e) return undefined;
        const newId = uid();
        set((s) => ({ equipments: [...s.equipments, { ...e, id: newId, name: `${e.name} (cópia)`, createdAt: Date.now(), order: s.equipments.length }] }));
        return newId;
      },

      importCatalog: (data, mode) => set((s) => {
        if (mode === "replace") {
          return {
            fields: data.fields ?? s.fields,
            categories: data.categories ?? s.categories,
            differentials: data.differentials ?? s.differentials,
            brands: data.brands ?? s.brands,
            equipments: data.equipments ?? s.equipments,
          };
        }
        const mergeBy = <T extends { id: string }>(cur: T[], incoming?: T[]) => {
          if (!incoming) return cur;
          const map = new Map(cur.map((x) => [x.id, x]));
          incoming.forEach((x) => map.set(x.id, { ...map.get(x.id), ...x }));
          return Array.from(map.values());
        };
        return {
          fields: mergeBy(s.fields, data.fields),
          categories: mergeBy(s.categories, data.categories),
          differentials: mergeBy(s.differentials, data.differentials),
          brands: mergeBy(s.brands, data.brands),
          equipments: mergeBy(s.equipments, data.equipments),
        };
      }),

      addSavedComparison: (c) => {
        const id = uid();
        set((s) => ({ savedComparisons: [...s.savedComparisons, { ...c, id, createdAt: Date.now() }] }));
        return id;
      },
      removeSavedComparison: (id) => set((s) => ({ savedComparisons: s.savedComparisons.filter((x) => x.id !== id) })),

      resetSeed: () => set({
        fields: forceTextFields(initialFields),
        categories: initialCats,
        differentials: initialDiffs,
        equipments: forceTextEquipments(initialEquips),
        brands: initialBrands,
        savedComparisons: [],
      }),
    }),
    {
      name: "samsung-medison-catalog-v5-text",
      migrate: (state: unknown) => {
        const s = state as Partial<AppState> | undefined;
        if (!s) return s as unknown as AppState;
        return {
          ...s,
          fields: s.fields ? forceTextFields(s.fields) : undefined,
          equipments: s.equipments ? forceTextEquipments(s.equipments) : undefined,
        } as AppState;
      },
      version: 5,
    }
  )
);

export const tierMeta: Record<Tier, { label: string; gradient: string; ring: string; text: string }> = {
  "super-premium": { label: "Super Premium", gradient: "tier-super-premium-bg", ring: "ring-tier-super-premium/40", text: "text-tier-super-premium" },
  premium:         { label: "Premium",       gradient: "tier-premium-bg",       ring: "ring-tier-premium/40",       text: "text-tier-premium" },
  high:            { label: "High",          gradient: "tier-high-bg",          ring: "ring-tier-high/40",          text: "text-tier-high" },
  mid:             { label: "Mid",           gradient: "tier-mid-bg",           ring: "ring-tier-mid/40",           text: "text-tier-mid" },
  low:             { label: "Low",           gradient: "tier-low-bg",           ring: "ring-tier-low/40",           text: "text-tier-low" },
};

// Ordem visual: super-premium > premium > high > mid > low
export const tierOrder: Tier[] = ["super-premium", "premium", "high", "mid", "low"];
