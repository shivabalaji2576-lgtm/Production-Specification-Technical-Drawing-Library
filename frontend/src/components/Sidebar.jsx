import React from 'react';
import { Database, PlusCircle, BarChart3, Settings, LogOut } from 'lucide-react';

export const Sidebar = ({
  currentView,
  setCurrentView,
  isEditing,
  setIsEditing,
  setFormData,
  setRulesAnalysis,
  setSettingsError,
  setSettingsSuccess,
  setSettingsForm,
  user,
  setIsLoggedIn
}) => {
  return (
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
  );
};
