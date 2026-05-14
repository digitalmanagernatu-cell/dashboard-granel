import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { TransportExpense, SheetTab, TransportFilters } from '../types/transfer';
import { fetchSheetTabs, fetchTransportExpenses } from '../services/googleSheets';

// Check for new sheets every 60 seconds; refresh data every 30 seconds
const SHEET_LIST_REFRESH_INTERVAL = 60000;
const DATA_REFRESH_INTERVAL = 30000;

interface UseTransportDataOptions {
  spreadsheetId: string;
  apiKey: string;
}

export function useTransportData({ spreadsheetId, apiKey }: UseTransportDataOptions) {
  const [sheets, setSheets] = useState<SheetTab[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<SheetTab | null>(null);
  const [allExpenses, setAllExpenses] = useState<TransportExpense[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransportFilters>({
    clientSearch: '',
    comercialFilter: '',
    lineaNegocioFilter: '',
  });

  // Track selected sheet in a ref to use inside intervals without stale closure
  const selectedSheetRef = useRef<SheetTab | null>(null);
  selectedSheetRef.current = selectedSheet;

  const loadSheets = useCallback(async (silent = false) => {
    if (!spreadsheetId || !apiKey) return;

    try {
      if (!silent) setLoadingSheets(true);
      const tabs = await fetchSheetTabs(spreadsheetId, apiKey);
      setSheets(prev => {
        // Auto-select first sheet on initial load
        if (prev.length === 0 && tabs.length > 0 && !selectedSheetRef.current) {
          setSelectedSheet(tabs[0]);
        }
        return tabs;
      });
      setError(null);
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : 'Error al cargar hojas');
    } finally {
      if (!silent) setLoadingSheets(false);
    }
  }, [spreadsheetId, apiKey]);

  const loadData = useCallback(async (sheet: SheetTab, silent = false) => {
    if (!spreadsheetId || !apiKey) return;

    try {
      if (!silent) setLoadingData(true);
      const data = await fetchTransportExpenses(spreadsheetId, sheet.title, apiKey);
      setAllExpenses(data);
      setError(null);
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      if (!silent) setLoadingData(false);
    }
  }, [spreadsheetId, apiKey]);

  // Initial load of sheet list
  useEffect(() => {
    loadSheets();
  }, [loadSheets]);

  // Load data when selected sheet changes
  useEffect(() => {
    if (selectedSheet) {
      loadData(selectedSheet);
    }
  }, [selectedSheet, loadData]);

  // Auto-refresh sheet list to detect new tabs
  useEffect(() => {
    const interval = setInterval(() => loadSheets(true), SHEET_LIST_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadSheets]);

  // Auto-refresh data for the current sheet
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedSheetRef.current) {
        loadData(selectedSheetRef.current, true);
      }
    }, DATA_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadSheets();
    if (selectedSheetRef.current) {
      await loadData(selectedSheetRef.current);
    }
  }, [loadSheets, loadData]);

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(expense => {
      if (filters.clientSearch) {
        const search = filters.clientSearch.toLowerCase();
        const matches =
          expense.clientCode.toLowerCase().includes(search) ||
          expense.clientName.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (filters.comercialFilter) {
        if (expense.comercial.toLowerCase() !== filters.comercialFilter.toLowerCase()) return false;
      }

      if (filters.lineaNegocioFilter) {
        if (expense.lineaNegocio.toLowerCase() !== filters.lineaNegocioFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [allExpenses, filters]);

  const loading = loadingSheets || loadingData;

  return {
    sheets,
    selectedSheet,
    setSelectedSheet,
    expenses: filteredExpenses,
    allExpenses,
    loading,
    loadingSheets,
    loadingData,
    error,
    filters,
    setFilters,
    refresh,
  };
}
