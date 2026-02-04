import type { TransferReceipt, GoogleSheetsResponse } from '../types/transfer';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export async function fetchTransferReceipts(
  spreadsheetId: string,
  range: string,
  apiKey: string
): Promise<TransferReceipt[]> {
  const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/${range}?key=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }

  const data: GoogleSheetsResponse = await response.json();

  if (!data.values || data.values.length <= 1) {
    return [];
  }

  // Skip header row (first row)
  const rows = data.values.slice(1);

  return rows.map((row) => ({
    clientNumber: row[0] || '',
    clientName: row[1] || '',
    orderNumber: row[2] || '',
    submissionDate: row[3] || '',
    receiptUrl: row[4] || '',
  }));
}

export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;

  // Handle common Spanish date formats: DD/MM/YYYY or DD-MM-YYYY
  const parts = dateString.split(/[\/\-]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const fullYear = year < 100 ? 2000 + year : year;
    return new Date(fullYear, month, day);
  }

  // Try native parsing as fallback
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function convertDriveUrlToViewable(url: string): string {
  if (!url) return '';

  // Convert Google Drive sharing URLs to direct viewable URLs
  // Format: https://drive.google.com/file/d/FILE_ID/view -> thumbnail or direct link
  const driveFileMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch) {
    const fileId = driveFileMatch[1];
    // Use thumbnail endpoint for images
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }

  // Format: https://drive.google.com/open?id=FILE_ID
  const openIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch) {
    const fileId = openIdMatch[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }

  // If it's already a direct image URL, return as is
  return url;
}
