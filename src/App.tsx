import { useState, useEffect } from 'react';
import { TransferFilters } from './components/TransferFilters';
import { TransferTable } from './components/TransferTable';
import { ReceiptModal } from './components/ReceiptModal';
import { useTransferData } from './hooks/useTransferData';
import type { TransferReceipt } from './types/transfer';
import './App.css';

// Configuration - can be overridden with environment variables
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID || '15U2O68kl7xuBbA_P2WWaA93p5o4fc_RWjY6Knkqd43Q';
const SHEET_GID = import.meta.env.VITE_SHEET_GID || '0';
const VIEWED_STORAGE_KEY = 'granel-viewed-receipts';

function formatLastUpdate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function getTransferId(transfer: TransferReceipt): string {
  return `${transfer.clientNumber}-${transfer.orderNumber}-${transfer.submissionDate}`;
}

function App() {
  const [selectedTransfer, setSelectedTransfer] = useState<TransferReceipt | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [viewedReceipts, setViewedReceipts] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(VIEWED_STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const {
    transfers,
    allTransfers,
    loading,
    error,
    filters,
    setFilters,
    refresh,
  } = useTransferData({
    spreadsheetId: SPREADSHEET_ID,
    sheetGid: SHEET_GID,
  });

  // Update timestamp when data changes (including auto-refresh)
  useEffect(() => {
    if (allTransfers.length > 0) {
      setLastUpdate(new Date());
    }
  }, [allTransfers]);

  useEffect(() => {
    localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify([...viewedReceipts]));
  }, [viewedReceipts]);

  const handleViewReceipt = (transfer: TransferReceipt) => {
    const id = getTransferId(transfer);
    setViewedReceipts(prev => new Set([...prev, id]));
    setSelectedTransfer(transfer);
  };

  const handleToggleViewed = (transfer: TransferReceipt) => {
    const id = getTransferId(transfer);
    setViewedReceipts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleClientClick = (clientSearch: string) => {
    setFilters(prev => ({
      ...prev,
      clientSearch,
    }));
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
        <div className="header-actions">
          {lastUpdate && (
            <span className="last-update">
              Última actualización: {formatLastUpdate(lastUpdate)}
            </span>
          )}
          <button onClick={refresh} className="btn-refresh" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar datos'}
          </button>
        </div>
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
          onToggleViewed={handleToggleViewed}
          onClientClick={handleClientClick}
          loading={loading}
          viewedReceipts={viewedReceipts}
          getTransferId={getTransferId}
        />
      </main>

      <ReceiptModal transfer={selectedTransfer} onClose={handleCloseModal} />

      <footer className="app-footer">
        <p>Dashboard Granel - by DigitalManager NATU</p>
      </footer>
    </div>
  );
}

export default App;
