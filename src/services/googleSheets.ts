import type { TransferReceipt, Incident, WhatsAppMessage } from '../types/transfer';

/**
 * Formats a date string to DD/MM/YYYY format
 * Handles: Date(2026,1,4), 2026-02-04, 2026/02/04
 */
function formatToSpanishDate(dateString: string): string {
  if (!dateString) return '';

  // Handle Google Sheets date/datetime format: Date(year,month,day) or Date(year,month,day,h,m,s)
  const googleMatch = dateString.match(/Date\((\d+),(\d+),(\d+)/);
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

  // Helper to safely extract cell value from Google Sheets response
  // Handles: { v: "text" }, { v: 123 }, { v: null, f: "text" }, null, undefined
  const getCellValue = (cell: { v?: unknown; f?: string } | null | undefined): string => {
    if (cell === null || cell === undefined) return '';
    // Prefer formatted value (f) which preserves text formatting
    if (typeof cell.f === 'string' && cell.f !== '') return cell.f;
    // Fall back to raw value (v)
    if (cell.v !== null && cell.v !== undefined) return String(cell.v);
    return '';
  };

  return rows.map((row: { c: Array<{ v?: unknown; f?: string } | null> }, index: number) => {
    const cells = row.c || [];

    // For dates, always format to DD/MM/YYYY regardless of source format
    const dateCell = cells[3];
    let submissionDate = '';
    if (dateCell) {
      const rawDate = getCellValue(dateCell);
      submissionDate = formatToSpanishDate(rawDate);
    }

    const viewedRaw = getCellValue(cells[6]).toLowerCase();
    const viewed = viewedRaw === 'sí' || viewedRaw === 'si' || viewedRaw === 'true';

    return {
      source: getCellValue(cells[5]),
      clientNumber: getCellValue(cells[0]),
      clientName: getCellValue(cells[1]),
      orderNumber: getCellValue(cells[2]),
      submissionDate,
      receiptUrl: getCellValue(cells[4]),
      viewed,                              // Column G: Visto
      rowIndex: index, // Track original position for sorting
    };
  });
}

/**
 * Fetches incidents from a public Google Sheet
 * Uses the public visualization endpoint (no API key required)
 * Column mapping:
 * A(0): Nº Incidencia, B(1): Código Cliente, C(2): Nombre Cliente, D(3): CIF,
 * E(4): Comercial, F(5): Nº Factura, G(6): Tipo Incidencia, H(7): Detalle Incidencia,
 * I(8): Fecha, J(9): Estado
 */
export async function fetchIncidents(
  spreadsheetId: string,
  sheetGid: string = '0'
): Promise<Incident[]> {
  // headers=1 tells gviz to skip the first row (column headers)
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${sheetGid}&headers=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error al cargar datos: ${response.statusText}`);
  }

  const text = await response.text();

  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
  if (!jsonMatch) {
    throw new Error('Formato de respuesta inválido');
  }

  const data = JSON.parse(jsonMatch[1]);

  if (!data.table || !data.table.rows) {
    return [];
  }

  const rows = data.table.rows;

  const getCellValue = (cell: { v?: unknown; f?: string } | null | undefined): string => {
    if (cell === null || cell === undefined) return '';
    if (typeof cell.f === 'string' && cell.f !== '') return cell.f;
    if (cell.v !== null && cell.v !== undefined) return String(cell.v);
    return '';
  };

  return rows.map((row: { c: Array<{ v?: unknown; f?: string } | null> }, index: number) => {
    const cells = row.c || [];

    // Column I (index 8): prefer raw value (v), fall back to formatted (f) stripping time
    const dateCell = cells[8];
    let incidentDate = '';
    if (dateCell) {
      let rawDate = dateCell.v !== null && dateCell.v !== undefined ? String(dateCell.v) : '';
      if (!rawDate && typeof dateCell.f === 'string' && dateCell.f) {
        // Strip time portion from formatted value (e.g. "15/4/2026 0:00:00" → "15/4/2026")
        rawDate = dateCell.f.replace(/\s+\d{1,2}:\d{2}(:\d{2})?$/, '').trim();
      }
      incidentDate = formatToSpanishDate(rawDate);
    }

    return {
      incidentNumber: getCellValue(cells[0]),   // Column A: Nº Incidencia
      clientNumber: getCellValue(cells[1]),      // Column B: Código Cliente
      clientName: getCellValue(cells[2]),        // Column C: Nombre Cliente
      cif: getCellValue(cells[3]),               // Column D: CIF
      comercial: getCellValue(cells[4]),         // Column E: Comercial
      invoiceNumber: getCellValue(cells[5]),     // Column F: Nº Factura
      incidentType: getCellValue(cells[6]),      // Column G: Tipo Incidencia
      incidentDetails: getCellValue(cells[7]),   // Column H: Detalle Incidencia
      incidentDate,                              // Column I: Fecha
      status: getCellValue(cells[9]) || 'Pendiente', // Column J: Estado
      gestionadaPor: getCellValue(cells[10]),    // Column K: Gestionada Por
      comentarios: getCellValue(cells[11]),      // Column L: Comentarios
      rowIndex: index,
    };
  });
}

/**
 * Updates the status of an incident in Google Sheets
 * Note: This requires the sheet to be set up with Apps Script web app
 */
export async function updateIncidentStatus(
  webAppUrl: string,
  rowIndex: number,
  newStatus: string
): Promise<boolean> {
  try {
    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateStatus',
        row: rowIndex + 2, // +2: +1 for 0-index, +1 for header row
        column: 'J',
        status: newStatus,
      }),
    });

    // With no-cors mode, we can't read the response
    // We assume success if no error was thrown
    return true;
  } catch (error) {
    console.error('Error updating incident status:', error);
    return false;
  }
}

export async function updateGestionadaPor(
  webAppUrl: string,
  rowIndex: number,
  value: string
): Promise<boolean> {
  try {
    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateGestionadaPor',
        row: rowIndex + 2,
        column: 'K',
        value,
      }),
    });
    return true;
  } catch (error) {
    console.error('Error updating gestionadaPor:', error);
    return false;
  }
}

export async function updateComentarios(
  webAppUrl: string,
  rowIndex: number,
  comentarios: string
): Promise<boolean> {
  try {
    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateComentarios',
        row: rowIndex + 2,
        column: 'L',
        value: comentarios,
      }),
    });
    return true;
  } catch (error) {
    console.error('Error updating comentarios:', error);
    return false;
  }
}

export async function updateTransferViewed(
  webAppUrl: string,
  rowIndex: number,
  viewed: boolean
): Promise<boolean> {
  try {
    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateViewed',
        row: rowIndex + 2,
        viewed: viewed ? 'Sí' : 'No',
      }),
    });
    return true;
  } catch (error) {
    console.error('Error updating viewed status:', error);
    return false;
  }
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

/**
 * Fetches WhatsApp conversation logs from a public Google Sheet
 * Column mapping: A(0): timestamp, B(1): phone, C(2): rol, D(3): texto
 */
export async function fetchWhatsAppLogs(
  spreadsheetId: string,
  sheetGid: string = '0'
): Promise<WhatsAppMessage[]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${sheetGid}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error al cargar datos: ${response.statusText}`);
  }

  const text = await response.text();

  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
  if (!jsonMatch) {
    throw new Error('Formato de respuesta inválido');
  }

  const data = JSON.parse(jsonMatch[1]);

  if (!data.table || !data.table.rows) {
    return [];
  }

  const rows = data.table.rows;

  const getCellValue = (cell: { v?: unknown; f?: string } | null | undefined): string => {
    if (cell === null || cell === undefined) return '';
    if (typeof cell.f === 'string' && cell.f !== '') return cell.f;
    if (cell.v !== null && cell.v !== undefined) return String(cell.v);
    return '';
  };

  return rows.map((row: { c: Array<{ v?: unknown; f?: string } | null> }, index: number) => {
    const cells = row.c || [];

    const timestamp = getCellValue(cells[0]);
    const phone = getCellValue(cells[1]);
    const rol = getCellValue(cells[2]).toLowerCase();
    const text = getCellValue(cells[3]);

    return {
      timestamp,
      phone,
      role: (rol === 'user' || rol === 'usuario') ? 'user' : 'bot',
      text,
      rowIndex: index,
    } as WhatsAppMessage;
  });
}
