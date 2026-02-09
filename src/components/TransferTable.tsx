import type { TransferReceipt } from '../types/transfer';

interface TransferTableProps {
  transfers: TransferReceipt[];
  onViewReceipt: (transfer: TransferReceipt) => void;
  onToggleViewed: (transfer: TransferReceipt) => void;
  onClientClick: (clientSearch: string) => void;
  loading: boolean;
  viewedReceipts: Set<string>;
  getTransferId: (transfer: TransferReceipt) => string;
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

export function TransferTable({ transfers, onViewReceipt, onToggleViewed, onClientClick, loading, viewedReceipts, getTransferId }: TransferTableProps) {
  if (loading) {
    return (
      <div className="table-container">
        <div className="loading">Cargando datos...</div>
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="table-container">
        <div className="no-data">No se encontraron transferencias con los filtros aplicados</div>
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
            <th>Fecha Envío</th>
            <th>Justificante</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((transfer, index) => {
            const isViewed = viewedReceipts.has(getTransferId(transfer));
            return (
              <tr
                key={`${transfer.clientNumber}-${transfer.orderNumber}-${index}`}
                className={isViewed ? '' : 'row-unviewed'}
              >
                <td className="viewed-cell">
                  <button
                    className={`viewed-icon-btn ${isViewed ? 'viewed' : 'not-viewed'}`}
                    onClick={() => onToggleViewed(transfer)}
                    title={isViewed ? 'Marcar como no visto' : 'Marcar como visto'}
                  >
                    {isViewed ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                </td>
                <td className="source-cell">{transfer.source}</td>
                <td>
                  <button
                    className="client-link"
                    onClick={() => onClientClick(transfer.clientNumber)}
                    title="Filtrar por este cliente"
                  >
                    {transfer.clientNumber}
                  </button>
                </td>
                <td>
                  <button
                    className="client-link"
                    onClick={() => onClientClick(transfer.clientName)}
                    title="Filtrar por este cliente"
                  >
                    {transfer.clientName}
                  </button>
                </td>
                <td>{transfer.orderNumber}</td>
                <td>{transfer.submissionDate}</td>
                <td>
                  {transfer.receiptUrl ? (
                    <button
                      className="btn-view-receipt"
                      onClick={() => onViewReceipt(transfer)}
                      title="Ver justificante"
                    >
                      Ver Justificante
                    </button>
                  ) : (
                    <span className="no-receipt">Sin justificante</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="table-footer">
        Total: {transfers.length} transferencia{transfers.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
