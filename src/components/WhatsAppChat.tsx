import type { WhatsAppConversation } from '../types/transfer';
import { format } from 'date-fns';
import { parseDate } from '../services/googleSheets';

interface WhatsAppChatProps {
  conversation: WhatsAppConversation | null;
  onExport: (conversation: WhatsAppConversation) => void;
}

function ExportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

interface WhatsAppChatHeaderProps {
  phone: string;
  messageCount: number;
  onExport: () => void;
  onBack?: () => void;
}

function WhatsAppChatHeader({ phone, messageCount, onExport, onBack }: WhatsAppChatHeaderProps) {
  return (
    <div className="whatsapp-chat-header">
      {onBack && (
        <button className="chat-back-btn" onClick={onBack}>
          <BackIcon />
        </button>
      )}
      <div className="chat-header-info">
        <span className="chat-header-phone">{phone}</span>
        <span className="chat-header-count">{messageCount} mensajes</span>
      </div>
      <button className="chat-export-btn" onClick={onExport} title="Exportar conversación">
        <ExportIcon />
        <span>Exportar</span>
      </button>
    </div>
  );
}

export function WhatsAppChat({ conversation, onExport }: WhatsAppChatProps) {
  if (!conversation) {
    return (
      <div className="whatsapp-chat-empty">
        <div className="empty-chat-message">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>Selecciona una conversación para ver los mensajes</p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: typeof conversation.messages }[] = [];
  let currentDate = '';

  conversation.messages.forEach((message) => {
    const date = parseDate(message.timestamp);
    const dateStr = date ? format(date, 'dd/MM/yyyy') : 'Fecha desconocida';

    if (dateStr !== currentDate) {
      currentDate = dateStr;
      groupedMessages.push({ date: dateStr, messages: [] });
    }
    groupedMessages[groupedMessages.length - 1].messages.push(message);
  });

  return (
    <div className="whatsapp-chat">
      <WhatsAppChatHeader
        phone={conversation.phone}
        messageCount={conversation.messageCount}
        onExport={() => onExport(conversation)}
      />
      <div className="whatsapp-chat-messages">
        {groupedMessages.map((group) => (
          <div key={group.date} className="message-date-group">
            <div className="message-date-divider">
              <span>{group.date}</span>
            </div>
            {group.messages.map((message, index) => (
              <div
                key={`${message.rowIndex}-${index}`}
                className={`chat-bubble ${message.role === 'user' ? 'user' : 'bot'}`}
              >
                <div className="bubble-content">
                  <p>{message.text}</p>
                  <span className="bubble-time">
                    {format(parseDate(message.timestamp) || new Date(), 'HH:mm')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
