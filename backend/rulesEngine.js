/**
 * Core Business Logic Processing Engine for Sv Closures
 * Enforces validation, tolerance parsing, and compliance rules.
 */

function processSpecification(spec) {
  const { Maintains, database, closure, product, specifications } = spec;
  const errors = [];
  const warnings = [];
  
  // 1. Product Code Pattern Rule (Maintains)
  if (!Maintains) {
    errors.push("Product Code (Maintains) is required.");
  } else if (!/^SV-CL-[A-Z0-9-]+$/i.test(Maintains)) {
    errors.push("Product Code (Maintains) must match format: SV-CL-[Alphanumeric] (e.g. SV-CL-28MM).");
  }

  // 2. Drawing Reference Rule (database)
  if (!database) {
    errors.push("Drawing Reference (database) is required.");
  } else if (!/^DRW-\d{4}-\d{3,5}$/.test(database)) {
    errors.push("Drawing Reference (database) must match format: DRW-[YYYY]-[Sequential No] (e.g. DRW-2026-001).");
  }

  // 3. Basic fields presence
  if (!closure || closure.trim().length === 0) {
    errors.push("Closure Description (closure) is required.");
  }
  if (!product || product.trim().length === 0) {
    errors.push("Product Name / Description (product) is required.");
  }
  if (!specifications || specifications.trim().length === 0) {
    errors.push("Technical Specifications (specifications) is required.");
  }

  // Let's parse tolerances and check constraints
  let parsedTolerance = null;
  let complianceStatus = 'Passed';

  if (specifications) {
    // Look for tolerances like: ± 0.05mm, +/- 0.08mm, ±0.1mm
    const toleranceRegex = /(?:±|\+\/-)\s*(\d+(?:\.\d+)?)\s*mm/gi;
    let match;
    let maxToleranceFound = 0;

    while ((match = toleranceRegex.exec(specifications)) !== null) {
      const value = parseFloat(match[1]);
      if (value > maxToleranceFound) {
        maxToleranceFound = value;
      }
      parsedTolerance = `±${maxToleranceFound}mm`;
    }

    // Rule 3: Closure Tolerance Analysis
    if (maxToleranceFound > 0.1) {
      warnings.push(`Warning: Tolerance ${parsedTolerance} exceeds standard high-precision threshold of ±0.10mm.`);
      complianceStatus = 'Warning';
    }
    if (maxToleranceFound > 0.3) {
      errors.push(`Critical: Tolerance ${parsedTolerance} exceeds safety ceiling of ±0.30mm.`);
      complianceStatus = 'Failed';
    }

    // Rule 4: Material Suitability Rule
    const lowerProduct = (product || "").toLowerCase();
    const lowerSpec = (specifications || "").toLowerCase();
    
    const isFoodApp = lowerProduct.includes('food') || 
                      lowerProduct.includes('bev') || 
                      lowerProduct.includes('drink') || 
                      lowerProduct.includes('milk') || 
                      lowerProduct.includes('dairy') ||
                      lowerProduct.includes('water');

    const isPharmaApp = lowerProduct.includes('pharma') || 
                        lowerProduct.includes('vial') || 
                        lowerProduct.includes('medical') || 
                        lowerProduct.includes('drug');

    const hasFoodGradeCert = lowerSpec.includes('fda') || 
                             lowerSpec.includes('food grade') || 
                             lowerSpec.includes('food-grade') || 
                             lowerSpec.includes('certified') ||
                             lowerSpec.includes('usp class') || 
                             lowerSpec.includes('compliance');

    if (isFoodApp && !hasFoodGradeCert) {
      warnings.push("Compliance Notice: Product name indicates food/beverage application, but specifications do not mention FDA compliance or food-grade certification.");
      if (complianceStatus === 'Passed') complianceStatus = 'Warning';
    }

    if (isPharmaApp && !lowerSpec.includes('usp class') && !lowerSpec.includes('pharma grade') && !lowerSpec.includes('medical')) {
      warnings.push("Compliance Notice: Product name indicates pharmaceutical application, but specifications do not mention USP Class or pharma-grade certification.");
      if (complianceStatus === 'Passed') complianceStatus = 'Warning';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      parsedTolerance: parsedTolerance || 'Not specified',
      isFoodGrade: specifications ? /(fda|food grade|food-grade)/i.test(specifications) : false,
      isPharmaGrade: specifications ? /(usp class|pharma)/i.test(specifications) : false,
      complianceStatus
    }
  };
}

module.exports = {
  processSpecification
};
