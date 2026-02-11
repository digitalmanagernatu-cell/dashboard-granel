import type { IncidentFilters as FilterType, Incident } from '../types/transfer';
import { format } from 'date-fns';

interface IncidentFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  incidents: Incident[];
}

export function IncidentFilters({ filters, onFiltersChange, incidents }: IncidentFiltersProps) {
  // Get unique incident types from data
  const incidentTypes = [...new Set(incidents.map(i => i.incidentType).filter(Boolean))];

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

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      incidentTypeFilter: e.target.value,
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      statusFilter: e.target.value,
    });
  };

  const handleReset = () => {
    onFiltersChange({
      startDate: null,
      endDate: null,
      clientSearch: '',
      orderSearch: '',
      incidentTypeFilter: '',
      statusFilter: '',
    });
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <div className="filters-container">
      <h2>Filtros de Incidencias</h2>
      <div className="filters-row">
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
          <label htmlFor="typeFilter">Tipo Incidencia</label>
          <select
            id="typeFilter"
            value={filters.incidentTypeFilter}
            onChange={handleTypeChange}
          >
            <option value="">Todos</option>
            {incidentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="statusFilter">Estado</label>
          <select
            id="statusFilter"
            value={filters.statusFilter}
            onChange={handleStatusChange}
          >
            <option value="">Todos</option>
            <option value="Abierta">Abiertas</option>
            <option value="Cerrada">Cerradas</option>
          </select>
        </div>

        <div className="filter-group filter-actions">
          <button type="button" onClick={handleReset} className="btn-reset">
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
