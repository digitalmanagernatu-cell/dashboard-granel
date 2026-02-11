import type { Incident } from '../types/transfer';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
}

export function IncidentDetailModal({ incident, onClose }: IncidentDetailModalProps) {
  if (!incident) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Format date to only show day/month/year
  const formatDateOnly = (dateString: string): string => {
    if (!dateString) return '';
    const match = dateString.match(/^(\d{1,2}\/\d{1,2}\/\d{4})/);
    return match ? match[1] : dateString;
  };

  const isOpen = incident.status.toLowerCase() === 'abierta';

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content incident-detail-modal">
        <div className="modal-header">
          <div className="modal-title">
            <h3>Detalles de Incidencia</h3>
            <p>Pedido: {incident.orderNumber} - Cliente: {incident.clientName}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body incident-detail-body">
          <div className="incident-detail-grid">
            <div className="detail-row">
              <span className="detail-label">Fecha:</span>
              <span className="detail-value">{formatDateOnly(incident.incidentDate)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nº Cliente:</span>
              <span className="detail-value">{incident.clientNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nombre Cliente:</span>
              <span className="detail-value">{incident.clientName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nº Pedido:</span>
              <span className="detail-value">{incident.orderNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tipo Incidencia:</span>
              <span className="detail-value">{incident.incidentType}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Estado:</span>
              <span className={`detail-value status-badge ${isOpen ? 'status-open' : 'status-closed'}`}>
                {incident.status}
              </span>
            </div>
            {incident.source && (
              <div className="detail-row">
                <span className="detail-label">Fuente:</span>
                <span className="detail-value">{incident.source}</span>
              </div>
            )}
          </div>

          <div className="incident-details-section">
            <h4>Detalles de la Incidencia</h4>
            <div className="incident-details-text">
              {incident.incidentDetails || 'Sin detalles adicionales'}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
