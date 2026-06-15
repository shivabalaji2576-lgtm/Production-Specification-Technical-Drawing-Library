import React from 'react';
import { Database, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ReportsView = ({ dashboardStats }) => {
  return (
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
              <span className="text-gray-400 text-xs">Quality thresholds: Caps warn at &gt;0.10mm / fail at &gt;0.30mm. Bottles warn at &gt;0.25mm / fail at &gt;0.60mm.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
