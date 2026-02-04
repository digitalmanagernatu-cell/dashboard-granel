import type { TransferReceipt } from '../types/transfer';

/**
 * Fetches transfer receipts from a public Google Sheet
 * Uses the public visualization endpoint (no API key required)
 */
export async function fetchTransferReceipts(
  spreadsheetId: string,
  sheetGid: string = '0'
): Promise<TransferReceipt[]> {
  // Use the public Google Sheets visualization endpoint
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${sheetGid}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error al cargar datos: ${response.statusText}`);
  }

  const text = await response.text();

  // The response is JSONP-like: google.visualization.Query.setResponse({...})
  // We need to extract the JSON part
  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
  if (!jsonMatch) {
    throw new Error('Formato de respuesta inválido');
  }

  const data = JSON.parse(jsonMatch[1]);

  if (!data.table || !data.table.rows) {
    return [];
  }

  // Skip header row if present and map data
  const rows = data.table.rows;

  return rows.map((row: { c: Array<{ v: string | number | null } | null> }) => {
    const cells = row.c || [];
    return {
      clientNumber: cells[0]?.v?.toString() || '',
      clientName: cells[1]?.v?.toString() || '',
      orderNumber: cells[2]?.v?.toString() || '',
      submissionDate: cells[3]?.v?.toString() || '',
      receiptUrl: cells[4]?.v?.toString() || '',
    };
  });
}

export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;

  // Handle Google Sheets date format: Date(year, month, day)
  const googleDateMatch = dateString.match(/Date\((\d+),(\d+),(\d+)\)/);
  if (googleDateMatch) {
    const year = parseInt(googleDateMatch[1], 10);
    const month = parseInt(googleDateMatch[2], 10);
    const day = parseInt(googleDateMatch[3], 10);
    return new Date(year, month, day);
  }

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
