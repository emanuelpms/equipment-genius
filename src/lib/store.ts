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
        imgTech: "Crystal Signature+ 3ª Geração", channels: 135, depth: 35, fps: 100,
        monitorRes: "Full HD IPS", monitorSize: 21.5, weight: 65, battery: false, touch: true,
        pConvex: true, pLinear: true, pEndo: true, pTEE: true, pMatrix: true, pIntra: true, pMicro: true, probesTotal: 18,
        cardio: true, elasto: true, ceus: true, ai: true, obBio: true, colorDoppler: true,
        pocus: true, vol3d4d: true, strain: true, needle: true,
        licModel: "Modular – compra única", licPerp: true, swUpdate: true, dicom: true, hisris: true, autoPdf: true, training: true,
        warranty: 3, support247: true, trainIncl: true, responseTime: 4, loaner: true, localStock: true,
        wifi: true, bluetooth: true, usbc: true, cloud: true, telemed: true,
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
        imgTech: "Crystal Architecture", channels: 192, depth: 36, fps: 95,
        monitorRes: "Full HD", monitorSize: 23.8, weight: 130, battery: false, touch: true,
        pConvex: true, pLinear: true, pEndo: true, pTEE: false, pMatrix: true, pIntra: false, pMicro: false, probesTotal: 14,
        cardio: false, elasto: true, ceus: true, ai: true, obBio: true, colorDoppler: true,
        pocus: false, vol3d4d: true, strain: false, needle: true,
        licModel: "Modular – compra única", licPerp: true, swUpdate: true, dicom: true, hisris: true, autoPdf: true, training: true,
        warranty: 3, support247: true, trainIncl: true, responseTime: 4, loaner: true, localStock: true,
        wifi: true, bluetooth: true, usbc: true, cloud: true, telemed: true,
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
        imgTech: "EzExam+ AI", channels: 96, depth: 28, fps: 80,
        monitorRes: "HD", monitorSize: 15, weight: 3.5, battery: true, touch: true,
        pConvex: true, pLinear: true, pEndo: true, pTEE: false, pMatrix: false, pIntra: false, pMicro: true, probesTotal: 10,
        cardio: false, elasto: false, ceus: false, ai: true, obBio: true, colorDoppler: true,
        pocus: true, vol3d4d: false, strain: false, needle: true,
        licModel: "Modular – compra única", licPerp: true, swUpdate: true, dicom: true, hisris: true, autoPdf: true, training: false,
        warranty: 3, support247: true, trainIncl: true, responseTime: 4, loaner: true, localStock: true,
        wifi: true, bluetooth: true, usbc: true, cloud: true, telemed: true,
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
        imgTech: "cSound Architecture", channels: 128, depth: 32, fps: 90,
        monitorRes: "Full HD", monitorSize: 23, weight: 72, battery: false, touch: true,
        pConvex: true, pLinear: true, pEndo: true, pTEE: true, pMatrix: true, pIntra: false, pMicro: false, probesTotal: 20,
        cardio: true, elasto: true, ceus: false, ai: true, obBio: true, colorDoppler: true,
        pocus: false, vol3d4d: true, strain: true, needle: false,
        licModel: "Subscription anual", licPerp: false, swUpdate: true, dicom: true, hisris: true, autoPdf: false, training: false,
        warranty: 2, support247: false, trainIncl: true, responseTime: 8, loaner: false, localStock: false,
        wifi: false, bluetooth: false, usbc: true, cloud: false, telemed: false,
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
        imgTech: "nSIGHT Imaging", channels: 128, depth: 30, fps: 85,
        monitorRes: "FHD", monitorSize: 21.5, weight: 70, battery: false, touch: false,
        pConvex: true, pLinear: true, pEndo: true, pTEE: true, pMatrix: false, pIntra: false, pMicro: false, probesTotal: 15,
        cardio: true, elasto: false, ceus: true, ai: false, obBio: true, colorDoppler: true,
        pocus: true, vol3d4d: false, strain: false, needle: false,
        licModel: "Modular", licPerp: true, swUpdate: false, dicom: true, hisris: false, autoPdf: false, training: false,
        warranty: 2, support247: false, trainIncl: false, responseTime: 12, loaner: false, localStock: false,
        wifi: false, bluetooth: false, usbc: false, cloud: false, telemed: false,
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
        imgTech: "PureWave crystal", channels: 128, depth: 30, fps: 80,
        monitorRes: "FHD", monitorSize: 21.5, weight: 68, battery: false, touch: false,
        pConvex: true, pLinear: true, pEndo: true, pTEE: false, pMatrix: false, pIntra: false, pMicro: false, probesTotal: 12,
        cardio: true, elasto: false, ceus: false, ai: false, obBio: true, colorDoppler: true,
        pocus: true, vol3d4d: false, strain: false, needle: false,
        licModel: "Modular", licPerp: true, swUpdate: false, dicom: true, hisris: true, autoPdf: false, training: false,
        warranty: 2, support247: false, trainIncl: false, responseTime: 14, loaner: false, localStock: false,
        wifi: false, bluetooth: false, usbc: false, cloud: false, telemed: false,
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
        imgTech: "BioAcoustic Imaging", channels: 192, depth: 38, fps: 95,
        monitorRes: "4K", monitorSize: 24, weight: 80, battery: false, touch: true,
        pConvex: true, pLinear: true, pEndo: true, pTEE: true, pMatrix: true, pIntra: true, pMicro: false, probesTotal: 22,
        cardio: true, elasto: true, ceus: true, ai: false, obBio: true, colorDoppler: true,
        pocus: false, vol3d4d: true, strain: true, needle: true,
        licModel: "Modular", licPerp: true, swUpdate: true, dicom: true, hisris: true, autoPdf: false, training: true,
        warranty: 2, support247: true, trainIncl: true, responseTime: 6, loaner: false, localStock: false,
        wifi: true, bluetooth: false, usbc: true, cloud: false, telemed: false,
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
    { name: "samsung-medison-catalog-v1" }
  )
);

export const tierMeta: Record<Tier, { label: string; gradient: string; ring: string; text: string }> = {
  premium: { label: "Premium", gradient: "tier-premium-bg", ring: "ring-tier-premium/40", text: "text-tier-premium" },
  medium:  { label: "Medium",  gradient: "tier-medium-bg",  ring: "ring-tier-medium/40",  text: "text-tier-medium"  },
  low:     { label: "Essential", gradient: "tier-low-bg",   ring: "ring-tier-low/40",     text: "text-tier-low"     },
};
