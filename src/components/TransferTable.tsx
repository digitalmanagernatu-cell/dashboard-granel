import type { TransferReceipt } from '../types/transfer';

interface TransferTableProps {
  transfers: TransferReceipt[];
  onViewReceipt: (transfer: TransferReceipt) => void;
  loading: boolean;
}

export function TransferTable({ transfers, onViewReceipt, loading }: TransferTableProps) {
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
            <th>Nº Cliente</th>
            <th>Nombre Cliente</th>
            <th>Nº Pedido</th>
            <th>Fecha Envío</th>
            <th>Justificante</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((transfer, index) => (
            <tr key={`${transfer.clientNumber}-${transfer.orderNumber}-${index}`}>
              <td>{transfer.clientNumber}</td>
              <td>{transfer.clientName}</td>
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
          ))}
        </tbody>
      </table>
      <div className="table-footer">
        Total: {transfers.length} transferencia{transfers.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
