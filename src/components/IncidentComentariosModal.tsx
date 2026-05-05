import { useState, useEffect } from 'react';
import type { Incident } from '../types/transfer';

interface IncidentComentariosModalProps {
  incident: Incident | null;
  onClose: () => void;
  onSave: (incident: Incident, comentario: string) => void;
}

export function IncidentComentariosModal({ incident, onClose, onSave }: IncidentComentariosModalProps) {
  const [texto, setTexto] = useState('');

  useEffect(() => {
    if (incident) setTexto(incident.comentarios || '');
  }, [incident]);

  if (!incident) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSave = () => {
    onSave(incident, texto);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content comentarios-modal">
        <div className="modal-header">
          <div className="modal-title">
            <h3>Comentarios de gestión</h3>
            <p>{incident.incidentNumber} — {incident.clientNumber}</p>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body comentarios-body">
          <textarea
            className="comentarios-textarea"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe aquí los comentarios de gestión..."
            rows={6}
            autoFocus
          />
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
}
