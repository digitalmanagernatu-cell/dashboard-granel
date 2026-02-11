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

export type DashboardView = 'transfers' | 'incidents';
