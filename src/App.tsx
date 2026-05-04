import { useState, useEffect } from 'react';
import { TransferFilters } from './components/TransferFilters';
import { IncidentFilters } from './components/IncidentFilters';
import { TransferTable } from './components/TransferTable';
import { IncidentTable } from './components/IncidentTable';
import { IncidentCharts } from './components/IncidentCharts';
import { IncidentSearchBar } from './components/IncidentSearchBar';
import { ReceiptModal } from './components/ReceiptModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { IncidentComentariosModal } from './components/IncidentComentariosModal';
import { WhatsAppDashboard } from './components/WhatsAppDashboard';
import { useTransferData } from './hooks/useTransferData';
import { useIncidentData } from './hooks/useIncidentData';
import { updateIncidentStatus, updateGestionadaPor, updateComentarios, updateTransferViewed } from './services/googleSheets';
import type { TransferReceipt, Incident, DashboardView } from './types/transfer';
import './App.css';

// Configuration - can be overridden with environment variables
const TRANSFERS_SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID || '15U2O68kl7xuBbA_P2WWaA93p5o4fc_RWjY6Knkqd43Q';
const TRANSFERS_SHEET_GID = import.meta.env.VITE_SHEET_GID || '0';
const INCIDENTS_SPREADSHEET_ID = '1e5B9tG28fE1dzthZlQVTIyvrLMzJSQTVPZpXaOhdYRc';
const INCIDENTS_SHEET_GID = '0';

// Google Apps Script Web App URLs
const INCIDENTS_WEB_APP_URL = import.meta.env.VITE_INCIDENTS_WEB_APP_URL || 'https://script.google.com/macros/s/AKfycby7ndSu1n9u5nPXol86sshY6KSCDEoIS0hlR7ognbh6EleDjJ11eno95aHCSOgl5E_a/exec';
const TRANSFERS_WEB_APP_URL = import.meta.env.VITE_TRANSFERS_WEB_APP_URL || 'https://script.google.com/macros/s/AKfycbzMfPUnhtSDYXA5We7zK2jrIMBrUOoDbHCi53LY73GOZgPFZhI1On0TVD-HlEJ_0pu3/exec';


function formatLastUpdate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}


