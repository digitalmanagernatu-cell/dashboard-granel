import type { TransferFilters as FilterType } from '../types/transfer';
import { format, subDays } from 'date-fns';

interface TransferFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

export function TransferFilters({ filters, onFiltersChange }: TransferFiltersProps) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      startDate: value ? new Date(value) : null,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      endDate: value ? new Date(value) : null,
    });
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      clientSearch: e.target.value,
    });
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      orderSearch: e.target.value,
    });
  };

  const handleReset = () => {
    onFiltersChange({
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
      clientSearch: '',
      orderSearch: '',
    });
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <div className="filters-container">
      <h2>Filtros de Búsqueda</h2>
      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="startDate">Fecha desde</label>
          <input
            type="date"
            id="startDate"
            value={formatDateForInput(filters.startDate)}
            onChange={handleStartDateChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="endDate">Fecha hasta</label>
          <input
            type="date"
            id="endDate"
            value={formatDateForInput(filters.endDate)}
            onChange={handleEndDateChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="clientSearch">Cliente (Nº o Nombre)</label>
          <input
            type="text"
            id="clientSearch"
            placeholder="Buscar cliente..."
            value={filters.clientSearch}
            onChange={handleClientChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="orderSearch">Nº Pedido</label>
          <input
            type="text"
            id="orderSearch"
            placeholder="Buscar pedido..."
            value={filters.orderSearch}
            onChange={handleOrderChange}
          />
        </div>

        <div className="filter-group filter-actions">
          <button type="button" onClick={handleReset} className="btn-reset">
            Restablecer (Últimos 7 días)
          </button>
        </div>
      </div>
    </div>
  );
}
