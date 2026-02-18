export interface TransferReceipt {
  source: string;
  clientNumber: string;
  clientName: string;
  orderNumber: string;
  submissionDate: string;
  receiptUrl: string;
  viewed: boolean;          // Column G: Visto (Sí/No)
  rowIndex: number; // Original row position in the sheet (for sorting)
}

export interface Incident {
  source: string;           // Column G
  clientNumber: string;     // Column B
  clientName: string;       // Column C
  orderNumber: string;      // Column D
  incidentType: string;     // Column E
  incidentDetails: string;  // Column F
  incidentDate: string;     // Column A
  status: string;           // Column H (Abierta/Cerrada)
  rowIndex: number;         // Original row position in the sheet (for sorting)
}

export interface TransferFilters {
  startDate: Date | null;
  endDate: Date | null;
  clientSearch: string;
  orderSearch: string;
  sourceFilter: string;
}

export interface IncidentFilters {
  startDate: Date | null;
  endDate: Date | null;
  clientSearch: string;
  orderSearch: string;
  incidentTypeFilter: string;
  statusFilter: string;
}

// WhatsApp Log types
export interface WhatsAppMessage {
  timestamp: string;
  phone: string;
  role: 'user' | 'bot';
  text: string;
  rowIndex: number;
}

export interface WhatsAppConversation {
  phone: string;
  messages: WhatsAppMessage[];
  lastMessageDate: Date;
  messageCount: number;
}

export interface WhatsAppFilters {
  startDate: Date | null;
  endDate: Date | null;
  searchTerm: string;
}

export type DashboardView = 'transfers' | 'incidents' | 'whatsapp';