function App() {
  const [currentView, setCurrentView] = useState<DashboardView>('transfers');

  const [selectedTransfer, setSelectedTransfer] = useState<TransferReceipt | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidentForComentario, setIncidentForComentario] = useState<Incident | null>(null);

  const [incidentSearch, setIncidentSearch] = useState('');

  const [lastUpdateTransfers, setLastUpdateTransfers] = useState<Date | null>(null);
  const [lastUpdateIncidents, setLastUpdateIncidents] = useState<Date | null>(null);


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


  // Handlers for transfers
  const handleViewReceipt = (transfer: TransferReceipt) => {
    // Mark as viewed in the sheet if not already viewed
    if (!transfer.viewed) {
      transfersData.updateLocalViewed(transfer.rowIndex, true);
      if (TRANSFERS_WEB_APP_URL) {
        updateTransferViewed(TRANSFERS_WEB_APP_URL, transfer.rowIndex, true);
      }
    }
    setSelectedTransfer(transfer);
  };

  const handleToggleViewedTransfer = async (transfer: TransferReceipt) => {
    const newViewed = !transfer.viewed;
    transfersData.updateLocalViewed(transfer.rowIndex, newViewed);
    if (TRANSFERS_WEB_APP_URL) {
      const success = await updateTransferViewed(TRANSFERS_WEB_APP_URL, transfer.rowIndex, newViewed);
      if (!success) {
        // Revert on failure
        transfersData.updateLocalViewed(transfer.rowIndex, transfer.viewed);
      }
    }
  };

  const handleClientClickTransfers = (clientSearch: string) => {
    transfersData.setFilters(prev => ({
      ...prev,
      clientSearch,
    }));
  };

  // Handlers for incidents
  const handleToggleIncidentStatus = async (incident: Incident) => {
    const newStatus = incident.status.toLowerCase() !== 'cerrada' ? 'Cerrada' : 'Abierta';

    // Optimistic update - update UI immediately
    incidentsData.updateLocalStatus(incident.rowIndex, newStatus);

    // Try to update the sheet if web app URL is configured
    if (INCIDENTS_WEB_APP_URL) {
      const success = await updateIncidentStatus(INCIDENTS_WEB_APP_URL, incident.rowIndex, newStatus);
      if (!success) {
        // Revert on failure
        incidentsData.updateLocalStatus(incident.rowIndex, incident.status);
        console.error('Failed to update status in sheet');
      }
    }
  };

  const handleUpdateGestionadaPor = async (incident: Incident, value: string) => {
    incidentsData.updateLocalGestionadaPor(incident.rowIndex, value);

    if (INCIDENTS_WEB_APP_URL) {
      const success = await updateGestionadaPor(INCIDENTS_WEB_APP_URL, incident.rowIndex, value);
      if (!success) {
        incidentsData.updateLocalGestionadaPor(incident.rowIndex, incident.gestionadaPor);
        console.error('Failed to update gestionadaPor in sheet');
      }
    }
  };

  const handleClientClickIncidents = (clientSearch: string) => {
    setIncidentSearch(clientSearch);
  };

  const handleIncidentSearchChange = (value: string) => {
    setIncidentSearch(value);
  };

  const handleCloseModal = () => {
    setSelectedTransfer(null);
  };

  const handleViewIncidentDetails = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  const handleCloseIncidentModal = () => {
    setSelectedIncident(null);
  };

  const handleEditComentarios = (incident: Incident) => {
    setIncidentForComentario(incident);
  };

  const handleSaveComentario = async (incident: Incident, comentario: string) => {
    incidentsData.updateLocalComentarios(incident.rowIndex, comentario);
    if (INCIDENTS_WEB_APP_URL) {
      const success = await updateComentarios(INCIDENTS_WEB_APP_URL, incident.rowIndex, comentario);
      if (!success) {
        incidentsData.updateLocalComentarios(incident.rowIndex, incident.comentarios);
        console.error('Failed to update comentarios in sheet');
      }
    }
  };

  // Get current data based on view
  const lastUpdate = currentView === 'transfers' ? lastUpdateTransfers :
                     currentView === 'incidents' ? lastUpdateIncidents : null;
  const title = currentView === 'transfers' ? 'Justificantes Transferencias' :
                currentView === 'incidents' ? 'Incidencias' : 'Logs de WhatsApp';
  const currentLoading = currentView === 'transfers' ? transfersData.loading :
                         currentView === 'incidents' ? incidentsData.loading : false;
  const currentRefresh = currentView === 'transfers' ? transfersData.refresh :
                         currentView === 'incidents' ? incidentsData.refresh : () => {};

  // Filter incidents by search term (client number, name, CIF or invoice number)
  const filteredIncidents = incidentSearch
    ? incidentsData.incidents.filter(incident => {
        const searchLower = incidentSearch.toLowerCase();
        return (
          incident.clientNumber.toLowerCase().includes(searchLower) ||
          incident.clientName.toLowerCase().includes(searchLower) ||
          incident.cif.toLowerCase().includes(searchLower) ||
          incident.invoiceNumber.toLowerCase().includes(searchLower)
        );
      })
    : incidentsData.incidents;

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
          <button
            className={`nav-btn ${currentView === 'whatsapp' ? 'active' : ''}`}
            onClick={() => setCurrentView('whatsapp')}
          >
            WhatsApp
          </button>
        </div>

        <div className="header-actions">
          {lastUpdate && (
            <span className="last-update">
              Última actualización: {formatLastUpdate(lastUpdate)}
            </span>
          )}
          <button onClick={currentRefresh} className="btn-refresh" disabled={currentLoading}>
            {currentLoading ? 'Actualizando...' : 'Actualizar datos'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {currentView === 'transfers' && (
          <>
            <TransferFilters
              filters={transfersData.filters}
              onFiltersChange={transfersData.setFilters}
            />

            {transfersData.error && (
              <div className="error-message">
                <strong>Error:</strong> {transfersData.error}
                <p>Asegúrate de que el Google Sheet sea público (cualquiera con el enlace puede ver).</p>
              </div>
            )}

            <TransferTable
              transfers={transfersData.transfers}
              onViewReceipt={handleViewReceipt}
              onToggleViewed={handleToggleViewedTransfer}
              onClientClick={handleClientClickTransfers}
              loading={transfersData.loading}
            />
          </>
        )}

        {currentView === 'incidents' && (
          <>
            <IncidentFilters
              filters={incidentsData.filters}
              onFiltersChange={incidentsData.setFilters}
              incidents={incidentsData.allIncidents}
            />

            {incidentsData.error && (
              <div className="error-message">
                <strong>Error:</strong> {incidentsData.error}
                <p>Asegúrate de que el Google Sheet sea público (cualquiera con el enlace puede ver).</p>
              </div>
            )}

            <IncidentCharts incidents={incidentsData.allIncidents} />

            <IncidentSearchBar
              searchValue={incidentSearch}
              onSearchChange={handleIncidentSearchChange}
            />

            <IncidentTable
              incidents={filteredIncidents}
              onToggleStatus={handleToggleIncidentStatus}
              onViewDetails={handleViewIncidentDetails}
              onEditComentarios={handleEditComentarios}
              onClientClick={handleClientClickIncidents}
              onUpdateGestionadaPor={handleUpdateGestionadaPor}
              loading={incidentsData.loading}
            />
          </>
        )}

        {currentView === 'whatsapp' && (
          <WhatsAppDashboard />
        )}
      </main>

      <ReceiptModal transfer={selectedTransfer} onClose={handleCloseModal} />
      <IncidentDetailModal incident={selectedIncident} onClose={handleCloseIncidentModal} />
      <IncidentComentariosModal
        incident={incidentForComentario}
        onClose={() => setIncidentForComentario(null)}
        onSave={handleSaveComentario}
      />

      <footer className="app-footer">
        <p>Dashboard Granel - by DigitalManager NATU</p>
      </footer>
    </div>
  );
}

export default App;
