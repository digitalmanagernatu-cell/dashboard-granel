import type { Incident } from '../types/transfer';

interface IncidentTableProps {
  incidents: Incident[];
  onToggleViewed: (incident: Incident) => void;
  onClientClick: (clientSearch: string) => void;
  loading: boolean;
  viewedIncidents: Set<string>;
  getIncidentId: (incident: Incident) => string;
}

// Eye icon for viewed items
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Eye with slash icon for not viewed items
function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function IncidentTable({ incidents, onToggleViewed, onClientClick, loading, viewedIncidents, getIncidentId }: IncidentTableProps) {
  if (loading) {
    return (
      <div className="table-container">
        <div className="loading">Cargando datos...</div>
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="table-container">
        <div className="no-data">No se encontraron incidencias con los filtros aplicados</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="transfers-table">
        <thead>
          <tr>
            <th>Visto</th>
            <th>Fuente</th>
            <th>Nº Cliente</th>
            <th>Nombre Cliente</th>
            <th>Nº Pedido</th>
            <th>Fecha</th>
            <th>Detalles Incidencia</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident, index) => {
            const isViewed = viewedIncidents.has(getIncidentId(incident));
            return (
              <tr
                key={`${incident.clientNumber}-${incident.orderNumber}-${index}`}
                className={isViewed ? '' : 'row-unviewed'}
              >
                <td className="viewed-cell">
                  <button
                    className={`viewed-icon-btn ${isViewed ? 'viewed' : 'not-viewed'}`}
                    onClick={() => onToggleViewed(incident)}
                    title={isViewed ? 'Marcar como no visto' : 'Marcar como visto'}
                  >
                    {isViewed ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                </td>
                <td className="source-cell">{incident.source}</td>
                <td>
                  <button
                    className="client-link"
                    onClick={() => onClientClick(incident.clientNumber)}
                    title="Filtrar por este cliente"
                  >
                    {incident.clientNumber}
                  </button>
                </td>
                <td>
                  <button
                    className="client-link"
                    onClick={() => onClientClick(incident.clientName)}
                    title="Filtrar por este cliente"
                  >
                    {incident.clientName}
                  </button>
                </td>
                <td>{incident.orderNumber}</td>
                <td>{incident.incidentDate}</td>
                <td className="incident-details-cell">{incident.incidentDetails}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="table-footer">
        Total: {incidents.length} incidencia{incidents.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
