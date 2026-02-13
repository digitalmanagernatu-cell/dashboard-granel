import type { WhatsAppConversation } from '../types/transfer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface WhatsAppConversationListProps {
  conversations: WhatsAppConversation[];
  selectedPhone: string | null;
  onSelectConversation: (phone: string) => void;
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function WhatsAppConversationList({
  conversations,
  selectedPhone,
  onSelectConversation,
}: WhatsAppConversationListProps) {
  const formatLastDate = (date: Date): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffDays = Math.floor((today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return format(date, 'HH:mm');
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return format(date, 'EEEE', { locale: es });
    } else {
      return format(date, 'dd/MM/yyyy');
    }
  };

  const getLastMessage = (conversation: WhatsAppConversation): string => {
    if (conversation.messages.length === 0) return '';
    const lastMsg = conversation.messages[conversation.messages.length - 1];
    const prefix = lastMsg.role === 'bot' ? 'Bot: ' : '';
    const text = lastMsg.text.length > 50 ? lastMsg.text.slice(0, 50) + '...' : lastMsg.text;
    return prefix + text;
  };

  return (
    <div className="whatsapp-conversation-list">
      <div className="conversation-list-header">
        <h3>Conversaciones</h3>
        <span className="conversation-count">{conversations.length}</span>
      </div>
      <div className="conversation-list-items">
        {conversations.length === 0 ? (
          <div className="no-conversations">
            No hay conversaciones
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.phone}
              className={`conversation-item ${selectedPhone === conversation.phone ? 'selected' : ''}`}
              onClick={() => onSelectConversation(conversation.phone)}
            >
              <div className="conversation-avatar">
                <PhoneIcon />
              </div>
              <div className="conversation-info">
                <div className="conversation-header">
                  <span className="conversation-phone">{conversation.phone}</span>
                  <span className="conversation-date">
                    {formatLastDate(conversation.lastMessageDate)}
                  </span>
                </div>
                <div className="conversation-preview">
                  <span className="conversation-last-message">
                    {getLastMessage(conversation)}
                  </span>
                  <span className="conversation-badge">{conversation.messageCount}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
