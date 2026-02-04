import { useState } from 'react';
import { TransferFilters } from './components/TransferFilters';
import { TransferTable } from './components/TransferTable';
import { ReceiptModal } from './components/ReceiptModal';
import { useTransferData } from './hooks/useTransferData';
import type { TransferReceipt } from './types/transfer';
import './App.css';

// Configuration - these should be set in environment variables
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const SHEET_RANGE = import.meta.env.VITE_SHEET_RANGE || 'Sheet1!A:E';

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
    range: SHEET_RANGE,
    apiKey: API_KEY,
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
        <h1>Dashboard Justificantes de Transferencia</h1>
        <p className="subtitle">Granel NATU</p>
        <button onClick={refresh} className="btn-refresh" disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar datos'}
        </button>
      </header>

      <main className="app-main">
        {!SPREADSHEET_ID || !API_KEY ? (
          <div className="config-warning">
            <h2>Configuración requerida</h2>
            <p>Para usar este dashboard, necesitas configurar las siguientes variables de entorno:</p>
            <ul>
              <li><code>VITE_GOOGLE_SPREADSHEET_ID</code> - ID del Google Sheet</li>
              <li><code>VITE_GOOGLE_API_KEY</code> - API Key de Google</li>
              <li><code>VITE_SHEET_RANGE</code> - Rango de celdas (opcional, por defecto: Sheet1!A:E)</li>
            </ul>
            <p>Crea un archivo <code>.env</code> en la raíz del proyecto con estas variables.</p>
            <div className="config-help">
              <h3>Cómo obtener estos valores:</h3>
              <ol>
                <li>Abre tu Google Sheet y copia el ID de la URL (la parte entre /d/ y /edit)</li>
                <li>Ve a <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                <li>Crea un proyecto y habilita la Google Sheets API</li>
                <li>Crea una API Key en Credenciales</li>
                <li>Asegúrate de que el Google Sheet sea público o accesible con la API Key</li>
              </ol>
            </div>
          </div>
        ) : (
          <>
            <TransferFilters filters={filters} onFiltersChange={setFilters} />

            {error && (
              <div className="error-message">
                <strong>Error:</strong> {error}
              </div>
            )}

            <TransferTable
              transfers={transfers}
              onViewReceipt={handleViewReceipt}
              loading={loading}
            />
          </>
        )}
      </main>

      <ReceiptModal transfer={selectedTransfer} onClose={handleCloseModal} />

      <footer className="app-footer">
        <p>Dashboard Granel NATU - Justificantes de Transferencia</p>
      </footer>
    </div>
  );
}

export default App;
