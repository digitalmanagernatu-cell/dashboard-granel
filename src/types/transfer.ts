export interface TransferReceipt {
  source: string;
  clientNumber: string;
  clientName: string;
  orderNumber: string;
  submissionDate: string;
  receiptUrl: string;
  rowIndex: number; // Original row position in the sheet (for sorting)
}

export interface Incident {
  incidentNumber: string;   // Column A
  clientNumber: string;     // Column B
  clientName: string;       // Column C
  cif: string;              // Column D
  comercial: string;        // Column E
  invoiceNumber: string;    // Column F
  incidentType: string;     // Column G
  incidentDetails: string;  // Column H
  incidentDate: string;     // Column I
  status: string;           // Column J (Abierta/Cerrada)
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

export type DashboardView = 'transfers' | 'incidents' | 'whatsapp' | 'transport';

// Transport Expenses types
export interface TransportExpense {
  clientCode: string;       // A: Código Cliente
  clientName: string;       // B: Nombre Cliente
  comercial: string;        // C: Comercial
  lineaNegocio: string;     // D: Línea Negocio
  baseImponible: string;    // E: Base Imponible
  totalFacturas: string;    // F: Total Facturas
  seur: string;             // G: SEUR
  palemania: string;        // H: PALEMANIA
  transaher: string;        // I: TRANSAHER
  redur: string;            // J: REDUR
  nacex: string;            // K: NACEX
  dhl: string;              // L: DHL
  dhlExport: string;        // M: DHL_EXPORT
  correos: string;          // N: CORREOS
  totalTransporte: string;  // O: Total Transporte
  porcentajeTransporte: string; // P: % Transporte
  rowIndex: number;
}

export interface SheetTab {
  sheetId: number;
  title: string;
  index: number;
}

export interface TransportFilters {
  clientSearch: string;
  comercialFilter: string;
  lineaNegocioFilter: string;
}
