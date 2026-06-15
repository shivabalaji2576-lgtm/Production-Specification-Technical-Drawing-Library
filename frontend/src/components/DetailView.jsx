import React from 'react';
import { Edit, Activity } from 'lucide-react';
import ComplianceBadge from './ComplianceBadge';

const DetailView = ({
  detailData,
  handleEditSpec,
  handleStatusChange
}) => {
  return (
    <div className="detail-layout">
      {/* Left Column: Spec card & details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Main Spec Info Card */}
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title" style={{ border: 'none', marginBottom: 0, paddingBottom: 0 }}>
              Spec: {detailData.specification.Maintains}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => handleEditSpec(detailData.specification)} 
                className="btn btn-secondary"
              >
                <Edit className="w-4 h-4" /> Modify
              </button>
              <button 
                onClick={() => handleStatusChange(detailData.specification.id, detailData.specification.status)} 
                className="btn btn-secondary"
              >
                Change Status
              </button>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-block">
              <span className="info-label">Product Name</span>
              <span className="info-value text-white">{detailData.specification.product}</span>
            </div>
            <div className="info-block">
              <span className="info-label">Drawing Reference</span>
              <span className="info-value font-mono text-white">{detailData.specification.database}</span>
            </div>
            <div className="info-block">
              <span className="info-label">Closure/Bottle Dimension</span>
              <span className="info-value text-white">{detailData.specification.closure}</span>
            </div>
            <div className="info-block">
              <span className="info-label">Current Status</span>
              <span className="info-value">
                <span className={`badge ${
                  detailData.specification.status === 'Active' ? 'badge-active' : 
                  detailData.specification.status === 'Completed' ? 'badge-completed' : 'badge-archived'
                }`}>
                  <span className="badge-dot" /> {detailData.specification.status}
                </span>
              </span>
            </div>
          </div>

          <div className="info-block" style={{ gridColumn: 'span 2' }}>
            <span className="info-label">Material & Tolerance Sheet Content</span>
            <div className="info-value-block">
              {detailData.specification.specifications}
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Compliance Rules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Engine Diagnostics */}
        <div className="rules-preview-panel">
          <div className="preview-header">
            <Activity className="w-5 h-5" />
            <span>Engine Diagnosis</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <span className="text-gray-400 font-semibold text-xs uppercase block">Status</span>
              <div style={{ marginTop: '0.25rem' }}>
                <ComplianceBadge status={detailData.specification.analysis.metrics.complianceStatus} />
              </div>
            </div>
            <div>
              <span className="text-gray-400 font-semibold text-xs uppercase block">Parsed Tolerance</span>
              <span className="text-white font-medium">{detailData.specification.analysis.metrics.parsedTolerance}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold text-xs uppercase block">Compliance Checks</span>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', listStyle: 'none' }}>
                <li style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: detailData.specification.analysis.isValid ? '#10b981' : '#ef4444' }} />
                  Format codes validation
                </li>
                <li style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: detailData.specification.analysis.metrics.isFoodGrade ? '#10b981' : '#fbbf24' }} />
                  Food grade certification
                </li>
                <li style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: detailData.specification.analysis.metrics.isPharmaGrade ? '#10b981' : '#fbbf24' }} />
                  Pharma grade validation
                </li>
              </ul>
            </div>

            {detailData.specification.analysis.warnings.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                <span className="text-amber-400 font-semibold text-xs block mb-1">Warnings Summary</span>
                <ul className="preview-list">
                  {detailData.specification.analysis.warnings.map((w, idx) => (
                    <li key={idx} className="preview-item warning" style={{ padding: '0.35rem' }}>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DetailView;
