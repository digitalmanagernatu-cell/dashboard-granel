import type { Incident } from '../types/transfer';

const GESTIONADO_OPTIONS = ['', 'Patri', 'Paqui', 'Mauro', 'Jaime'];

interface IncidentTableProps {
  incidents: Incident[];
  onToggleStatus: (incident: Incident) => void;
  onViewDetails: (incident: Incident) => void;
  onClientClick: (clientSearch: string) => void;
  onUpdateGestionadaPor: (incident: Incident, value: string) => void;
  loading: boolean;
}

export function IncidentTable({
  incidents,
  onToggleStatus,
  onViewDetails,
  onClientClick,
  onUpdateGestionadaPor,
  loading,
}: IncidentTableProps) {
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
      <table className="transfers-table incidents-table">
        <thead>
          <tr>
            <th>Nº Incidencia</th>
            <th>Fecha</th>
            <th>Cód. Cliente</th>
            <th>CIF</th>
            <th>Nº Factura</th>
            <th>Tipo Incidencia</th>
            <th>Gestionado Por</th>
            <th>Detalles</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident, index) => {
            const isOpen = incident.status.toLowerCase() !== 'cerrada';
            return (
              <tr key={`${incident.incidentNumber}-${index}`}>
                <td>{incident.incidentNumber}</td>
                <td>{incident.incidentDate}</td>
                <td>
                  <button
                    className="client-link"
                    onClick={() => onClientClick(incident.clientNumber)}
                    title="Filtrar por este cliente"
                  >
                    {incident.clientNumber}
                  </button>
                </td>
                <td>{incident.cif}</td>
                <td>{incident.invoiceNumber}</td>
                <td className="incident-type-cell">{incident.incidentType}</td>
                <td className="gestionado-por-cell">
                  <select
                    value={incident.gestionadaPor}
                    onChange={(e) => onUpdateGestionadaPor(incident, e.target.value)}
                    className="gestionado-por-select"
                  >
                    {GESTIONADO_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt || 'Sin asignar'}</option>
                    ))}
                  </select>
                </td>
                <td className="details-btn-cell">
                  <button
                    className="btn-view-details"
                    onClick={() => onViewDetails(incident)}
                  >
                    Ver Detalles
                  </button>
                </td>
                <td className="status-cell">
                  <button
                    className={`status-btn ${isOpen ? 'status-open' : 'status-closed'}`}
                    onClick={() => onToggleStatus(incident)}
                    title={isOpen ? 'Cambiar a Cerrada' : 'Cambiar a Abierta'}
                  >
                    {isOpen ? 'Abierta' : 'Cerrada'}
                  </button>
                </td>
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
