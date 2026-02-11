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
  source: string;
  clientNumber: string;
  clientName: string;
  orderNumber: string;
  incidentDate: string;
  incidentDetails: string;
  rowIndex: number; // Original row position in the sheet (for sorting)
}

export interface TransferFilters {
  startDate: Date | null;
  endDate: Date | null;
  clientSearch: string;
  orderSearch: string;
  sourceFilter: string;
}

export type DashboardView = 'transfers' | 'incidents';
