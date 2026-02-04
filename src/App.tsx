import { useState } from 'react';
import { TransferFilters } from './components/TransferFilters';
import { TransferTable } from './components/TransferTable';
import { ReceiptModal } from './components/ReceiptModal';
import { useTransferData } from './hooks/useTransferData';
import type { TransferReceipt } from './types/transfer';
import './App.css';

// Configuration - can be overridden with environment variables
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID || '15U2O68kl7xuBbA_P2WWaA93p5o4fc_RWjY6Knkqd43Q';
const SHEET_GID = import.meta.env.VITE_SHEET_GID || '0';

function App() {
  const [selectedTransfer, setSelectedTransfer] = useState<TransferReceipt | null>(null);

  const {
    transfers,
    loading,
    error,
    filters,
    setFilters,
    refresh,
  } = useTransferData({
    spreadsheetId: SPREADSHEET_ID,
    sheetGid: SHEET_GID,
  });

  const handleViewReceipt = (transfer: TransferReceipt) => {
    setSelectedTransfer(transfer);
  };

  const handleCloseModal = () => {
    setSelectedTransfer(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <img src="/dashboard-granel/logo.png" alt="Logo" className="header-logo" />
        <div className="header-titles">
          <h1>Justificantes Transferencias</h1>
          <p className="subtitle">Granel NATU</p>
        </div>
        <button onClick={refresh} className="btn-refresh" disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar datos'}
        </button>
      </header>

      <main className="app-main">
        <TransferFilters filters={filters} onFiltersChange={setFilters} />

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            <p>Asegúrate de que el Google Sheet sea público (cualquiera con el enlace puede ver).</p>
          </div>
        )}

        <TransferTable
          transfers={transfers}
          onViewReceipt={handleViewReceipt}
          loading={loading}
        />
      </main>

      <ReceiptModal transfer={selectedTransfer} onClose={handleCloseModal} />

      <footer className="app-footer">
        <p>Dashboard Granel NATU - Justificantes de Transferencia</p>
      </footer>
    </div>
  );
}

export default App;
