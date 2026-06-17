import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, X, AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// Client-side replica of the rules engine for instant live validation alerts
const runLocalRulesEngine = (data) => {
  const { type, codeSuffix, database, closure, product, specifications } = data;
  const maintains = `${type}-${(codeSuffix || '').trim().toUpperCase()}`;
  const errors = [];
  const warnings = [];

  // 1. Product Code Pattern Rule
  if (!codeSuffix || !codeSuffix.trim()) {
    errors.push("Product Code suffix is required (e.g. 28MM, 1L).");
  } else if (!/^[A-Z0-9-]+$/i.test(codeSuffix.trim())) {
    errors.push("Product Code suffix must contain only alphanumeric characters and dashes.");
  }

  // 2. Drawing Reference Rule
  if (!database || !database.trim()) {
    errors.push("Drawing Reference is required (e.g. DRW-2026-001).");
  } else if (!/^DRW-\d{4}-\d{3,5}$/.test(database.trim())) {
    errors.push("Drawing Reference must match format: DRW-[YYYY]-[Sequential] (e.g., DRW-2026-001).");
  }

  // 3. Basic fields presence
  if (!closure || closure.trim().length === 0) {
    errors.push("Closure / Item Description is required.");
  }
  if (!product || product.trim().length === 0) {
    errors.push("Product Name / Application is required.");
  }
  if (!specifications || specifications.trim().length === 0) {
    errors.push("Technical Specifications text is required.");
  }

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

    const isBottle = type === 'SV-BT';
    const warningLimit = isBottle ? 0.25 : 0.10;
    const ceilingLimit = isBottle ? 0.60 : 0.30;

    // Tolerance Analysis
    if (maxToleranceFound > warningLimit) {
      warnings.push(`Warning: Tolerance ${parsedTolerance || 'not specified'} exceeds standard high-precision threshold of ±${warningLimit.toFixed(2)}mm for ${isBottle ? 'Bottle' : 'Cap/Lid'}.`);
      complianceStatus = 'Warning';
    }
    if (maxToleranceFound > ceilingLimit) {
      errors.push(`Critical: Tolerance ${parsedTolerance || 'not specified'} exceeds safety ceiling of ±${ceilingLimit.toFixed(2)}mm for ${isBottle ? 'Bottle' : 'Cap/Lid'}.`);
      complianceStatus = 'Failed';
    }

    // Material Suitability Rule
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
    complianceStatus,
    parsedTolerance: parsedTolerance || 'Not specified'
  };
};

