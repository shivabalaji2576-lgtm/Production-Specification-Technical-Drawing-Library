import React, { useState, useEffect } from 'react';
import viteLogo from './assets/vite.svg';
import reactLogo from './assets/react.svg';
import heroImage from './assets/hero.png';
import { 
  Database, 
  PlusCircle, 
  FileText, 
  BarChart3, 
  ClipboardList, 
  LogOut, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Edit, 
  ArrowRight, 
  FileSpreadsheet, 
  Plus, 
  User,
  Activity,
  Calendar,
  Lock,
  Settings
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://sv-closures-backend.onrender.com/api';

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Settings Credentials State
  const [settingsForm, setSettingsForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'entry-form', 'detail', 'reports', 'settings'
  const [selectedSpecId, setSelectedSpecId] = useState(null);
  
  // Data States
  const [records, setRecords] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    total: 0, active: 0, completed: 0, archived: 0, warnings: 0, failed: 0
  });
  const [loading, setLoading] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Entry Form & Edit Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    Maintains: '',
    database: '',
    closure: '',
    product: '',
    specifications: '',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [rulesAnalysis, setRulesAnalysis] = useState({
    isValid: true, errors: [], warnings: [], metrics: { complianceStatus: 'Passed', parsedTolerance: 'Not specified' }
  });

  // Selected Item details for Detail View
  const [detailData, setDetailData] = useState(null);

  // Initial load
  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboardData();
      fetchRecords();
    }
  }, [isLoggedIn, statusFilter, search, page]);

  // Live evaluation of rules engine on entry form updates
  useEffect(() => {
    if (currentView === 'entry-form' || isEditing) {
      const delayDebounceFn = setTimeout(() => {
        if (formData.Maintains || formData.database || formData.closure || formData.product || formData.specifications) {
          evaluateLiveRules();
        }
      }, 400);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [formData, currentView, isEditing]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      if (data.success) {
        setDashboardStats(data.summary);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/product_specification_technical_dra?status=${statusFilter}&search=${search}&page=${page}&limit=10`
      );
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching specs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setIsLoggedIn(true);
        setCurrentView('dashboard');
        setAuthError('');
      } else {
        setAuthError(data.message || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      setAuthError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    if (settingsForm.username.trim().length < 3) {
      setSettingsError('Username must be at least 3 characters.');
      return;
    }
    if (settingsForm.password.length < 4) {
      setSettingsError('Password must be at least 4 characters.');
      return;
    }
    if (settingsForm.password !== settingsForm.confirmPassword) {
      setSettingsError('Passwords do not match.');
      return;
    }

    setSettingsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          username: settingsForm.username,
          password: settingsForm.password
        })
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSuccess('Credentials updated successfully! Logging you out...');
        setSettingsForm({ username: '', password: '', confirmPassword: '' });
        setTimeout(() => {
          setIsLoggedIn(false);
          setUser(null);
          setSettingsSuccess('');
          setLoginForm({ username: '', password: '' });
        }, 2000);
      } else {
        setSettingsError(data.message || 'Failed to update credentials.');
      }
    } catch (err) {
      setSettingsError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setSettingsLoading(false);
    }
  };


  const evaluateLiveRules = async () => {
    try {
      const res = await fetch(`${API_BASE}/engine/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setRulesAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Rules validation failed:', err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateLocalFields = () => {
    const errors = {};
    if (!formData.Maintains) errors.Maintains = 'Product Code (Maintains) is required.';
    else if (!/^SV-CL-[A-Z0-9-]+$/i.test(formData.Maintains)) {
      errors.Maintains = 'Must match format SV-CL-[Alphanumeric]';
    }

    if (!formData.database) errors.database = 'Drawing Reference (database) is required.';
    else if (!/^DRW-\d{4}-\d{3,5}$/.test(formData.database)) {
      errors.database = 'Must match format DRW-[YYYY]-[Sequential No]';
    }

    if (!formData.closure.trim()) errors.closure = 'Closure Dimensions (closure) is required.';
    if (!formData.product.trim()) errors.product = 'Product Name (product) is required.';
    if (!formData.specifications.trim()) errors.specifications = 'Specifications is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateLocalFields()) return;

    try {
      const url = isEditing 
        ? `${API_BASE}/product_specification_technical_dra/${editId}`
        : `${API_BASE}/product_specification_technical_dra`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        // Reset form and go back to dashboard
        setFormData({
          Maintains: '', database: '', closure: '', product: '', specifications: '', status: 'Active'
        });
        setIsEditing(false);
        setEditId(null);
        setCurrentView('dashboard');
        fetchDashboardData();
        fetchRecords();
      } else {
        alert(data.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleEditSpec = (spec) => {
    setFormData({
      Maintains: spec.Maintains,
      database: spec.database,
      closure: spec.closure,
      product: spec.product,
      specifications: spec.specifications,
      status: spec.status
    });
    setEditId(spec.id);
    setIsEditing(true);
    setCurrentView('entry-form');
  };

  const handleViewDetail = async (id) => {
    setSelectedSpecId(id);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/product_specification_technical_dra/${id}/detail`);
      const data = await res.json();
      if (data.success) {
        setDetailData(data);
        setCurrentView('detail');
      }
    } catch (err) {
      console.error('Error fetching detail data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    let nextStatus = 'Active';
    if (currentStatus === 'Active') nextStatus = 'Completed';
    else if (currentStatus === 'Completed') nextStatus = 'Archived';
    else nextStatus = 'Active';

    try {
      const res = await fetch(`${API_BASE}/product_specification_technical_dra/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData();
        fetchRecords();
        if (currentView === 'detail' && selectedSpecId === id) {
          handleViewDetail(id);
        }
      }
    } catch (err) {
      console.error('Error changing status:', err);
    }
  };



  const exportCSV = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/summary`);
      const data = await res.json();
      if (data.success) {
        const headers = ['ID', 'Product Code', 'Drawing Ref', 'Closure Type', 'Product Name', 'Status', 'Tolerance', 'Compliance', 'Created At'];
        const rows = data.specifications.map(s => [
          s.id,
          `"${s.ProductCode}"`,
          `"${s.DrawingRef}"`,
          `"${s.ClosureType}"`,
          `"${s.ProductName}"`,
          `"${s.Status}"`,
          `"${s.Tolerance}"`,
          `"${s.Compliance}"`,
          `"${s.CreatedAt}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
          + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Sv_Closures_Product_Specs_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Exporting CSV failed:', err);
    }
  };

  // Helper rendering compliance badge
  const renderComplianceBadge = (status) => {
    if (status === 'Passed') {
      return (
        <span className="badge badge-pass">
          <CheckCircle2 className="w-3.5 h-3.5" /> Passed
        </span>
      );
    }
    if (status === 'Warning') {
      return (
        <span className="badge badge-warn">
          <AlertTriangle className="w-3.5 h-3.5" /> Warning
        </span>
      );
    }
    return (
      <span className="badge badge-fail">
        <XCircle className="w-3.5 h-3.5" /> Failure
      </span>
    );
  };

  // Login View
  if (!isLoggedIn) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">SV</div>
            <h2 className="login-title">Sv Closures</h2>
            <p className="login-subtitle">Product Specification & Technical Drawing Library</p>
          </div>

          {/* Success / Error Messages */}
          {authSuccess && (
            <div className="auth-msg auth-msg-success">
              <CheckCircle2 className="w-4 h-4" /> {authSuccess}
            </div>
          )}
          {authError && (
            <div className="auth-msg auth-msg-error">
              <XCircle className="w-4 h-4" /> {authError}
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-username">Username</label>
              <input 
                type="text" 
                id="login-username"
                className="form-input" 
                placeholder="Enter username" 
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input 
                type="password" 
                id="login-password"
                className="form-input" 
                placeholder="Enter password" 
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={authLoading}>
              {authLoading ? 'Signing in...' : (<>Access Dashboard <ArrowRight className="w-4 h-4" /></>)}
            </button>
            <p className="auth-hint">Default Credentials: <strong>admin</strong> / <strong>supervisor</strong></p>
          </form>
        </div>
      </div>
    );
  }


  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">SV</div>
          <div>
            <span className="logo-text">SV Closures</span>
            <span className="logo-sub">Tech Library</span>
          </div>
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <div 
                className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => { setCurrentView('dashboard'); setIsEditing(false); }}
              >
                <Database className="w-4 h-4" /> Dashboard
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${currentView === 'entry-form' && !isEditing ? 'active' : ''}`}
                onClick={() => {
                  setFormData({ Maintains: '', database: '', closure: '', product: '', specifications: '', status: 'Active' });
                  setIsEditing(false);
                  setRulesAnalysis({
                    isValid: true, errors: [], warnings: [], metrics: { complianceStatus: 'Passed', parsedTolerance: 'Not specified' }
                  });
                  setCurrentView('entry-form');
                }}
              >
                <PlusCircle className="w-4 h-4" /> Add Specification
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${currentView === 'reports' ? 'active' : ''}`}
                onClick={() => setCurrentView('reports')}
              >
                <BarChart3 className="w-4 h-4" /> Reports & Analytics
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
                onClick={() => {
                  setSettingsError('');
                  setSettingsSuccess('');
                  setSettingsForm({ username: user?.name || '', password: '', confirmPassword: '' });
                  setCurrentView('settings');
                }}
              >
                <Settings className="w-4 h-4" /> Account Settings
              </div>
            </li>
          </ul>
        </nav>


        {/* User Info Footer */}
        <div className="user-profile">
          <div className="avatar">
            {user?.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="action-btn" 
            title="Logout" 
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none' }}
          >
            <LogOut className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="main-content">
        
        {/* Top Sticky Header */}
        <header className="top-header">
          <div className="header-title-section">
            {currentView === 'dashboard' && (
              <>
                <h1>Closure Spec Dashboard</h1>
                <p>Verify drawing codes, dimensions tolerances, and material records</p>
              </>
            )}
            {currentView === 'entry-form' && (
              <>
                <h1>{isEditing ? 'Modify Specification' : 'New Closure Specification'}</h1>
                <p>Write product standards and review live compliance feedback</p>
              </>
            )}
            {currentView === 'detail' && (
              <>
                <h1>Specification details</h1>
                <p>Drawing specs and compliance diagnosis</p>
              </>
            )}
            {currentView === 'reports' && (
              <>
                <h1>Quality Reports & Trend Analytics</h1>
                <p>Distribution stats, trend indicators, and CSV database exports</p>
              </>
            )}
            {currentView === 'settings' && (
              <>
                <h1>Account Settings</h1>
                <p>Manage your general credentials and dashboard security options</p>
              </>
            )}
          </div>


          <div className="header-actions">
            <button onClick={exportCSV} className="btn btn-primary">
              <FileSpreadsheet className="w-4 h-4" /> Export DB
            </button>
          </div>
        </header>

        {/* Page Body Router */}
        <div className="page-container">
          
          {/* VIEW: DASHBOARD */}
          {currentView === 'dashboard' && (
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
                          <th>Dimensions (closure)</th>
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
                            <td>{renderComplianceBadge(row.compliance.complianceStatus)}</td>
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
          )}

          {/* VIEW: ENTRY FORM & EDIT FORM */}
          {currentView === 'entry-form' && (
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
                        placeholder="e.g., SV-CL-28MM"
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
                      <label className="form-label" htmlFor="closure">Closure Type & Dimensions (closure) *</label>
                      <input 
                        type="text" 
                        id="closure"
                        name="closure"
                        className="form-input" 
                        placeholder="e.g., 28mm Soft Drink Cap"
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
                      {renderComplianceBadge(rulesAnalysis.metrics.complianceStatus)}
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
          )}

          {/* VIEW: DETAIL & HISTORY */}
          {currentView === 'detail' && detailData && (
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
                      <span className="info-label">Closure Dimension</span>
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
                        {renderComplianceBadge(detailData.specification.analysis.metrics.complianceStatus)}
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
          )}

          {/* VIEW: REPORTS & ANALYTICS */}
          {currentView === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Aggregation Summary Row */}
              <section className="summary-grid">
                <div className="summary-card card-blue">
                  <div className="summary-card-header">
                    <span>Database Specs</span>
                    <Database className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="summary-card-val">{dashboardStats.total}</div>
                  <div className="summary-card-desc">Total codes tracked</div>
                </div>
                <div className="summary-card card-green">
                  <div className="summary-card-header">
                    <span>Active Status</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="summary-card-val">
                    {dashboardStats.total > 0 
                      ? Math.round((dashboardStats.active / dashboardStats.total) * 100) 
                      : 0}%
                  </div>
                  <div className="summary-card-desc">Percentage of active codes</div>
                </div>
                <div className="summary-card card-yellow">
                  <div className="summary-card-header">
                    <span>Compliance Health</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="summary-card-val">
                    {dashboardStats.total > 0 
                      ? Math.round(((dashboardStats.total - dashboardStats.failed) / dashboardStats.total) * 100) 
                      : 100}%
                  </div>
                  <div className="summary-card-desc">Passed or warned specifications</div>
                </div>
              </section>

              {/* Dynamic premium SVG charts */}
              <div className="charts-grid">
                
                {/* Chart 1: Status Distribution (Donut Chart) */}
                <div className="chart-card">
                  <h3 className="chart-title">Status Distribution Breakdown</h3>
                  <div className="chart-box">
                    <svg viewBox="0 0 100 100" width="160" height="160">
                      {/* Calculations for slices based on total */}
                      {(() => {
                        const total = dashboardStats.total || 1;
                        const activePct = (dashboardStats.active / total) * 100;
                        const completedPct = (dashboardStats.completed / total) * 100;
                        const archivedPct = (dashboardStats.archived / total) * 100;

                        // Stroke dashes calculations
                        const circ = 2 * Math.PI * 30; // Radius = 30
                        const activeDash = (activePct / 100) * circ;
                        const completedDash = (completedPct / 100) * circ;
                        const archivedDash = (archivedPct / 100) * circ;

                        return (
                          <>
                            {/* Outer glowing glow ring */}
                            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(99, 102, 241, 0.04)" strokeWidth="6" />
                            
                            {/* Archived slice */}
                            <circle 
                              cx="50" cy="50" r="30" fill="none" 
                              stroke="#6b7280" strokeWidth="10" 
                              strokeDasharray={`${archivedDash} ${circ - archivedDash}`} 
                              strokeDashoffset={0}
                            />
                            
                            {/* Completed slice */}
                            <circle 
                              cx="50" cy="50" r="30" fill="none" 
                              stroke="#e50914" strokeWidth="10" 
                              strokeDasharray={`${completedDash} ${circ - completedDash}`} 
                              strokeDashoffset={-archivedDash}
                            />
                            
                            {/* Active slice */}
                            <circle 
                              cx="50" cy="50" r="30" fill="none" 
                              stroke="#10b981" strokeWidth="10" 
                              strokeDasharray={`${activeDash} ${circ - activeDash}`} 
                              strokeDashoffset={-(archivedDash + completedDash)}
                            />

                            {/* Center Cutout text */}
                            <circle cx="50" cy="50" r="22" fill="#121212" />
                            <text x="50" y="47" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">
                              {dashboardStats.total}
                            </text>
                            <text x="50" y="58" textAnchor="middle" fill="#9ca3af" fontSize="5" fontWeight="500" letterSpacing="0.05em">
                              TOTAL CODES
                            </text>
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                  
                  {/* Legend */}
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: '#10b981' }} />
                      <span>Active ({dashboardStats.active})</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: '#e50914' }} />
                      <span>Completed ({dashboardStats.completed})</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: '#6b7280' }} />
                      <span>Archived ({dashboardStats.archived})</span>
                    </div>
                  </div>

                </div>

                {/* Chart 2: Compliance rates (Bar Chart) */}
                <div className="chart-card">
                  <h3 className="chart-title">Compliance Metrics Status</h3>
                  <div className="chart-box" style={{ flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
                    {/* Render mock bar chart based on actual stats */}
                    {(() => {
                      const total = dashboardStats.total || 1;
                      const passedCount = dashboardStats.total - dashboardStats.warnings - dashboardStats.failed;
                      const passedPct = Math.round((passedCount / total) * 100);
                      const warnPct = Math.round((dashboardStats.warnings / total) * 100);
                      const failPct = Math.round((dashboardStats.failed / total) * 100);

                      return (
                        <div style={{ width: '100%', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {/* Passed Bar */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                              <span>Passed Safety Standards</span>
                              <span className="font-semibold text-emerald-400">{passedCount} specs ({passedPct}%)</span>
                            </div>
                            <div style={{ height: 10, width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${passedPct}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 5 }} />
                            </div>
                          </div>

                          {/* Warning Bar */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                              <span>Minor Tolerance Warnings (&gt;0.1mm)</span>
                              <span className="font-semibold text-amber-400">{dashboardStats.warnings} specs ({warnPct}%)</span>
                            </div>
                            <div style={{ height: 10, width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${warnPct}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: 5 }} />
                            </div>
                          </div>

                          {/* Failure Bar */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                              <span>Critical Safety Failures (&gt;0.3mm)</span>
                              <span className="font-semibold text-rose-400">{dashboardStats.failed} specs ({failPct}%)</span>
                            </div>
                            <div style={{ height: 10, width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${failPct}%`, background: 'linear-gradient(90deg, #ef4444, #f87171)', borderRadius: 5 }} />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="chart-legend" style={{ justifyContent: 'center' }}>
                    <div className="legend-item">
                      <span className="text-gray-400 text-xs">Quality thresholds: Warnings fire at &gt;0.1mm. Failures block saves at &gt;0.3mm.</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* VIEW: ACCOUNT SETTINGS */}
          {currentView === 'settings' && (
            <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
              <div className="content-card">
                <h2 className="card-title">Update Credentials</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Update your dashboard username and password. Once changed, you will be signed out and must log in using your new credentials.
                </p>

                {/* Error / Success Alerts */}
                {settingsSuccess && (
                  <div className="auth-msg auth-msg-success" style={{ marginBottom: '1.25rem' }}>
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {settingsSuccess}
                  </div>
                )}
                {settingsError && (
                  <div className="auth-msg auth-msg-error" style={{ marginBottom: '1.25rem' }}>
                    <XCircle className="w-4 h-4 flex-shrink-0" /> {settingsError}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="settings-username">New Username *</label>
                    <input 
                      type="text" 
                      id="settings-username"
                      className="form-input" 
                      placeholder="Enter new username" 
                      value={settingsForm.username}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, username: e.target.value }))}
                      required
                      autoComplete="off"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="settings-password">New Password * (min. 4 characters)</label>
                    <input 
                      type="password" 
                      id="settings-password"
                      className="form-input" 
                      placeholder="Enter new password" 
                      value={settingsForm.password}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="settings-confirm-password">Confirm Password *</label>
                    <input 
                      type="password" 
                      id="settings-confirm-password"
                      className="form-input" 
                      placeholder="Confirm new password" 
                      value={settingsForm.confirmPassword}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={settingsLoading}>
                      {settingsLoading ? 'Saving changes...' : 'Update Credentials'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setCurrentView('dashboard')} 
                      className="btn btn-secondary"
                      disabled={settingsLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}

