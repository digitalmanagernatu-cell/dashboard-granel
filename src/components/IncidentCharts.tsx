import type { Incident } from '../types/transfer';

interface IncidentChartsProps {
  incidents: Incident[];
}

// Icon components
function DocumentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function IncidentCharts({ incidents }: IncidentChartsProps) {
  // Calculate statistics
  const total = incidents.length;
  const open = incidents.filter(i => i.status.toLowerCase() === 'abierta').length;
  const closed = incidents.filter(i => i.status.toLowerCase() === 'cerrada').length;

  // Calculate incident types distribution
  const typesCounts: Record<string, number> = {};
  incidents.forEach(i => {
    const type = i.incidentType || 'Sin tipo';
    typesCounts[type] = (typesCounts[type] || 0) + 1;
  });

  // Sort types by count descending
  const sortedTypes = Object.entries(typesCounts).sort((a, b) => b[1] - a[1]);
  const maxTypeCount = sortedTypes.length > 0 ? sortedTypes[0][1] : 1;

  // Calculate donut chart percentages
  const openPercent = total > 0 ? (open / total) * 100 : 0;

  // CSS conic-gradient for donut chart (Abierta: #e2a29a, Cerrada: #d3d7c4)
  const donutGradient = total > 0
    ? `conic-gradient(#e2a29a 0% ${openPercent}%, #d3d7c4 ${openPercent}% 100%)`
    : 'conic-gradient(#e0e0e0 0% 100%)';

  // Color palette for bar chart
  const barColors = ['#dad7d1', '#3e3f3e', '#dcd5be', '#e4bca5'];

  return (
    <div className="incident-charts">
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon total">
            <DocumentIcon />
          </div>
          <div className="summary-content">
            <span className="summary-value">{total}</span>
            <span className="summary-label">Total Incidencias</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon open">
            <AlertIcon />
          </div>
          <div className="summary-content">
            <span className="summary-value">{open}</span>
            <span className="summary-label">Abiertas</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon closed">
            <CheckIcon />
          </div>
          <div className="summary-content">
            <span className="summary-value">{closed}</span>
            <span className="summary-label">Cerradas</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Donut Chart - Status Distribution */}
        <div className="chart-container">
          <h3>Incidencias por Estado</h3>
          <div className="donut-chart-wrapper">
            <div
              className="donut-chart"
              style={{ background: donutGradient }}
            >
              <div className="donut-hole"></div>
            </div>
            <div className="donut-legend">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#d3d7c4' }}></span>
                <span>Cerrada: {closed}</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#e2a29a' }}></span>
                <span>Abierta: {open}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Bar Chart - Types Distribution */}
        <div className="chart-container">
          <h3>Tipos de Incidencia</h3>
          <div className="bar-chart">
            {sortedTypes.map(([type, count], index) => (
              <div key={type} className="bar-row">
                <span className="bar-label">{type}</span>
                <div className="bar-wrapper">
                  <div
                    className="bar"
                    style={{
                      width: `${(count / maxTypeCount) * 100}%`,
                      backgroundColor: barColors[index % barColors.length]
                    }}
                  ></div>
                  <span className="bar-value">{count}</span>
                </div>
              </div>
            ))}
            {sortedTypes.length === 0 && (
              <div className="no-data-chart">Sin datos</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
