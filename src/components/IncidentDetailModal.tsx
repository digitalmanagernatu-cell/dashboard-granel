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

  const formatDateOnly = (dateString: string): string => {
    if (!dateString) return '';
    const match = dateString.match(/^(\d{1,2}\/\d{1,2}\/\d{4})/);
    return match ? match[1] : dateString;
  };

  const isOpen = incident.status.toLowerCase() !== 'cerrada';

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content incident-detail-modal">
        <div className="modal-header">
          <div className="modal-title">
            <h3>Detalles de Incidencia</h3>
            <p>Incidencia: {incident.incidentNumber} - Cliente: {incident.clientName}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body incident-detail-body">
          <div className="incident-detail-grid">
            <div className="detail-row">
              <span className="detail-label">Nº Incidencia:</span>
              <span className="detail-value">{incident.incidentNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Fecha:</span>
              <span className="detail-value">{formatDateOnly(incident.incidentDate)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Cód. Cliente:</span>
              <span className="detail-value">{incident.clientNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nombre Cliente:</span>
              <span className="detail-value">{incident.clientName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">CIF:</span>
              <span className="detail-value">{incident.cif}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Comercial:</span>
              <span className="detail-value">{incident.comercial}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nº Factura:</span>
              <span className="detail-value">{incident.invoiceNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email Cliente:</span>
              <span className="detail-value">{incident.clientEmail || '—'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tipo Incidencia:</span>
              <span className="detail-value">{incident.incidentType}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Gestionada Por:</span>
              <span className="detail-value">{incident.gestionadaPor || '—'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Estado:</span>
              <span className={`detail-value status-badge ${isOpen ? 'status-open' : 'status-closed'}`}>
                {incident.status}
              </span>
            </div>
          </div>

          <div className="incident-details-section">
            <h4>Detalles de la Incidencia</h4>
            <div className="incident-details-text">
              {incident.incidentDetails || 'Sin detalles adicionales'}
            </div>
          </div>

          {incident.images.length > 0 && (
            <div className="incident-details-section">
              <h4>Imágenes adjuntas</h4>
              <div className="incident-images-list">
                {incident.images.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="incident-image-link"
                  >
                    Imagen {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {incident.comentarios && (
            <div className="incident-details-section">
              <h4>Comentarios de gestión</h4>
              <div className="incident-details-text">
                {incident.comentarios}
              </div>
            </div>
          )}
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
