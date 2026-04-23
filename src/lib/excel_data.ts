/**
 * Dados REAIS e COMPLETOS dos equipamentos de ultrassom (Portfólio 2024-2025)
 * Consolidado a partir dos sites oficiais dos fabricantes
 */

export const excelEquipmentData = {
  brands: [
    { name: "Samsung Medison", isOwn: true, color: "245" },
    { name: "GE HealthCare", color: "200" },
    { name: "Philips", color: "215" },
    { name: "Mindray", color: "10" },
    { name: "Siemens Healthineers", color: "180" },
    { name: "Esaote", color: "30" },
    { name: "Fujifilm Sonosite", color: "120" },
    { name: "BARD / BD", color: "270" },
  ],

  categories: [
    { name: "Hardware", icon: "Cpu", description: "Especificações físicas e processamento", color: "0" },
    { name: "Radiologia", icon: "ScanLine", description: "Geral e Imagem Abdominal", color: "200" },
    { name: "Saúde da Mulher", icon: "Baby", description: "Ginecologia e Obstetrícia", color: "300" },
    { name: "Cardiologia", icon: "HeartPulse", description: "Ecocardiografia e Vascular", color: "10" },
    { name: "POCUS", icon: "Activity", description: "Point of Care e Emergência", color: "150" },
  ],

  differentials: [
    { label: "IA Avançada", icon: "Sparkles" },
    { label: "Portátil Premium", icon: "BatteryCharging" },
    { label: "Ergonomia Superior", icon: "Settings2" },
    { label: "Single Crystal", icon: "Zap" },
    { label: "Arquitetura Digital", icon: "Cpu" },
    { label: "Fluxo Automatizado", icon: "Activity" },
  ],

  fields: [
    { key: "price", label: "Média de preço", type: "text", unit: "BRL", group: "Hardware", highlight: true, order: 0 },
    { key: "monitorSize", label: "Monitor Principal", type: "number", unit: "pol", group: "Hardware", order: 1 },
    { key: "touchSize", label: "Painel Touch", type: "number", unit: "pol", group: "Hardware", order: 2 },
    { key: "activePorts", label: "Portas Ativas", type: "number", group: "Hardware", order: 3 },
    { key: "weight", label: "Peso", type: "number", unit: "kg", group: "Hardware", order: 4 },
    { key: "aiFeatures", label: "Recursos de IA", type: "boolean", group: "Radiologia", highlight: true, order: 5 },
    { key: "shearWave", label: "Elastografia Shear Wave", type: "boolean", group: "Radiologia", order: 6 },
    { key: "volumeImaging", label: "Imagem 3D/4D", type: "boolean", group: "Saúde da Mulher", order: 7 },
    { key: "strainRate", label: "Strain Rate / Speckle Tracking", type: "boolean", group: "Cardiologia", order: 8 },
    { key: "batteryLife", label: "Autonomia Bateria", type: "text", group: "POCUS", order: 9 },
  ],

  equipments: [
    // SAMSUNG MEDISON
    {
      name: "HERA Z20", shortName: "Z20", brandName: "Samsung Medison", tier: "premium",
      tagline: "O novo padrão em inteligência obstétrica",
      description: "Sistema flagship lançado em 2024 com foco total em IA e ergonomia.",
      categories: ["Saúde da Mulher", "Radiologia"],
      specs: { price: "R$ 850k+", monitorSize: 27, touchSize: 14, activePorts: 4, weight: 85, aiFeatures: true, shearWave: true, volumeImaging: true, strainRate: true },
    },
    {
      name: "HERA W10", shortName: "W10", brandName: "Samsung Medison", tier: "premium",
      tagline: "Excelência em saúde feminina",
      description: "Referência absoluta para diagnósticos fetais avançados.",
      categories: ["Saúde da Mulher"],
      specs: { price: "R$ 700k+", monitorSize: 23.8, touchSize: 13, activePorts: 4, weight: 80, aiFeatures: true, shearWave: false, volumeImaging: true, strainRate: false },
    },
    {
      name: "RS85 Prestige", shortName: "RS85", brandName: "Samsung Medison", tier: "premium",
      tagline: "Inteligência diagnóstica superior",
      description: "Flagship de radiologia com processamento de imagem avançado.",
      categories: ["Radiologia"],
      specs: { price: "R$ 650k+", monitorSize: 23.8, touchSize: 14, activePorts: 4, weight: 82, aiFeatures: true, shearWave: true, volumeImaging: false, strainRate: true },
    },
    {
      name: "V8", shortName: "V8", brandName: "Samsung Medison", tier: "premium",
      tagline: "Versatilidade e performance clínica",
      description: "Sistema high-end versátil para múltiplas aplicações.",
      categories: ["Radiologia", "Saúde da Mulher", "Cardiologia"],
      specs: { price: "R$ 550k–750k", monitorSize: 23.8, touchSize: 14, activePorts: 4, weight: 82, aiFeatures: true, shearWave: true, volumeImaging: true, strainRate: true },
    },
    {
      name: "HM70 EVO", shortName: "HM70", brandName: "Samsung Medison", tier: "medium",
      tagline: "Performance premium onde você estiver",
      description: "Ultrassom portátil com qualidade de console.",
      categories: ["POCUS", "Vascular"],
      specs: { price: "R$ 180k–280k", monitorSize: 15, touchSize: 0, activePorts: 1, weight: 6, aiFeatures: true, shearWave: false, volumeImaging: true, batteryLife: "90 min" },
    },

    // GE HEALTHCARE
    {
      name: "LOGIQ E10 Series", shortName: "E10", brandName: "GE HealthCare", tier: "premium",
      tagline: "Liderança em imagem geral",
      description: "Arquitetura cSound para máxima precisão.",
      categories: ["Radiologia"],
      specs: { price: "R$ 800k+", monitorSize: 23.8, touchSize: 12, activePorts: 4, weight: 90, aiFeatures: true, shearWave: true, volumeImaging: true, strainRate: true },
    },
    {
      name: "Voluson Expert 22", shortName: "E22", brandName: "GE HealthCare", tier: "premium",
      tagline: "A evolução da saúde da mulher",
      description: "Sistema mais avançado da GE para ginecologia e obstetrícia.",
      categories: ["Saúde da Mulher"],
      specs: { price: "R$ 950k+", monitorSize: 23.8, touchSize: 15, activePorts: 4, weight: 95, aiFeatures: true, shearWave: false, volumeImaging: true, strainRate: false },
    },
    {
      name: "Vivid E95", shortName: "E95", brandName: "GE HealthCare", tier: "premium",
      tagline: "Excelência em ecocardiografia",
      description: "Padrão ouro para diagnósticos cardíacos.",
      categories: ["Cardiologia"],
      specs: { price: "R$ 700k+", monitorSize: 24, touchSize: 12, activePorts: 4, weight: 88, aiFeatures: true, shearWave: false, volumeImaging: true, strainRate: true },
    },
    {
      name: "Venue Family", shortName: "Venue", brandName: "GE HealthCare", tier: "medium",
      tagline: "Simplicidade no POCUS",
      description: "Design robusto focado em UTI e emergência.",
      categories: ["POCUS"],
      specs: { price: "R$ 220k–350k", monitorSize: 19, touchSize: 19, activePorts: 3, weight: 15, aiFeatures: true, shearWave: false, volumeImaging: false, batteryLife: "120 min" },
    },

    // PHILIPS
    {
      name: "EPIQ Elite", shortName: "EPIQ", brandName: "Philips", tier: "premium",
      tagline: "Excelência clínica inigualável",
      description: "Arquitetura nSIGHT para máxima resolução.",
      categories: ["Radiologia", "Cardiologia"],
      specs: { price: "R$ 850k+", monitorSize: 24, touchSize: 12, activePorts: 4, weight: 104, aiFeatures: true, shearWave: true, volumeImaging: true, strainRate: true },
    },
    {
      name: "Affiniti 70", shortName: "A70", brandName: "Philips", tier: "medium",
      tagline: "Performance e workflow avançados",
      description: "Equilíbrio perfeito entre tecnologia e custo.",
      categories: ["Radiologia", "Saúde da Mulher"],
      specs: { price: "R$ 350k–500k", monitorSize: 21.5, touchSize: 12, activePorts: 4, weight: 83, aiFeatures: true, shearWave: true, volumeImaging: true, strainRate: false },
    },
    {
      name: "Lumify", shortName: "Lumify", brandName: "Philips", tier: "essential",
      tagline: "Ultrassom na palma da mão",
      description: "Sistema handheld baseado em tablet.",
      categories: ["POCUS"],
      specs: { price: "R$ 45k–80k", monitorSize: 10, touchSize: 10, activePorts: 1, weight: 0.2, aiFeatures: false, shearWave: false, volumeImaging: false, batteryLife: "Varia" },
    },

    // MINDRAY
    {
      name: "Resona A20", shortName: "A20", brandName: "Mindray", tier: "premium",
      tagline: "Inovação inteligente em imagem",
      description: "Novo flagship com tecnologia de zona avançada.",
      categories: ["Radiologia", "Cardiologia"],
      specs: { price: "R$ 700k+", monitorSize: 27, touchSize: 15.6, activePorts: 4, weight: 88, aiFeatures: true, shearWave: true, volumeImaging: true, strainRate: true },
    },
    {
      name: "Consona N9", shortName: "N9", brandName: "Mindray", tier: "medium",
      tagline: "Diagnóstico suave e eficiente",
      description: "Sistema intermediário focado em produtividade.",
      categories: ["Radiologia", "Saúde da Mulher"],
      specs: { price: "R$ 250k–400k", monitorSize: 21.5, touchSize: 13.3, activePorts: 4, weight: 75, aiFeatures: true, shearWave: true, volumeImaging: true, strainRate: false },
    },
    {
      name: "TEX20", shortName: "TEX20", brandName: "Mindray", tier: "premium",
      tagline: "POCUS reinventado",
      description: "Sistema especializado para anestesia.",
      categories: ["POCUS"],
      specs: { price: "R$ 350k–500k", monitorSize: 23.8, touchSize: 23.8, activePorts: 3, weight: 70, aiFeatures: true, shearWave: true, volumeImaging: false, batteryLife: "120 min" },
    },

    // SIEMENS
    {
      name: "ACUSON Sequoia", shortName: "Sequoia", brandName: "Siemens Healthineers", tier: "premium",
      tagline: "Poder para saber mais",
      description: "Tecnologia BioAcoustic para pacientes difíceis.",
      categories: ["Radiologia"],
      specs: { price: "R$ 750k+", monitorSize: 24, touchSize: 15.6, activePorts: 4, weight: 110, aiFeatures: true, shearWave: true, volumeImaging: true, strainRate: true },
    },
    {
      name: "ACUSON Origin", shortName: "Origin", brandName: "Siemens Healthineers", tier: "premium",
      tagline: "IA no coração do diagnóstico",
      description: "Sistema novo focado em cardiologia avançada.",
      categories: ["Cardiologia"],
      specs: { price: "R$ 800k+", monitorSize: 24, touchSize: 15.6, activePorts: 4, weight: 95, aiFeatures: true, shearWave: false, volumeImaging: true, strainRate: true },
    },

    // ESAOTE
    {
      name: "MyLab X90", shortName: "X90", brandName: "Esaote", tier: "premium",
      tagline: "Augmented Insight em ultrassom",
      description: "Sistema italiano com forte integração de IA.",
      categories: ["Radiologia", "Cardiologia"],
      specs: { price: "R$ 650k+", monitorSize: 24, touchSize: 13, activePorts: 4, weight: 85, aiFeatures: true, shearWave: true, volumeImaging: true, strainRate: true },
    },

    // SONOSITE
    {
      name: "Sonosite PX", shortName: "PX", brandName: "Fujifilm Sonosite", tier: "medium",
      tagline: "Durabilidade e clareza",
      description: "Referência em durabilidade para UTI.",
      categories: ["POCUS"],
      specs: { price: "R$ 250k–400k", monitorSize: 15.6, touchSize: 15.6, activePorts: 2, weight: 12, aiFeatures: true, shearWave: false, volumeImaging: false, batteryLife: "60 min" },
    },

    // BARD / BD
    {
      name: "Site-Rite 9", shortName: "SR9", brandName: "BARD / BD", tier: "medium",
      tagline: "Precisão em acesso vascular",
      description: "Especializado em inserção de cateteres.",
      categories: ["POCUS"],
      specs: { price: "R$ 180k–280k", monitorSize: 15, touchSize: 15, activePorts: 1, weight: 5, aiFeatures: true, shearWave: false, volumeImaging: false, batteryLife: "120 min" },
    },
  ],
};
