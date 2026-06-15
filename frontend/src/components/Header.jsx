import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

export const Header = ({ currentView, isEditing, exportCSV }) => {
  return (
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
  );
};
