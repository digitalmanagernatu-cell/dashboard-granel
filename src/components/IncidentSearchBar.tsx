interface IncidentSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function IncidentSearchBar({ searchValue, onSearchChange }: IncidentSearchBarProps) {
  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <span className="search-icon">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Buscar por Nº Cliente o Nº Pedido..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {searchValue && (
          <button
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            title="Limpiar búsqueda"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
