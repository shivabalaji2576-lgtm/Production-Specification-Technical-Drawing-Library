import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const SettingsView = ({
  settingsSuccess,
  settingsError,
  settingsForm,
  setSettingsForm,
  handleUpdateProfile,
  settingsLoading,
  setCurrentView
}) => {
  return (
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
  );
};

export default SettingsView;
