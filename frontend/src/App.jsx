import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import EntryFormView from './components/EntryFormView';
import DetailView from './components/DetailView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://sv-closures-backend.onrender.com/api';

function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'supervisor' });
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
    else if (!/^(SV-CL|SV-BT)-[A-Z0-9-]+$/i.test(formData.Maintains)) {
      errors.Maintains = 'Must match format SV-CL-[Alphanumeric] or SV-BT-[Alphanumeric]';
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

  if (!isLoggedIn) {
    return (
      <LoginView
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleLogin={handleLogin}
        authLoading={authLoading}
        authSuccess={authSuccess}
        authError={authError}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        setFormData={setFormData}
        setRulesAnalysis={setRulesAnalysis}
        setSettingsError={setSettingsError}
        setSettingsSuccess={setSettingsSuccess}
        setSettingsForm={setSettingsForm}
        user={user}
        setIsLoggedIn={setIsLoggedIn}
      />

      {/* Main Content Pane */}
      <main className="main-content">
        
        {/* Top Sticky Header */}
        <Header
          currentView={currentView}
          isEditing={isEditing}
          exportCSV={exportCSV}
        />

        {/* Page Body Router */}
        <div className="page-container">
          
          {/* VIEW: DASHBOARD */}
          {currentView === 'dashboard' && (
            <DashboardView
              dashboardStats={dashboardStats}
              search={search}
              setSearch={setSearch}
              setPage={setPage}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              loading={loading}
              records={records}
              page={page}
              totalPages={totalPages}
              handleViewDetail={handleViewDetail}
              handleEditSpec={handleEditSpec}
              handleStatusChange={handleStatusChange}
            />
          )}

          {/* VIEW: ENTRY FORM & EDIT FORM */}
          {currentView === 'entry-form' && (
            <EntryFormView
              isEditing={isEditing}
              formData={formData}
              handleFormChange={handleFormChange}
              handleFormSubmit={handleFormSubmit}
              formErrors={formErrors}
              rulesAnalysis={rulesAnalysis}
              setCurrentView={setCurrentView}
              setIsEditing={setIsEditing}
            />
          )}

          {/* VIEW: DETAIL & HISTORY */}
          {currentView === 'detail' && detailData && (
            <DetailView
              detailData={detailData}
              handleEditSpec={handleEditSpec}
              handleStatusChange={handleStatusChange}
            />
          )}

          {/* VIEW: REPORTS & ANALYTICS */}
          {currentView === 'reports' && (
            <ReportsView
              dashboardStats={dashboardStats}
            />
          )}

          {/* VIEW: ACCOUNT SETTINGS */}
          {currentView === 'settings' && (
            <SettingsView
              settingsSuccess={settingsSuccess}
              settingsError={settingsError}
              settingsForm={settingsForm}
              setSettingsForm={setSettingsForm}
              handleUpdateProfile={handleUpdateProfile}
              settingsLoading={settingsLoading}
              setCurrentView={setCurrentView}
            />
          )}

        </div>
      </main>

    </div>
  );
}

export default App;
