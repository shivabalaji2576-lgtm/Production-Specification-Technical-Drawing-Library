import React from 'react';
import { 
  AlertTriangle, 
  Database, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Eye, 
  Edit, 
  Activity 
} from 'lucide-react';
import ComplianceBadge from './ComplianceBadge';

const DashboardView = ({
  dashboardStats,
  search,
  setSearch,
  setPage,
  statusFilter,
  setStatusFilter,
  loading,
  records,
  page,
  totalPages,
  handleViewDetail,
  handleEditSpec,
  handleStatusChange
}) => {
  return (
    <>
      {/* Alert Indicator if any failures */}
      {dashboardStats.failed > 0 && (
        <div className="alert-banner">
          <AlertTriangle className="w-5 h-5" />
          <span><strong>Action Required:</strong> {dashboardStats.failed} product specification(s) currently fail the safety ceiling tolerance specifications limit (&gt; 0.3mm). Please check drawings.</span>
        </div>
      )}

      {/* Aggregation widgets */}
      <section className="summary-grid">
        <div className="summary-card card-blue">
          <div className="summary-card-header">
            <span>Total Specs</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="summary-card-val">{dashboardStats.total}</div>
          <div className="summary-card-desc">Closure codes recorded</div>
        </div>
        <div className="summary-card card-green">
          <div className="summary-card-header">
            <span>Active Specs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="summary-card-val">{dashboardStats.active}</div>
          <div className="summary-card-desc">Currently in production</div>
        </div>
        <div className="summary-card card-yellow">
          <div className="summary-card-header">
            <span>Tolerance Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="summary-card-val">{dashboardStats.warnings}</div>
          <div className="summary-card-desc">Specs with warnings (&gt;0.1mm)</div>
        </div>
        <div className="summary-card card-red">
          <div className="summary-card-header">
            <span>Safety Failures</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="summary-card-val">{dashboardStats.failed}</div>
          <div className="summary-card-desc">Specs failing limits (&gt;0.3mm)</div>
        </div>
      </section>

      {/* Filtering Area */}
      <section className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon w-4 h-4" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by code, product, drawing..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="filter-groups">
          <div className="filter-group">
            <span className="filter-label">Filter Status</span>
            <div className="tabs">
              {['All', 'Active', 'Completed', 'Archived'].map(tab => (
                <div 
                  key={tab} 
                  className={`tab ${statusFilter === tab ? 'active' : ''}`}
                  onClick={() => { setStatusFilter(tab); setPage(1); }}
                >
                  {tab}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Table */}
      <section className="table-wrapper">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No Closure Records Found</div>
            <p>Try resetting the filters or adding a new product specification code.</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Code (Maintains)</th>
                  <th>Drawing Reference (database)</th>
                  <th>Dimensions (closure/bottle)</th>
                  <th>Product Name (product)</th>
                  <th>State (status)</th>
                  <th>Compliance</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(row => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{row.Maintains}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        {row.database}
                      </span>
                    </td>
                    <td>{row.closure}</td>
                    <td>{row.product}</td>
                    <td>
                      <span className={`badge ${
                        row.status === 'Active' ? 'badge-active' : 
                        row.status === 'Completed' ? 'badge-completed' : 'badge-archived'
                      }`}>
                        <span className="badge-dot" /> {row.status}
                      </span>
                    </td>
                    <td>
                      <ComplianceBadge status={row.compliance.complianceStatus} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleViewDetail(row.id)} 
                          className="action-btn" 
                          title="View Specs & Logs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditSpec(row)} 
                          className="action-btn" 
                          title="Edit Spec"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(row.id, row.status)} 
                          className="action-btn" 
                          title="Toggle Status (Active/Completed/Archived)"
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination control */}
            <div className="pagination-bar">
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <div className="pagination-actions">
                <button 
                  className="pagination-btn" 
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <button 
                  className="pagination-btn" 
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default DashboardView;
