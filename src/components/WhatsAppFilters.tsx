import type { WhatsAppFilters as FilterType } from '../types/transfer';
import { format } from 'date-fns';

interface WhatsAppFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function WhatsAppFilters({ filters, onFiltersChange }: WhatsAppFiltersProps) {
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchTerm: e.target.value,
    });
  };

  const handleReset = () => {
    onFiltersChange({
      startDate: null,
      endDate: null,
      searchTerm: '',
    });
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <div className="whatsapp-filters">
      <div className="whatsapp-search-wrapper">
        <span className="search-icon">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Buscar por teléfono o mensaje..."
          value={filters.searchTerm}
          onChange={handleSearchChange}
          className="whatsapp-search-input"
        />
        {filters.searchTerm && (
          <button
            className="search-clear-btn"
            onClick={() => onFiltersChange({ ...filters, searchTerm: '' })}
            title="Limpiar búsqueda"
          >
            &times;
          </button>
        )}
      </div>

      <div className="whatsapp-date-filters">
        <div className="filter-group">
          <label htmlFor="waStartDate">Desde</label>
          <input
            type="date"
            id="waStartDate"
            value={formatDateForInput(filters.startDate)}
            onChange={handleStartDateChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="waEndDate">Hasta</label>
          <input
            type="date"
            id="waEndDate"
            value={formatDateForInput(filters.endDate)}
            onChange={handleEndDateChange}
          />
        </div>

        <button type="button" onClick={handleReset} className="btn-reset">
          Limpiar
        </button>
      </div>
    </div>
  );
}
