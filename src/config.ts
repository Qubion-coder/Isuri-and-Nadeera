// Google Apps Script Web App URL (deployed from code.ts)
export const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbz84BBv8cHHk70hM1SksWq9wLCWVLOdJJKmFrSvylZ7N6GYLihUctZzlumDS0Rc6ogf/exec';

export const isScriptConfigured = () => GOOGLE_SCRIPT_URL.startsWith('https://');

// Sends form fields to the Apps Script. Apps Script does not return CORS
// headers for POST, so the request is fire-and-forget (no-cors).
export async function postToSheet(sheet: 'RSVP' | 'Wishes', fields: Record<string, string>) {
  const body = new URLSearchParams({ sheet, ...fields });
  await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body });
}

export const GROOM_NAME = 'Nadeera';
export const BRIDE_NAME = 'Isuri';

export const RSVP_CONTACTS = [
  { name: 'Nadeera', phone: '070 698 3404' },
  { name: 'Isuri', phone: '078 149 4032' },
];
