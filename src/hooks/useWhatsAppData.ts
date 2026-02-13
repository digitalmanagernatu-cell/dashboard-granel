import { useState, useEffect, useMemo, useCallback } from 'react';
import type { WhatsAppMessage, WhatsAppConversation, WhatsAppFilters } from '../types/transfer';
import { fetchWhatsAppLogs, parseDate } from '../services/googleSheets';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';

// Auto-refresh interval in milliseconds (30 seconds)
const AUTO_REFRESH_INTERVAL = 30000;

interface UseWhatsAppDataOptions {
  spreadsheetId: string;
  sheetGid?: string;
}

export function useWhatsAppData({ spreadsheetId, sheetGid = '0' }: UseWhatsAppDataOptions) {
  const [allMessages, setAllMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [filters, setFilters] = useState<WhatsAppFilters>({
    startDate: null,
    endDate: null,
    searchTerm: '',
  });

  // Silent refresh (doesn't show loading state)
  const silentRefresh = useCallback(async () => {
    if (!spreadsheetId) return;

    try {
      const data = await fetchWhatsAppLogs(spreadsheetId, sheetGid);
      setAllMessages(data);
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
        const data = await fetchWhatsAppLogs(spreadsheetId, sheetGid);
        setAllMessages(data);
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

  // Group messages by phone into conversations
  const conversations = useMemo((): WhatsAppConversation[] => {
    const phoneMap = new Map<string, WhatsAppMessage[]>();

    // Filter messages first
    const filteredMessages = allMessages.filter((message) => {
      // Filter by date range
      if (filters.startDate || filters.endDate) {
        const messageDate = parseDate(message.timestamp);
        if (messageDate) {
          const start = filters.startDate ? startOfDay(filters.startDate) : new Date(0);
          const end = filters.endDate ? endOfDay(filters.endDate) : new Date();

          if (!isWithinInterval(messageDate, { start, end })) {
            return false;
          }
        }
      }

      // Filter by search term (phone or message text)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesPhone = message.phone.toLowerCase().includes(searchLower);
        const matchesText = message.text.toLowerCase().includes(searchLower);
        if (!matchesPhone && !matchesText) {
          return false;
        }
      }

      return true;
    });

    // Group by phone
    filteredMessages.forEach((message) => {
      const phone = message.phone;
      if (!phoneMap.has(phone)) {
        phoneMap.set(phone, []);
      }
      phoneMap.get(phone)!.push(message);
    });

    // Convert to conversations array
    const conversationList: WhatsAppConversation[] = [];
    phoneMap.forEach((messages, phone) => {
      // Sort messages by timestamp within each conversation
      const sortedMessages = messages.sort((a, b) => {
        const dateA = parseDate(a.timestamp);
        const dateB = parseDate(b.timestamp);
        if (!dateA && !dateB) return a.rowIndex - b.rowIndex;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.getTime() - dateB.getTime();
      });

      // Get the last message date for sorting conversations
      const lastMessageDate = sortedMessages.length > 0
        ? parseDate(sortedMessages[sortedMessages.length - 1].timestamp) || new Date(0)
        : new Date(0);

      conversationList.push({
        phone,
        messages: sortedMessages,
        lastMessageDate,
        messageCount: messages.length,
      });
    });

    // Sort conversations by last message date (most recent first)
    return conversationList.sort((a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime());
  }, [allMessages, filters]);

  // Get selected conversation
  const selectedConversation = useMemo(() => {
    if (!selectedPhone) return null;
    return conversations.find(c => c.phone === selectedPhone) || null;
  }, [conversations, selectedPhone]);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWhatsAppLogs(spreadsheetId, sheetGid);
      setAllMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  return {
    conversations,
    selectedConversation,
    selectedPhone,
    setSelectedPhone,
    allMessages,
    loading,
    error,
    filters,
    setFilters,
    refresh,
  };
}
