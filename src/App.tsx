import { useState, useEffect } from 'react';
import { TransferFilters } from './components/TransferFilters';
import { TransferTable } from './components/TransferTable';
import { IncidentTable } from './components/IncidentTable';
import { ReceiptModal } from './components/ReceiptModal';
import { useTransferData } from './hooks/useTransferData';
import { useIncidentData } from './hooks/useIncidentData';
import type { TransferReceipt, Incident, DashboardView } from './types/transfer';
import './App.css';

// Configuration - can be overridden with environment variables
const TRANSFERS_SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID || '15U2O68kl7xuBbA_P2WWaA93p5o4fc_RWjY6Knkqd43Q';
const TRANSFERS_SHEET_GID = import.meta.env.VITE_SHEET_GID || '0';
const INCIDENTS_SPREADSHEET_ID = '1e5B9tG28fE1dzthZlQVTIyvrLMzJSQTVPZpXaOhdYRc';
const INCIDENTS_SHEET_GID = '0';

const VIEWED_RECEIPTS_KEY = 'granel-viewed-receipts';
const VIEWED_INCIDENTS_KEY = 'granel-viewed-incidents';

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

function getIncidentId(incident: Incident): string {
  return `${incident.clientNumber}-${incident.orderNumber}-${incident.incidentDate}-${incident.rowIndex}`;
}

function App() {
  // Dashboard view state
  const [currentView, setCurrentView] = useState<DashboardView>('transfers');

  // Modal state
  const [selectedTransfer, setSelectedTransfer] = useState<TransferReceipt | null>(null);

  // Last update timestamps
  const [lastUpdateTransfers, setLastUpdateTransfers] = useState<Date | null>(null);
  const [lastUpdateIncidents, setLastUpdateIncidents] = useState<Date | null>(null);

  // Viewed items state (stored separately for each dashboard)
  const [viewedReceipts, setViewedReceipts] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(VIEWED_RECEIPTS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const [viewedIncidents, setViewedIncidents] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(VIEWED_INCIDENTS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Data hooks
  const transfersData = useTransferData({
    spreadsheetId: TRANSFERS_SPREADSHEET_ID,
    sheetGid: TRANSFERS_SHEET_GID,
  });

  const incidentsData = useIncidentData({
    spreadsheetId: INCIDENTS_SPREADSHEET_ID,
    sheetGid: INCIDENTS_SHEET_GID,
  });

  // Update timestamps when data changes
  useEffect(() => {
    if (transfersData.allTransfers.length > 0) {
      setLastUpdateTransfers(new Date());
    }
  }, [transfersData.allTransfers]);

  useEffect(() => {
    if (incidentsData.allIncidents.length > 0) {
      setLastUpdateIncidents(new Date());
    }
  }, [incidentsData.allIncidents]);

  // Persist viewed items to localStorage
  useEffect(() => {
    localStorage.setItem(VIEWED_RECEIPTS_KEY, JSON.stringify([...viewedReceipts]));
  }, [viewedReceipts]);

  useEffect(() => {
    localStorage.setItem(VIEWED_INCIDENTS_KEY, JSON.stringify([...viewedIncidents]));
  }, [viewedIncidents]);

  // Handlers for transfers
  const handleViewReceipt = (transfer: TransferReceipt) => {
    const id = getTransferId(transfer);
    setViewedReceipts(prev => new Set([...prev, id]));
    setSelectedTransfer(transfer);
  };

  const handleToggleViewedTransfer = (transfer: TransferReceipt) => {
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

  const handleClientClickTransfers = (clientSearch: string) => {
    transfersData.setFilters(prev => ({
      ...prev,
      clientSearch,
    }));
  };

  // Handlers for incidents
  const handleToggleViewedIncident = (incident: Incident) => {
    const id = getIncidentId(incident);
    setViewedIncidents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleClientClickIncidents = (clientSearch: string) => {
    incidentsData.setFilters(prev => ({
      ...prev,
      clientSearch,
    }));
  };

  const handleCloseModal = () => {
    setSelectedTransfer(null);
  };

  // Get current data based on view
  const currentData = currentView === 'transfers' ? transfersData : incidentsData;
  const lastUpdate = currentView === 'transfers' ? lastUpdateTransfers : lastUpdateIncidents;
  const title = currentView === 'transfers' ? 'Justificantes Transferencias' : 'Incidencias';

  return (
    <div className="app">
      <header className="app-header">
        <img src="/dashboard-granel/logo.png" alt="Logo" className="header-logo" />
        <div className="header-titles">
          <h1>{title}</h1>
          <p className="subtitle">Granel NATU</p>
        </div>

        <div className="header-nav">
          <button
            className={`nav-btn ${currentView === 'transfers' ? 'active' : ''}`}
            onClick={() => setCurrentView('transfers')}
          >
            Justificantes
          </button>
          <button
            className={`nav-btn ${currentView === 'incidents' ? 'active' : ''}`}
            onClick={() => setCurrentView('incidents')}
          >
            Incidencias
          </button>
        </div>

        <div className="header-actions">
          {lastUpdate && (
            <span className="last-update">
              Última actualización: {formatLastUpdate(lastUpdate)}
            </span>
          )}
          <button onClick={currentData.refresh} className="btn-refresh" disabled={currentData.loading}>
            {currentData.loading ? 'Actualizando...' : 'Actualizar datos'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <TransferFilters
          filters={currentData.filters}
          onFiltersChange={currentData.setFilters}
        />

        {currentData.error && (
          <div className="error-message">
            <strong>Error:</strong> {currentData.error}
            <p>Asegúrate de que el Google Sheet sea público (cualquiera con el enlace puede ver).</p>
          </div>
        )}

        {currentView === 'transfers' ? (
          <TransferTable
            transfers={transfersData.transfers}
            onViewReceipt={handleViewReceipt}
            onToggleViewed={handleToggleViewedTransfer}
            onClientClick={handleClientClickTransfers}
            loading={transfersData.loading}
            viewedReceipts={viewedReceipts}
            getTransferId={getTransferId}
          />
        ) : (
          <IncidentTable
            incidents={incidentsData.incidents}
            onToggleViewed={handleToggleViewedIncident}
            onClientClick={handleClientClickIncidents}
            loading={incidentsData.loading}
            viewedIncidents={viewedIncidents}
            getIncidentId={getIncidentId}
          />
        )}
      </main>

      <ReceiptModal transfer={selectedTransfer} onClose={handleCloseModal} />

      <footer className="app-footer">
        <p>Dashboard Granel - by DigitalManager NATU</p>
      </footer>
    </div>
  );
}

export default App;