function ProductsPage({ products, productsLoading, triggerProductInquiry, apiBase, onRefresh }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'SV-CL',
    codeSuffix: '',
    database: 'DRW-2026-001',
    closure: '',
    product: '',
    specifications: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [liveAnalysis, setLiveAnalysis] = useState({
    isValid: false,
    errors: [],
    warnings: [],
    complianceStatus: 'Passed',
    parsedTolerance: 'Not specified'
  });

  // Run live rules check as the user inputs details
  useEffect(() => {
    const analysis = runLocalRulesEngine(formData);
    setLiveAnalysis(analysis);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setFormData(prev => ({ ...prev, type }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.codeSuffix.trim()) {
      errors.codeSuffix = 'Product Code suffix is required (e.g. 28MM)';
    }
    if (!formData.database.trim()) {
      errors.database = 'Drawing reference is required (e.g. DRW-2026-001)';
    }
    if (!formData.closure.trim()) {
      errors.closure = 'Closure / Item type description is required';
    }
    if (!formData.product.trim()) {
      errors.product = 'Product name is required';
    }
    if (!formData.specifications.trim()) {
      errors.specifications = 'Specifications are required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (liveAnalysis.complianceStatus === 'Failed') {
      setSubmitError('Cannot submit: Rules engine detected critical compliance errors. Resolve them to continue.');
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');

    const payload = {
      Maintains: `${formData.type}-${formData.codeSuffix.trim().toUpperCase()}`,
      database: formData.database.trim(),
      closure: formData.closure.trim(),
      product: formData.product.trim(),
      specifications: formData.specifications.trim(),
      status: 'Active'
    };

    try {
      const res = await fetch(`${apiBase}/product_specification_technical_dra`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({
          type: 'SV-CL',
          codeSuffix: '',
          database: 'DRW-2026-001',
          closure: '',
          product: '',
          specifications: ''
        });
        if (onRefresh) onRefresh();
      } else {
        setSubmitError(data.message || 'Failed to save specification.');
      }
    } catch (err) {
      setSubmitError('Network error: Ensure the backend server is running and accessible.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <section className="section-products fade-in">
      <div className="products-header-row">
        <div className="products-intro">
          <h2 className="section-title">B2B Product Specifications Catalog</h2>
          <p className="section-subtitle">Browse our verified active closures catalog, direct from our production library. Click any product to request a batch quote.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} style={{ marginRight: '6px' }} />
          Add Specification
        </button>
      </div>

      {productsLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading specifications catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state glass-panel">
          <h3>No Active Products Listed</h3>
          <p>Please contact our sales desk for custom cap design requirements.</p>
        </div>
      ) : (
        <div className="products-catalog-grid">
          {products.map(product => (
            <div key={product.id} className="public-product-card glass-panel">
              <div className="card-header-badge">
                <span className="product-code">{product.Maintains}</span>
                <span className="drawing-ref">{product.database}</span>
              </div>

              <div className="card-body">
                <h3>{product.closure}</h3>
                <p className="product-desc-title">{product.product}</p>

                <div className="specs-details">
                  <h4>Technical Specifications:</h4>
                  <p className="specs-content-text">{product.specifications}</p>
                </div>

                <div className="compliance-row">
                  <span className="compliance-label">Audit Engine Status:</span>
                  <span className={`status-badge-inline compliance-${product.compliance?.complianceStatus.toLowerCase() || 'passed'}`}>
                    {product.compliance?.complianceStatus || 'Passed'}
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <button
                  className="btn btn-sm btn-primary w-full"
                  onClick={() => triggerProductInquiry(product.Maintains)}
                >
                  <MessageSquare size={14} style={{ marginRight: '6px' }} />
                  Inquire &amp; Get Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal Overlay */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Add New Product Specification</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {submitError && (
                  <div className="live-validation-section" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', backgroundColor: 'rgba(239, 68, 68, 0.08)', marginBottom: '1.25rem' }}>
                    <div className="live-validation-title" style={{ color: '#f87171' }}>
                      <AlertCircle size={14} /> Submission Error
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#f87171', marginTop: '0.25rem' }}>{submitError}</p>
                  </div>
                )}

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Item / Prefix Type</label>
                    <select
                      className="form-select-control"
                      name="type"
                      value={formData.type}
                      onChange={handleTypeChange}
                    >
                      <option value="SV-CL">Cap / Lid (SV-CL)</option>
                      <option value="SV-BT">Bottle / Vial (SV-BT)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Code Suffix</label>
                    <div className="input-with-prefix">
                      <span className="input-prefix-span">{formData.type}-</span>
                      <input
                        type="text"
                        name="codeSuffix"
                        className="form-input"
                        placeholder="28MM or 1L"
                        value={formData.codeSuffix}
                        onChange={handleInputChange}
                      />
                    </div>
                    {formErrors.codeSuffix && <span className="form-error">{formErrors.codeSuffix}</span>}
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Drawing Reference</label>
                    <input
                      type="text"
                      name="database"
                      className="form-input"
                      placeholder="DRW-2026-001"
                      value={formData.database}
                      onChange={handleInputChange}
                    />
                    {formErrors.database && <span className="form-error">{formErrors.database}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Closure / Item Type</label>
                    <input
                      type="text"
                      name="closure"
                      className="form-input"
                      placeholder="e.g. 28mm Cap or 1 Litre Bottle"
                      value={formData.closure}
                      onChange={handleInputChange}
                    />
                    {formErrors.closure && <span className="form-error">{formErrors.closure}</span>}
                  </div>
                </div>

                <div className="form-row-single">
                  <div className="form-group">
                    <label className="form-label">Product Name / Application</label>
                    <input
                      type="text"
                      name="product"
                      className="form-input"
                      placeholder="e.g. Carbonated Soft Drink Closure Blue"
                      value={formData.product}
                      onChange={handleInputChange}
                    />
                    {formErrors.product && <span className="form-error">{formErrors.product}</span>}
                  </div>
                </div>

                <div className="form-row-single">
                  <div className="form-group">
                    <label className="form-label">Technical Specifications (Materials &amp; Tolerances)</label>
                    <textarea
                      name="specifications"
                      className="form-textarea"
                      placeholder="e.g. Material: HDPE, Outer Diameter: 28.2mm ± 0.05mm, FDA Approved food-grade."
                      value={formData.specifications}
                      onChange={handleInputChange}
                    />
                    {formErrors.specifications && <span className="form-error">{formErrors.specifications}</span>}
                  </div>
                </div>

                {/* Real-time rules engine validation panel */}
                <div className="live-validation-section">
                  <div className="live-validation-title">
                    <Info size={14} /> Live Quality &amp; Compliance Audit
                  </div>

                  <div className="live-badge-row">
                    <span className="status-label">Compliance Status:</span>
                    <span className={`status-badge-inline compliance-${liveAnalysis.complianceStatus.toLowerCase()}`}>
                      {liveAnalysis.complianceStatus}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                    <span>Parsed Tolerance:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{liveAnalysis.parsedTolerance}</strong>
                  </div>

                  <ul className="live-feedback-list">
                    {liveAnalysis.errors.length === 0 && liveAnalysis.warnings.length === 0 && (
                      <li className="live-feedback-item success-item">
                        <CheckCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>All inputs conform to precision limits and certification rules.</span>
                      </li>
                    )}
                    {liveAnalysis.errors.map((err, idx) => (
                      <li key={`err-${idx}`} className="live-feedback-item error-item">
                        <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{err}</span>
                      </li>
                    ))}
                    {liveAnalysis.warnings.map((warn, idx) => (
                      <li key={`warn-${idx}`} className="live-feedback-item warning-item">
                        <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{warn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitLoading || liveAnalysis.complianceStatus === 'Failed'}
                >
                  {submitLoading ? 'Saving...' : 'Add Specification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductsPage;

