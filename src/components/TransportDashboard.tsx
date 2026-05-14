import { useTransportData } from '../hooks/useTransportData';
import type { TransportExpense, SheetTab } from '../types/transfer';

const TRANSPORT_SPREADSHEET_ID = import.meta.env.VITE_TRANSPORT_SPREADSHEET_ID || '1zQU3WQ_IT_0RN2Tb5XoTqVRqmkSdzUpeZPWRq3aD_f8';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyBz3wLOSZiUCER8oYaMGo4hfVkdONw--VQ';

function formatNumber(value: string): string {
  if (!value) return '-';
  const num = parseFloat(value.replace(',', '.'));
  if (isNaN(num)) return value;
  return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(value: string): string {
  if (!value) return '-';
  const num = parseFloat(value.replace(',', '.').replace('%', ''));
  if (isNaN(num)) return value;
  return `${(num * (value.includes('%') ? 1 : 100)).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

interface TransportTableProps {
  expenses: TransportExpense[];
  loading: boolean;
}

function TransportTable({ expenses, loading }: TransportTableProps) {
  if (loading) {
    return <div className="loading-state">Cargando datos...</div>;
  }

  if (expenses.length === 0) {
    return <div className="empty-state">No hay datos en esta hoja.</div>;
  }

  const carriers = ['SEUR', 'PALEMANIA', 'TRANSAHER', 'REDUR', 'NACEX', 'DHL', 'DHL_EXPORT', 'CORREOS'];

  return (
    <div className="table-wrapper">
      <table className="data-table transport-table">
        <thead>
          <tr>
            <th>Cód. Cliente</th>
            <th>Nombre Cliente</th>
            <th>Comercial</th>
            <th>Línea Negocio</th>
            <th className="num-col">Base Imponible</th>
            <th className="num-col">Total Facturas</th>
            {carriers.map(c => (
              <th key={c} className="num-col carrier-col">{c}</th>
            ))}
            <th className="num-col total-col">Total Transporte</th>
            <th className="num-col pct-col">% Transporte</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(expense => (
            <tr key={expense.rowIndex}>
              <td className="code-cell">{expense.clientCode}</td>
              <td>{expense.clientName}</td>
              <td>{expense.comercial}</td>
              <td>{expense.lineaNegocio}</td>
              <td className="num-cell">{formatNumber(expense.baseImponible)}</td>
              <td className="num-cell">{formatNumber(expense.totalFacturas)}</td>
              <td className="num-cell">{formatNumber(expense.seur)}</td>
              <td className="num-cell">{formatNumber(expense.palemania)}</td>
              <td className="num-cell">{formatNumber(expense.transaher)}</td>
              <td className="num-cell">{formatNumber(expense.redur)}</td>
              <td className="num-cell">{formatNumber(expense.nacex)}</td>
              <td className="num-cell">{formatNumber(expense.dhl)}</td>
              <td className="num-cell">{formatNumber(expense.dhlExport)}</td>
              <td className="num-cell">{formatNumber(expense.correos)}</td>
              <td className="num-cell total-cell">{formatNumber(expense.totalTransporte)}</td>
              <td className="num-cell pct-cell">{formatPercent(expense.porcentajeTransporte)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface SheetSelectorProps {
  sheets: SheetTab[];
  selected: SheetTab | null;
  onSelect: (sheet: SheetTab) => void;
  loading: boolean;
}

function SheetSelector({ sheets, selected, onSelect, loading }: SheetSelectorProps) {
  return (
    <div className="sheet-selector">
      <label className="sheet-selector-label">Período:</label>
      <div className="sheet-tabs">
        {loading && sheets.length === 0 ? (
          <span className="sheet-tab-loading">Cargando hojas...</span>
        ) : (
          sheets.map(sheet => (
            <button
              key={sheet.sheetId}
              className={`sheet-tab-btn ${selected?.sheetId === sheet.sheetId ? 'active' : ''}`}
              onClick={() => onSelect(sheet)}
            >
              {sheet.title}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

interface FiltersBarProps {
  filters: { clientSearch: string; comercialFilter: string; lineaNegocioFilter: string };
  onFiltersChange: (f: { clientSearch: string; comercialFilter: string; lineaNegocioFilter: string }) => void;
  comerciales: string[];
  lineasNegocio: string[];
}

function FiltersBar({ filters, onFiltersChange, comerciales, lineasNegocio }: FiltersBarProps) {
  return (
    <div className="filters-bar transport-filters">
      <input
        type="text"
        className="filter-input"
        placeholder="Buscar cliente..."
        value={filters.clientSearch}
        onChange={e => onFiltersChange({ ...filters, clientSearch: e.target.value })}
      />
      <select
        className="filter-select"
        value={filters.comercialFilter}
        onChange={e => onFiltersChange({ ...filters, comercialFilter: e.target.value })}
      >
        <option value="">Todos los comerciales</option>
        {comerciales.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select
        className="filter-select"
        value={filters.lineaNegocioFilter}
        onChange={e => onFiltersChange({ ...filters, lineaNegocioFilter: e.target.value })}
      >
        <option value="">Todas las líneas</option>
        {lineasNegocio.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      {(filters.clientSearch || filters.comercialFilter || filters.lineaNegocioFilter) && (
        <button
          className="btn-clear-filters"
          onClick={() => onFiltersChange({ clientSearch: '', comercialFilter: '', lineaNegocioFilter: '' })}
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

export function TransportDashboard() {
  const {
    sheets,
    selectedSheet,
    setSelectedSheet,
    expenses,
    allExpenses,
    loading,
    loadingSheets,
    loadingData,
    error,
    filters,
    setFilters,
    refresh,
  } = useTransportData({
    spreadsheetId: TRANSPORT_SPREADSHEET_ID,
    apiKey: GOOGLE_API_KEY,
  });

  const comerciales = [...new Set(allExpenses.map(e => e.comercial).filter(Boolean))].sort();
  const lineasNegocio = [...new Set(allExpenses.map(e => e.lineaNegocio).filter(Boolean))].sort();

  return (
    <div className="transport-dashboard">
      <div className="transport-header-bar">
        <SheetSelector
          sheets={sheets}
          selected={selectedSheet}
          onSelect={setSelectedSheet}
          loading={loadingSheets}
        />
        <button className="btn-refresh" onClick={refresh} disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      <FiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        comerciales={comerciales}
        lineasNegocio={lineasNegocio}
      />

      <div className="transport-summary">
        <span className="summary-item">
          <strong>{expenses.length}</strong> clientes
          {expenses.length !== allExpenses.length && ` (de ${allExpenses.length})`}
        </span>
        {selectedSheet && (
          <span className="summary-item summary-sheet">
            Hoja: <strong>{selectedSheet.title}</strong>
          </span>
        )}
        <span className="summary-item summary-sheets-count">
          {sheets.length} {sheets.length === 1 ? 'período disponible' : 'períodos disponibles'}
          {loadingSheets && ' (actualizando...)'}
        </span>
      </div>

      <TransportTable expenses={expenses} loading={loadingData && allExpenses.length === 0} />
    </div>
  );
}
