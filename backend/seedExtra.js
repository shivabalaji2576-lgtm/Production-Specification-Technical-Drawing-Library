const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.json');

if (!fs.existsSync(dbPath)) {
  console.error('database.json does not exist. Run the server first to initialize.');
  process.exit(1);
}

const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const extraSpecs = [
  {
    Maintains: 'SV-CL-40MM',
    database: 'DRW-2026-009',
    closure: '40mm Beverage Lid',
    product: 'Carbonated Drink Lid Orange',
    specifications: 'Material: FDA PP, outer: 40.2mm ± 0.04mm, food grade certified.',
    status: 'Active'
  },
  {
    Maintains: 'SV-CL-50IND',
    database: 'DRW-2026-010',
    closure: '50mm Drum Cap',
    product: 'Industrial Oil Drum Cap Black',
    specifications: 'Material: Chemical PP, outer: 50.8mm ± 0.15mm, chemical compliant.',
    status: 'Active'
  },
  {
    Maintains: 'SV-CL-18PH',
    database: 'DRW-2026-011',
    closure: '18mm Dropper Cap',
    product: 'Pharma Dropper Cap Amber',
    specifications: 'Material: PP / Rubber Bulb, outer: 18.2mm ± 0.01mm, USP Class VI Certified Grade.',
    status: 'Active'
  },
  {
    Maintains: 'SV-CL-33MM',
    database: 'DRW-2026-012',
    closure: '33mm Liquor Cap',
    product: 'Spirit Bottle Closure Black',
    specifications: 'Material: LDPE, outer: 33.1mm ± 0.05mm, FDA food grade.',
    status: 'Completed'
  },
  {
    Maintains: 'SV-CL-24PH',
    database: 'DRW-2026-013',
    closure: '24mm Syrup Cap',
    product: 'Pharma Syrup Bottle Cap White',
    specifications: 'Material: HDPE, outer: 24.3mm ± 0.02mm, USP Class VI compliance.',
    status: 'Active'
  },
  {
    Maintains: 'SV-CL-60IND',
    database: 'DRW-2026-014',
    closure: '60mm Valve Cap',
    product: 'IBC Tote Valve Lid Red',
    specifications: 'Material: HDPE, outer: 60.5mm ± 0.35mm, industrial grade.',
    status: 'Active'
  },
  {
    Maintains: 'SV-CL-28FD',
    database: 'DRW-2026-015',
    closure: '28mm Juice Cap',
    product: 'Juice Bottle Cap Orange',
    specifications: 'Material: HDPE, outer: 28.2mm ± 0.05mm, FDA Approved Food Grade.',
    status: 'Completed'
  },
  {
    Maintains: 'SV-CL-38FD',
    database: 'DRW-2026-016',
    closure: '38mm Water Cap',
    product: 'Sport Water Bottle Cap Yellow',
    specifications: 'Material: PP, outer: 38.3mm ± 0.06mm, FDA Food Grade.',
    status: 'Active'
  },
  {
    Maintains: 'SV-CL-22PH',
    database: 'DRW-2026-017',
    closure: '22mm Vial Cap',
    product: 'Pharma Injectable Vial Cap Pink',
    specifications: 'Material: Aluminum / Rubber Stopper, outer: 22.1mm ± 0.02mm, USP Class VI.',
    status: 'Completed'
  },
  {
    Maintains: 'SV-CL-70IND',
    database: 'DRW-2026-018',
    closure: '70mm Pail Lid',
    product: 'Paint Pail Closure White',
    specifications: 'Material: HDPE, outer: 70.8mm ± 0.25mm, heavy-duty industrial.',
    status: 'Archived'
  }
];

extraSpecs.forEach(spec => {
  // Check if exists
  if (dbData.tables.product_specification_technical_dra.some(x => x.Maintains === spec.Maintains)) {
    console.log(`Spec ${spec.Maintains} already exists, skipping.`);
    return;
  }

  const id = dbData.counters.product_specification_technical_dra++;
  dbData.tables.product_specification_technical_dra.push({
    id,
    ...spec,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  console.log(`Successfully seeded spec: ${spec.Maintains}`);
});

fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
console.log('Finished seeding extra spec records. Total specs in DB:', dbData.tables.product_specification_technical_dra.length);
