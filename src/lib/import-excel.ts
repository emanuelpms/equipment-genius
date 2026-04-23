import { excelEquipmentData } from './excel_data';
import { useStore } from './store';

const uid = () => Math.random().toString(36).slice(2, 10);

export const importExcelData = () => {
  const store = useStore.getState();

  // Importar marcas
  const brandMap = new Map<string, string>();
  excelEquipmentData.brands.forEach((brand) => {
    const existingBrand = store.brands.find((b) => b.name === brand.name);
    if (!existingBrand) {
      const brandId = store.addBrand({
        name: brand.name,
        color: brand.color,
        order: (brand as any).order || store.brands.length,
      });
      brandMap.set(brand.name, brandId);
    } else {
      brandMap.set(brand.name, existingBrand.id);
    }
  });

  // Importar categorias
  const categoryMap = new Map<string, string>();
  excelEquipmentData.categories?.forEach((category) => {
    const existingCategory = store.categories.find((c) => c.name === category.name);
    if (!existingCategory) {
      store.addCategory({
        name: category.name,
        icon: category.icon,
        description: category.description,
        color: category.color,
        order: store.categories.length,
      });
      const newCategory = store.categories.find((c) => c.name === category.name);
      if (newCategory) categoryMap.set(category.name, newCategory.id);
    } else {
      categoryMap.set(category.name, existingCategory.id);
    }
  });

  // Importar diferenciais
  const differentialMap = new Map<string, string>();
  excelEquipmentData.differentials?.forEach((differential) => {
    const existingDifferential = store.differentials.find(
      (d) => d.label === differential.label
    );
    if (!existingDifferential) {
      store.addDifferential({
        label: differential.label,
        icon: differential.icon,
        order: store.differentials.length,
      });
      const newDifferential = store.differentials.find((d) => d.label === differential.label);
      if (newDifferential) differentialMap.set(differential.label, newDifferential.id);
    } else {
      differentialMap.set(differential.label, existingDifferential.id);
    }
  });

  // Importar campos
  excelEquipmentData.fields?.forEach((field) => {
    const existingField = store.fields.find((f) => f.key === field.key);
    if (!existingField) {
      store.addField({
        key: field.key,
        label: field.label,
        type: field.type as any,
        unit: field.unit,
        group: field.group,
        highlight: field.highlight,
        order: field.order,
        options: field.options,
      });
    }
  });

  // Importar equipamentos
  excelEquipmentData.equipments.forEach((equipment) => {
    const existingEquipment = store.equipments.find((e) => e.name === equipment.name);
    if (!existingEquipment) {
      const brandId = brandMap.get(equipment.brandName);
      if (brandId) {
        store.addEquipment({
          name: equipment.name,
          shortName: equipment.shortName,
          brandId,
          tier: equipment.tier as any,
          tagline: equipment.tagline,
          description: equipment.description,
          categories: equipment.categories.map((c) => categoryMap.get(c)!).filter(Boolean),
          bestFor: equipment.bestFor,
          differentials: equipment.differentials
            .map((d) => differentialMap.get(d)!)
            .filter(Boolean),
          specs: equipment.specs,
          highlights: equipment.highlights,
          releaseYear: equipment.releaseYear,
          order: store.equipments.length,
        });
      }
    }
  });

  console.log('✅ Dados do Excel importados com sucesso!');
};

// Variável para rastrear se já foi importado
let imported = false;

export const ensureExcelDataImported = () => {
  if (!imported) {
    importExcelData();
    imported = true;
  }
};
