import React from 'react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

const LoginView = ({
  loginForm,
  setLoginForm,
  handleLogin,
  authLoading,
  authSuccess,
  authError
}) => {
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
};

export default LoginView;
