import React from 'react';
import { Activity, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import ComplianceBadge from './ComplianceBadge';

const EntryFormView = ({
  isEditing,
  formData,
  handleFormChange,
  handleFormSubmit,
  formErrors,
  rulesAnalysis,
  setCurrentView,
  setIsEditing
}) => {
  return (
    <div className="detail-layout">
      {/* Form Entry Field Box */}
      <div className="content-card">
        <h2 className="card-title">
          {isEditing ? `Edit: ${formData.Maintains}` : 'Create New Specification'}
        </h2>
        
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-grid">
            
            <div className="form-group">
              <label className="form-label" htmlFor="Maintains">Product Code (Maintains) *</label>
              <input 
                type="text" 
                id="Maintains"
                name="Maintains"
                className="form-input" 
                placeholder="e.g., SV-CL-28MM or SV-BT-1L"
                value={formData.Maintains}
                onChange={handleFormChange}
                disabled={isEditing} // Product code immutable during edit
                required
              />
              {formErrors.Maintains && <span className="form-error">{formErrors.Maintains}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="database">Drawing Reference (database) *</label>
              <input 
                type="text" 
                id="database"
                name="database"
                className="form-input" 
                placeholder="e.g., DRW-2026-001"
                value={formData.database}
                onChange={handleFormChange}
                required
              />
              {formErrors.database && <span className="form-error">{formErrors.database}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="closure">Closure/Bottle Dimensions (closure) *</label>
              <input 
                type="text" 
                id="closure"
                name="closure"
                className="form-input" 
                placeholder="e.g., 28mm Beverage Cap or 1L Bottle Finish"
                value={formData.closure}
                onChange={handleFormChange}
                required
              />
              {formErrors.closure && <span className="form-error">{formErrors.closure}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="product">Product Name & Grade (product) *</label>
              <input 
                type="text" 
                id="product"
                name="product"
                className="form-input" 
                placeholder="e.g., Carbonated Soft Drink Blue"
                value={formData.product}
                onChange={handleFormChange}
                required
              />
              {formErrors.product && <span className="form-error">{formErrors.product}</span>}
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label" htmlFor="specifications">Material Standards & Tolerances (specifications) *</label>
              <textarea 
                id="specifications"
                name="specifications"
                className="form-textarea" 
                placeholder="Define materials and dimensions with tolerances (e.g. Material: HDPE, outer diameter: 28.2mm ± 0.05mm, height: 15.2mm ±0.03mm, FDA Approved food-grade)"
                value={formData.specifications}
                onChange={handleFormChange}
                required
              />
              {formErrors.specifications && <span className="form-error">{formErrors.specifications}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="status">Initial Status</label>
              <select 
                id="status"
                name="status"
                className="form-select-control"
                value={formData.status}
                onChange={handleFormChange}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Save Specification'}
            </button>
            <button 
              type="button" 
              onClick={() => { setCurrentView('dashboard'); setIsEditing(false); }} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Live Rules Engine Sidebar */}
      <div className="rules-preview-panel">
        <div className="preview-header">
          <Activity className="w-5 h-5" />
          <span>Real-time Rules evaluation</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          The business logic engine evaluates specifications automatically as you write.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Status Badge */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Compliance Grade
            </span>
            <div style={{ marginTop: '0.25rem' }}>
              <ComplianceBadge status={rulesAnalysis.metrics.complianceStatus} />
            </div>
          </div>

          {/* Parse metrics */}
          <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div>
              <span className="font-semibold text-gray-400">Parsed Tolerance:</span>{' '}
              <span style={{ color: '#fff' }}>{rulesAnalysis.metrics.parsedTolerance}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-400">Food Grade Certified:</span>{' '}
              <span style={{ color: rulesAnalysis.metrics.isFoodGrade ? '#34d399' : '#9ca3af' }}>
                {rulesAnalysis.metrics.isFoodGrade ? 'Yes' : 'Not identified'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-400">Pharma Grade Certified:</span>{' '}
              <span style={{ color: rulesAnalysis.metrics.isPharmaGrade ? '#34d399' : '#9ca3af' }}>
                {rulesAnalysis.metrics.isPharmaGrade ? 'Yes' : 'Not identified'}
              </span>
            </div>
          </div>

          {/* Errors & Warnings alerts list */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Engine Validation Logs
            </span>
            
            <ul className="preview-list">
              {rulesAnalysis.errors.length === 0 && rulesAnalysis.warnings.length === 0 && (
                <li className="preview-item success">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>All validations passed successfully. Specification meets safety criteria.</span>
                </li>
              )}
              
              {rulesAnalysis.errors.map((err, i) => (
                <li key={i} className="preview-item error">
                  <XCircle className="w-4 h-4 flex-shrink-0" style={{ marginTop: '2px' }} />
                  <span>{err}</span>
                </li>
              ))}

              {rulesAnalysis.warnings.map((warn, i) => (
                <li key={i} className="preview-item warning">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ marginTop: '2px' }} />
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EntryFormView;
