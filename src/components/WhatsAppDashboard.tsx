import { useWhatsAppData } from '../hooks/useWhatsAppData';
import { WhatsAppFilters } from './WhatsAppFilters';
import { WhatsAppConversationList } from './WhatsAppConversationList';
import { WhatsAppChat } from './WhatsAppChat';
import type { WhatsAppConversation } from '../types/transfer';
import { format } from 'date-fns';
import { parseDate } from '../services/googleSheets';

// WhatsApp Sheet configuration
const WHATSAPP_SPREADSHEET_ID = '1HvPS2gxMTsOidzVsAjQQRziM2LJ8KHu37A4yhBvgcsU';

function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

export function WhatsAppDashboard() {
  const {
    conversations,
    selectedConversation,
    selectedPhone,
    setSelectedPhone,
    loading,
    error,
    filters,
    setFilters,
    refresh,
  } = useWhatsAppData({ spreadsheetId: WHATSAPP_SPREADSHEET_ID });

  const handleExport = (conversation: WhatsAppConversation) => {
    // Create text content for export
    let content = `Conversación con ${conversation.phone}\n`;
    content += `Exportado el ${format(new Date(), 'dd/MM/yyyy HH:mm')}\n`;
    content += `Total de mensajes: ${conversation.messageCount}\n`;
    content += '='.repeat(50) + '\n\n';

    conversation.messages.forEach((message) => {
      const date = parseDate(message.timestamp);
      const dateStr = date ? format(date, 'dd/MM/yyyy HH:mm') : message.timestamp;
      const sender = message.role === 'user' ? 'Usuario' : 'Bot';
      content += `[${dateStr}] ${sender}:\n${message.text}\n\n`;
    });

    // Create download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversacion_${conversation.phone.replace(/\D/g, '')}_${format(new Date(), 'yyyyMMdd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={refresh}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="whatsapp-dashboard">
      <div className="whatsapp-header">
        <div className="whatsapp-title-section">
          <h2>Logs de WhatsApp</h2>
          <button
            className="refresh-btn"
            onClick={refresh}
            disabled={loading}
            title="Actualizar datos"
          >
            <RefreshIcon />
          </button>
        </div>
        <WhatsAppFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {loading && conversations.length === 0 ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando conversaciones...</p>
        </div>
      ) : (
        <div className={`whatsapp-content ${selectedPhone ? 'chat-open' : ''}`}>
          <WhatsAppConversationList
            conversations={conversations}
            selectedPhone={selectedPhone}
            onSelectConversation={setSelectedPhone}
          />
          <WhatsAppChat
            conversation={selectedConversation}
            onExport={handleExport}
          />
        </div>
      )}
    </div>
  );
}
