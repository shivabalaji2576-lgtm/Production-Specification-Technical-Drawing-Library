const { processSpecification } = require('../backend/rulesEngine');

console.log('==================================================');
console.log('RUNNING CORE RULES ENGINE TESTS (10 Cases)');
console.log('==================================================\n');

const testCases = [
  {
    name: 'Case 1: Standard Valid Specification (Happy Path)',
    input: {
      Maintains: 'SV-CL-28MM',
      database: 'DRW-2026-001',
      closure: '28mm Beverage Cap',
      product: 'Soft Drink Bottle Cap',
      specifications: 'Material: HDPE, Outer: 28.2mm ±0.05mm, FDA Approved food-grade.'
    },
    verify: (result) => result.isValid && result.errors.length === 0 && result.metrics.complianceStatus === 'Passed'
  },
  {
    name: 'Case 2: Invalid Product Code Format (Maintains)',
    input: {
      Maintains: 'INVALID-CODE-123',
      database: 'DRW-2026-001',
      closure: '28mm Beverage Cap',
      product: 'Soft Drink Cap',
      specifications: 'Material: HDPE, Outer: 28.2mm ±0.05mm, FDA Approved.'
    },
    verify: (result) => !result.isValid && result.errors.some(e => e.includes('Product Code (Maintains) must match format'))
  },
  {
    name: 'Case 3: Invalid Drawing Reference Format (database)',
    input: {
      Maintains: 'SV-CL-28MM',
      database: 'DRAWING-101',
      closure: '28mm Beverage Cap',
      product: 'Soft Drink Cap',
      specifications: 'Material: HDPE, Outer: 28.2mm ±0.05mm, FDA Approved.'
    },
    verify: (result) => !result.isValid && result.errors.some(e => e.includes('Drawing Reference (database) must match format'))
  },
  {
    name: 'Case 4: Missing Required Fields',
    input: {
      Maintains: '',
      database: 'DRW-2026-001',
      closure: '',
      product: '',
      specifications: ''
    },
    verify: (result) => !result.isValid && result.errors.length >= 4
  },
  {
    name: 'Case 5: Boundary Case - High-Precision Tolerance Limit (0.05mm)',
    input: {
      Maintains: 'SV-CL-28MM',
      database: 'DRW-2026-001',
      closure: '28mm Cap',
      product: 'Standard Closure',
      specifications: 'Material: HDPE, Outer: 28.2mm ± 0.05mm'
    },
    verify: (result) => result.isValid && result.metrics.complianceStatus === 'Passed'
  },
  {
    name: 'Case 6: Boundary Case - Warning Tolerance Threshold (>0.1mm)',
    input: {
      Maintains: 'SV-CL-28MM',
      database: 'DRW-2026-001',
      closure: '28mm Cap',
      product: 'Standard Closure',
      specifications: 'Material: HDPE, Outer: 28.2mm ± 0.15mm'
    },
    verify: (result) => result.isValid && result.warnings.some(w => w.includes('exceeds standard high-precision threshold')) && result.metrics.complianceStatus === 'Warning'
  },
  {
    name: 'Case 7: Boundary Case - Critical Safety Ceiling Limit (>0.3mm)',
    input: {
      Maintains: 'SV-CL-28MM',
      database: 'DRW-2026-001',
      closure: '28mm Cap',
      product: 'Standard Closure',
      specifications: 'Material: HDPE, Outer: 28.2mm ± 0.35mm'
    },
    verify: (result) => !result.isValid && result.errors.some(e => e.includes('exceeds safety ceiling')) && result.metrics.complianceStatus === 'Failed'
  },
  {
    name: 'Case 8: Compliance Warning - Food App without Certification',
    input: {
      Maintains: 'SV-CL-28MM',
      database: 'DRW-2026-001',
      closure: '28mm Cap',
      product: 'Orange Juice Beverage Cap',
      specifications: 'Material: PP, Outer: 28.2mm ± 0.05mm'
    },
    verify: (result) => result.isValid && result.warnings.some(w => w.includes('FDA compliance')) && result.metrics.complianceStatus === 'Warning'
  },
  {
    name: 'Case 9: Compliance Warning - Pharma App without Certification',
    input: {
      Maintains: 'SV-CL-20PH',
      database: 'DRW-2026-004',
      closure: '20mm Vial Seal',
      product: 'Pharma Liquid Bottle Stopper',
      specifications: 'Material: PP, Outer: 20.2mm ± 0.02mm'
    },
    verify: (result) => result.isValid && result.warnings.some(w => w.includes('USP Class')) && result.metrics.complianceStatus === 'Warning'
  },
  {
    name: 'Case 10: Regression Check - Complex Multi-Value Specification',
    input: {
      Maintains: 'SV-CL-30MM',
      database: 'DRW-2026-005',
      closure: '30mm Seal Cap',
      product: 'Pharma Vial Seal FDA Compliant',
      specifications: 'Material: PP, Outer Diameter: 30.2mm ±0.03mm, Inner: 26.5mm ±0.01mm, USP Class VI Certified, FDA food grade.'
    },
    verify: (result) => result.isValid && result.warnings.length === 0 && result.metrics.complianceStatus === 'Passed'
  }
];

let passedTests = 0;

testCases.forEach((t, index) => {
  const result = processSpecification(t.input);
  const passed = t.verify(result);
  
  if (passed) {
    console.log(`[PASS] ${t.name}`);
    passedTests++;
  } else {
    console.log(`[FAIL] ${t.name}`);
    console.log('Input:', JSON.stringify(t.input, null, 2));
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('-------------------------------------------');
  }
});

console.log('\n==================================================');
console.log(`TEST RESULTS: ${passedTests} / ${testCases.length} PASSED`);
console.log('==================================================');

if (passedTests === testCases.length) {
  console.log('All Core Rules Engine cases passed successfully!');
  process.exit(0);
} else {
  console.log('Some test cases failed. Please review the output.');
  process.exit(1);
}
