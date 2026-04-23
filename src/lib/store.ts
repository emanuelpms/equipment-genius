import { create } from "zustand";
import { persist } from "zustand/middleware";
import { excelEquipmentData } from './excel_data';

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
  _fields: SpecField[],
  cats: Category[],
  diffs: Differential[],
  brands: Brand[]
): Equipment[] => {
  const c = (n: string) => cats.find((x) => x.name === n)!.id;
  const d = (n: string) => diffs.find((x) => x.label === n)!.id;
  const b = (n: string) => brands.find((x) => x.name === n)!.id;
  const now = Date.now();
  return [
    // ─── Samsung Medison (own) ─────────────────────────
    {
      id: uid(), name: "HS50A", shortName: "HS50A", brandId: b("Samsung Medison"), tier: "premium",
      tagline: "Flagship Samsung — IA Crystal Signature+ 3ª geração",
      description: "Plataforma premium da linha Samsung. Melhor custo-benefício para hospitais de grande porte com IA assistida em todas as especialidades.",
      categories: [c("Cardiologia"), c("Ginecologia"), c("Obstetrícia"), c("Radiologia"), c("Vascular"), c("IA Clínica")],
      bestFor: [c("Cardiologia"), c("Radiologia"), c("IA Clínica")],
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
      releaseYear: 2024, order: 0, createdAt: now,
    },
    {
      id: uid(), name: "HERA W10", shortName: "W10", brandId: b("Samsung Medison"), tier: "premium",
      tagline: "Topo de linha em ginecologia e obstetrícia 5D",
      description: "Plataforma dedicada à saúde da mulher com tecnologia 5D NT, IA BiometryAssist e workflow otimizado para clínicas e hospitais.",
      categories: [c("Ginecologia"), c("Obstetrícia"), c("IA Clínica"), c("Radiologia")],
      bestFor: [c("Ginecologia"), c("Obstetrícia")],
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
      releaseYear: 2024, order: 1, createdAt: now,
    },
    {
      id: uid(), name: "HM70 EVO", shortName: "HM70", brandId: b("Samsung Medison"), tier: "medium",
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
      releaseYear: 2023, order: 2, createdAt: now,
    },
    // ─── GE Healthcare ─────────────────────────────────
    {
      id: uid(), name: "Logiq E10", shortName: "E10", brandId: b("GE Healthcare"), tier: "premium",
      tagline: "Topo de linha GE com arquitetura cSound",
      description: "Plataforma premium GE com forte presença em cardiologia. Subscription anual de software, sem licença perpétua.",
      categories: [c("Cardiologia"), c("Vascular"), c("Radiologia")],
      bestFor: [c("Cardiologia")],
      differentials: [d("Workflow rápido"), d("Conectividade DICOM")],
      specs: {
        price: "R$ 520k–680k", channels: 128, os: "Windows 10 Embedded", wifi: false,
        monitorType: "LED Full HD", monitorSize: 23, touch: true, storage: "1 TB HDD",
        activePorts: 4, usbPorts: 4, weight: 72, dimensions: "150 x 60 x 92 cm",
        heightAdjust: true, artArm: true, gelWarmer: false, pedal: true, keyboard: "Físico", battery: false, probeHolders: 4,
        radAutoMeas: true, radAI: true, swConvex: true, swLinear: false, ceus: false, singleCrystal: false, maxFreq: 15,
        obAutoMeas: true, vol3d4d: true, fovEndo: false, tumorEndo: false, tumorOV: false,
        strainLV: true, strainLARV: false, tee3d: true, tte3d: true, echoStress: true, efAuto: true,
        bladderAuto: false, prostateFusion: true,
        pConvex: true, pMicro: false, pConvexVol: true, pLinear: true, pTV: true, pBiplanar: false, pHockey: false,
        pEndoVol: false, pSecAdult: true, pSecPed: true, pSecNeo: false, pTEEAdult: true, pTEEPed: false,
      },
      highlights: ["cSound", "Cardio Suite"],
      releaseYear: 2023, order: 3, createdAt: now,
    },
    // ─── Philips ───────────────────────────────────────
    {
      id: uid(), name: "EPIQ Elite", shortName: "EPIQ", brandId: b("Philips"), tier: "premium",
      tagline: "Foco em alta resolução, ginecologia e cardio pediátrica",
      description: "Plataforma Philips com nSIGHT Imaging. Sem suporte 24/7 e sem IA assistida no fluxo padrão.",
      categories: [c("Ginecologia"), c("Cardiologia"), c("Radiologia")],
      bestFor: [c("Ginecologia")],
      differentials: [d("Conectividade DICOM")],
      specs: {
        price: "R$ 600k–780k", channels: 128, os: "Windows 10", wifi: false,
        monitorType: "LED FHD", monitorSize: 21.5, touch: false, storage: "1 TB HDD",
        activePorts: 4, usbPorts: 4, weight: 70, dimensions: "147 x 58 x 88 cm",
        heightAdjust: true, artArm: true, gelWarmer: false, pedal: true, keyboard: "Físico", battery: false, probeHolders: 4,
        radAutoMeas: true, radAI: false, swConvex: true, swLinear: true, ceus: true, singleCrystal: true, maxFreq: 18,
        obAutoMeas: true, vol3d4d: false, fovEndo: false, tumorEndo: false, tumorOV: false,
        strainLV: true, strainLARV: true, tee3d: true, tte3d: true, echoStress: true, efAuto: true,
        bladderAuto: false, prostateFusion: false,
        pConvex: true, pMicro: false, pConvexVol: false, pLinear: true, pTV: true, pBiplanar: false, pHockey: false,
        pEndoVol: false, pSecAdult: true, pSecPed: true, pSecNeo: true, pTEEAdult: true, pTEEPed: true,
      },
      highlights: ["nSIGHT Imaging"],
      releaseYear: 2022, order: 4, createdAt: now,
    },
    {
      id: uid(), name: "Affiniti 70", shortName: "A70", brandId: b("Philips"), tier: "medium",
      tagline: "Plataforma intermediária com foco em custo-benefício hospitalar",
      description: "Linha intermediária Philips com PureWave crystal, voltada a hospitais de médio porte.",
      categories: [c("Cardiologia"), c("Obstetrícia"), c("Radiologia")],
      bestFor: [],
      differentials: [d("Conectividade DICOM")],
      specs: {
        price: "R$ 380k–460k", channels: 128, os: "Windows 10", wifi: false,
        monitorType: "LED FHD", monitorSize: 21.5, touch: false, storage: "500 GB HDD",
        activePorts: 3, usbPorts: 3, weight: 68, dimensions: "145 x 56 x 86 cm",
        heightAdjust: true, artArm: false, gelWarmer: false, pedal: true, keyboard: "Físico", battery: false, probeHolders: 4,
        radAutoMeas: true, radAI: false, swConvex: false, swLinear: false, ceus: false, singleCrystal: false, maxFreq: 12,
        obAutoMeas: true, vol3d4d: false, fovEndo: false, tumorEndo: false, tumorOV: false,
        strainLV: true, strainLARV: false, tee3d: false, tte3d: false, echoStress: false, efAuto: true,
        bladderAuto: false, prostateFusion: false,
        pConvex: true, pMicro: false, pConvexVol: false, pLinear: true, pTV: true, pBiplanar: false, pHockey: false,
        pEndoVol: false, pSecAdult: true, pSecPed: false, pSecNeo: false, pTEEAdult: false, pTEEPed: false,
      },
      highlights: ["PureWave"],
      releaseYear: 2022, order: 5, createdAt: now,
    },
    // ─── Siemens Healthineers ──────────────────────────
    {
      id: uid(), name: "Sequoia", shortName: "SEQ", brandId: b("Siemens Healthineers"), tier: "premium",
      tagline: "BioAcoustic Imaging com forte presença hospitalar",
      description: "Alta tecnologia Siemens com BioAcoustic, ampla profundidade e cobertura de Radiologia, Vascular e Cardio.",
      categories: [c("Radiologia"), c("Vascular"), c("Cardiologia")],
      bestFor: [c("Radiologia"), c("Vascular")],
      differentials: [d("Conectividade DICOM"), d("Workflow rápido")],
      specs: {
        price: "R$ 700k–900k", channels: 192, os: "Linux Embedded", wifi: true,
        monitorType: "LED 4K", monitorSize: 24, touch: true, storage: "2 TB SSD",
        activePorts: 4, usbPorts: 6, weight: 80, dimensions: "152 x 62 x 95 cm",
        heightAdjust: true, artArm: true, gelWarmer: false, pedal: true, keyboard: "Físico", battery: false, probeHolders: 5,
        radAutoMeas: true, radAI: false, swConvex: true, swLinear: true, ceus: true, singleCrystal: true, maxFreq: 22,
        obAutoMeas: true, vol3d4d: true, fovEndo: true, tumorEndo: false, tumorOV: false,
        strainLV: true, strainLARV: true, tee3d: true, tte3d: true, echoStress: true, efAuto: true,
        bladderAuto: false, prostateFusion: true,
        pConvex: true, pMicro: false, pConvexVol: true, pLinear: true, pTV: true, pBiplanar: true, pHockey: false,
        pEndoVol: false, pSecAdult: true, pSecPed: true, pSecNeo: false, pTEEAdult: true, pTEEPed: true,
      },
      highlights: ["BioAcoustic", "4K monitor", "192 canais"],
      releaseYear: 2023, order: 6, createdAt: now,
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
        fields: initialFields,
        categories: initialCats,
        differentials: initialDiffs,
        equipments: initialEquips,
        brands: initialBrands,
        savedComparisons: [],
      }),
    }),
    { name: "samsung-medison-catalog-v2" }
  )
);

export const tierMeta: Record<Tier, { label: string; gradient: string; ring: string; text: string }> = {
  premium: { label: "Premium", gradient: "tier-premium-bg", ring: "ring-tier-premium/40", text: "text-tier-premium" },
  medium:  { label: "Medium",  gradient: "tier-medium-bg",  ring: "ring-tier-medium/40",  text: "text-tier-medium"  },
  low:     { label: "Essential", gradient: "tier-low-bg",   ring: "ring-tier-low/40",     text: "text-tier-low"     },
};
