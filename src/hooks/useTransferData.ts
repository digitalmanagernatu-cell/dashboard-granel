import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TransferReceipt, TransferFilters } from '../types/transfer';
import { fetchTransferReceipts, parseDate } from '../services/googleSheets';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';

// Auto-refresh interval in milliseconds (30 seconds)
const AUTO_REFRESH_INTERVAL = 30000;

interface UseTransferDataOptions {
  spreadsheetId: string;
  sheetGid?: string;
}

export function useTransferData({ spreadsheetId, sheetGid = '0' }: UseTransferDataOptions) {
  const [allTransfers, setAllTransfers] = useState<TransferReceipt[]>([]);
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
      const data = await fetchTransferReceipts(spreadsheetId, sheetGid);
      setAllTransfers(data);
      setError(null);
    } catch (err) {
      // Don't update error on silent refresh to avoid disrupting user
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
        const data = await fetchTransferReceipts(spreadsheetId, sheetGid);
        setAllTransfers(data);
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

  const filteredTransfers = useMemo(() => {
    const filtered = allTransfers.filter((transfer) => {
      // Filter by date range
      if (filters.startDate || filters.endDate) {
        const transferDate = parseDate(transfer.submissionDate);
        if (transferDate) {
          const start = filters.startDate ? startOfDay(filters.startDate) : new Date(0);
          const end = filters.endDate ? endOfDay(filters.endDate) : new Date();

          if (!isWithinInterval(transferDate, { start, end })) {
            return false;
          }
        }
      }

      // Filter by client (number or name)
      if (filters.clientSearch) {
        const searchLower = filters.clientSearch.toLowerCase();
        const matchesClient =
          transfer.clientNumber.toLowerCase().includes(searchLower) ||
          transfer.clientName.toLowerCase().includes(searchLower);
        if (!matchesClient) {
          return false;
        }
      }

      // Filter by order number
      if (filters.orderSearch) {
        const searchLower = filters.orderSearch.toLowerCase();
        if (!transfer.orderNumber.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filter by source
      if (filters.sourceFilter) {
        if (transfer.source.toLowerCase() !== filters.sourceFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });

    // Sort by date descending (most recent first)
    return filtered.sort((a, b) => {
      const dateA = parseDate(a.submissionDate);
      const dateB = parseDate(b.submissionDate);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB.getTime() - dateA.getTime();
    });
  }, [allTransfers, filters]);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTransferReceipts(spreadsheetId, sheetGid);
      setAllTransfers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  return {
    transfers: filteredTransfers,
    allTransfers,
    loading,
    error,
    filters,
    setFilters,
    refresh,
  };
}
