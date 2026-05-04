import type { Incident } from '../types/transfer';

const GESTIONADO_OPTIONS = ['', 'Patri', 'Paqui', 'Mauro', 'Jaime'];

interface IncidentTableProps {
  incidents: Incident[];
  onToggleStatus: (incident: Incident) => void;
  onViewDetails: (incident: Incident) => void;
  onEditComentarios: (incident: Incident) => void;
  onClientClick: (clientSearch: string) => void;
  onUpdateGestionadaPor: (incident: Incident, value: string) => void;
  loading: boolean;
}

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function IncidentTable({
  incidents,
  onToggleStatus,
  onViewDetails,
  onEditComentarios,
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
            <th className="col-incidencia">Nº Incidencia</th>
            <th className="col-fecha">Fecha</th>
            <th className="col-cliente">Cód. Cliente</th>
            <th className="col-cif">CIF</th>
            <th className="col-factura">Nº Factura</th>
            <th className="col-tipo">Tipo Incidencia</th>
            <th className="col-gestionado">Gestionado Por</th>
            <th className="col-estado">Estado</th>
            <th className="col-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident, index) => {
            const isOpen = incident.status.toLowerCase() !== 'cerrada';
            return (
              <tr key={`${incident.incidentNumber}-${index}`}>
                <td className="col-incidencia">{incident.incidentNumber}</td>
                <td className="col-fecha">{incident.incidentDate}</td>
                <td className="col-cliente">
                  <button
                    className="client-link"
                    onClick={() => onClientClick(incident.clientNumber)}
                    title="Filtrar por este cliente"
                  >
                    {incident.clientNumber}
                  </button>
                </td>
                <td className="col-cif">{incident.cif}</td>
                <td className="col-factura">{incident.invoiceNumber}</td>
                <td className="col-tipo">{incident.incidentType}</td>
                <td className="col-gestionado">
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
                <td className="col-estado">
                  <button
                    className={`status-btn ${isOpen ? 'status-open' : 'status-closed'}`}
                    onClick={() => onToggleStatus(incident)}
                    title={isOpen ? 'Cambiar a Cerrada' : 'Cambiar a Abierta'}
                  >
                    {isOpen ? 'Abierta' : 'Cerrada'}
                  </button>
                </td>
                <td className="col-acciones">
                  <div className="acciones-btns">
                    <button
                      className="icon-btn icon-btn-eye"
                      onClick={() => onViewDetails(incident)}
                      title="Ver detalles"
                    >
                      <EyeIcon />
                    </button>
                    <button
                      className={`icon-btn icon-btn-pencil ${incident.comentarios ? 'has-comment' : ''}`}
                      onClick={() => onEditComentarios(incident)}
                      title={incident.comentarios ? 'Ver/editar comentario' : 'Añadir comentario'}
                    >
                      <PencilIcon />
                    </button>
                  </div>
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
