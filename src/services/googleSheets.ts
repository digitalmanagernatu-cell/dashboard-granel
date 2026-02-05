import type { TransferReceipt } from '../types/transfer';

/**
 * Formats a date string to DD/MM/YYYY format
 * Handles: Date(2026,1,4), 2026-02-04, 2026/02/04
 */
function formatToSpanishDate(dateString: string): string {
  if (!dateString) return '';

  // Handle Google Sheets date format: Date(year, month, day)
  const googleMatch = dateString.match(/Date\((\d+),(\d+),(\d+)\)/);
  if (googleMatch) {
    const year = googleMatch[1];
    const month = String(parseInt(googleMatch[2], 10) + 1).padStart(2, '0');
    const day = googleMatch[3].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  // Handle ISO format: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = dateString.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, '0');
    const day = isoMatch[3].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  // If already in DD/MM/YYYY format, return as is
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }

  return dateString;
}

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

  return rows.map((row: { c: Array<{ v: string | number | null; f?: string } | null> }) => {
    const cells = row.c || [];
    // For dates, always format to DD/MM/YYYY regardless of source format
    const dateCell = cells[3];
    let submissionDate = '';
    if (dateCell) {
      // Prefer formatted value (f) but always convert to Spanish format
      const rawDate = dateCell.f || dateCell.v?.toString() || '';
      submissionDate = formatToSpanishDate(rawDate);
    }

    return {
      clientNumber: cells[0]?.f || cells[0]?.v?.toString() || '',
      clientName: cells[1]?.f || cells[1]?.v?.toString() || '',
      orderNumber: cells[2]?.f || cells[2]?.v?.toString() || '',
      submissionDate,
      receiptUrl: cells[4]?.f || cells[4]?.v?.toString() || '',
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

  // Handle ISO format: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = dateString.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return new Date(year, month, day);
  }

  // Handle Spanish date formats: DD/MM/YYYY or DD-MM-YYYY
  const spanishMatch = dateString.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/);
  if (spanishMatch) {
    const day = parseInt(spanishMatch[1], 10);
    const month = parseInt(spanishMatch[2], 10) - 1;
    const year = parseInt(spanishMatch[3], 10);
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
