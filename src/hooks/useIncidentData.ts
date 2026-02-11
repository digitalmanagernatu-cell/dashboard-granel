import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Incident, TransferFilters } from '../types/transfer';
import { fetchIncidents, parseDate } from '../services/googleSheets';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';

// Auto-refresh interval in milliseconds (30 seconds)
const AUTO_REFRESH_INTERVAL = 30000;

interface UseIncidentDataOptions {
  spreadsheetId: string;
  sheetGid?: string;
}

export function useIncidentData({ spreadsheetId, sheetGid = '0' }: UseIncidentDataOptions) {
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransferFilters>({
    startDate: null,
    endDate: null,
    clientSearch: '',
    orderSearch: '',
    sourceFilter: '',
  });

  // Silent refresh (doesn't show loading state)
  const silentRefresh = useCallback(async () => {
    if (!spreadsheetId) return;

    try {
      const data = await fetchIncidents(spreadsheetId, sheetGid);
      setAllIncidents(data);
      setError(null);
    } catch (err) {
      console.error('Auto-refresh failed:', err);
    }
  }, [spreadsheetId, sheetGid]);

  // Initial load
  useEffect(() => {
    async function loadData() {
      if (!spreadsheetId) {
        setError('Configuración incompleta: falta el ID del spreadsheet');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchIncidents(spreadsheetId, sheetGid);
        setAllIncidents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [spreadsheetId, sheetGid]);

  // Auto-refresh interval
  useEffect(() => {
    const intervalId = setInterval(silentRefresh, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [silentRefresh]);

  const filteredIncidents = useMemo(() => {
    const filtered = allIncidents.filter((incident) => {
      // Filter by date range
      if (filters.startDate || filters.endDate) {
        const incidentDate = parseDate(incident.incidentDate);
        if (incidentDate) {
          const start = filters.startDate ? startOfDay(filters.startDate) : new Date(0);
          const end = filters.endDate ? endOfDay(filters.endDate) : new Date();

          if (!isWithinInterval(incidentDate, { start, end })) {
            return false;
          }
        }
      }

      // Filter by client (number or name)
      if (filters.clientSearch) {
        const searchLower = filters.clientSearch.toLowerCase();
        const matchesClient =
          incident.clientNumber.toLowerCase().includes(searchLower) ||
          incident.clientName.toLowerCase().includes(searchLower);
        if (!matchesClient) {
          return false;
        }
      }

      // Filter by order number
      if (filters.orderSearch) {
        const searchLower = filters.orderSearch.toLowerCase();
        if (!incident.orderNumber.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filter by source
      if (filters.sourceFilter) {
        if (incident.source.toLowerCase() !== filters.sourceFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });

    // Sort by date descending (most recent first), then by row index descending
    return filtered.sort((a, b) => {
      const dateA = parseDate(a.incidentDate);
      const dateB = parseDate(b.incidentDate);
      if (!dateA && !dateB) return b.rowIndex - a.rowIndex;
      if (!dateA) return 1;
      if (!dateB) return -1;
      const dateComparison = dateB.getTime() - dateA.getTime();
      if (dateComparison === 0) {
        return b.rowIndex - a.rowIndex;
      }
      return dateComparison;
    });
  }, [allIncidents, filters]);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchIncidents(spreadsheetId, sheetGid);
      setAllIncidents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  return {
    incidents: filteredIncidents,
    allIncidents,
    loading,
    error,
    filters,
    setFilters,
    refresh,
  };
}
