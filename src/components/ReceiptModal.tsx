import { useEffect, useState } from 'react';
import type { TransferReceipt } from '../types/transfer';
import { convertDriveUrlToViewable } from '../services/googleSheets';

interface ReceiptModalProps {
  transfer: TransferReceipt | null;
  onClose: () => void;
}

export function ReceiptModal({ transfer, onClose }: ReceiptModalProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (transfer) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [transfer]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (transfer) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [transfer, onClose]);

  if (!transfer) return null;

  const imageUrl = convertDriveUrlToViewable(transfer.receiptUrl);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOpenOriginal = () => {
    window.open(transfer.receiptUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">
            <h3>Justificante de Transferencia</h3>
            <p>
              Cliente: {transfer.clientName} ({transfer.clientNumber}) |
              Pedido: {transfer.orderNumber} |
              Fecha: {transfer.submissionDate}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} title="Cerrar (Esc)">
            ×
          </button>
        </div>
        <div className="modal-body">
          {imageLoading && !imageError && (
            <div className="image-loading">Cargando imagen...</div>
          )}
          {imageError ? (
            <div className="image-error">
              <p>No se pudo cargar la imagen.</p>
              <p>La imagen puede requerir permisos de acceso.</p>
              <button onClick={handleOpenOriginal} className="btn-open-original">
                Abrir enlace original
              </button>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={`Justificante del pedido ${transfer.orderNumber}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          )}
        </div>
        <div className="modal-footer">
          <button onClick={handleOpenOriginal} className="btn-secondary">
            Abrir en nueva pestaña
          </button>
          <button onClick={onClose} className="btn-primary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
