/**
 * Nadeera & Isuri — Wedding Invitation backend (Google Apps Script)
 *
 * Paste this whole file into Extensions > Apps Script of the spreadsheet:
 * https://docs.google.com/spreadsheets/d/1aS8-ZvXdzRaZvppUX7s16kPVb24SPjbiaVaWMW7BVYE/edit
 *
 * - "RSVP" and "Wishes" sheets are created automatically (with styled headers)
 *   the first time they are needed. You can also run setup() once by hand.
 * - doPost  : saves RSVP / wishes sent from the website.
 * - doGet   : ?action=wishes returns the latest wishes as JSON for the website.
 */

const SPREADSHEET_ID = '1aS8-ZvXdzRaZvppUX7s16kPVb24SPjbiaVaWMW7BVYE';

const SHEETS = {
  RSVP: {
    name: 'RSVP',
    headers: ['Timestamp', 'Full Name', 'Phone', 'Attending', 'Guests', 'Message / Notes'],
    widths: [170, 220, 140, 110, 80, 360],
  },
  WISHES: {
    name: 'Wishes',
    headers: ['Timestamp', 'Guest Name', 'Message'],
    widths: [170, 220, 520],
  },
};

const HEADER_BG = '#B4376D'; // deep rose (matches the website theme)
const HEADER_TEXT = '#FFFFFF';
const BAND_BG = '#FDF3F4'; // blush rows
const MAX_WISHES_RETURNED = 100;

/* ------------------------------------------------------------------ */
/*  Web app entry points                                               */
/* ------------------------------------------------------------------ */

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const data = parsePayload_(e);
    const key = resolveSheetKey_(data.sheet);

    if (!key) {
      return json_({ ok: false, error: 'Invalid sheet. Use "RSVP" or "Wishes".' });
    }

    const sheet = getOrCreateSheet_(key);

    if (key === 'RSVP') {
      const name = clean_(data.name);
      if (!name) return json_({ ok: false, error: 'Name is required.' });

      sheet.appendRow([
        new Date(),
        name,
        asText_(clean_(data.phone)), // keep the leading 0 in phone numbers
        clean_(data.attendance) || 'Yes',
        clean_(data.guests) || '1',
        clean_(data.message || data.notes || data.dietary),
      ]);
    } else {
      const name = clean_(data.name);
      const message = clean_(data.message);
      if (!name || !message) return json_({ ok: false, error: 'Name and message are required.' });

      sheet.appendRow([new Date(), name, message]);
    }

    return json_({ ok: true, sheet: SHEETS[key].name, row: sheet.getLastRow() });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || '').toLowerCase();

    if (action === 'wishes') {
      return json_({ ok: true, wishes: getWishes_() });
    }

    return json_({ ok: true, message: 'Nadeera & Isuri wedding endpoint is running.' });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

/**
 * Optional: run once from the Apps Script editor (select "setup" > Run)
 * to authorize the script and create both sheets immediately.
 */
function setup() {
  getOrCreateSheet_('RSVP');
  getOrCreateSheet_('WISHES');
}

/* ------------------------------------------------------------------ */
/*  Sheet helpers                                                      */
/* ------------------------------------------------------------------ */

function getOrCreateSheet_(key) {
  const config = SHEETS[key];
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(config.name);

  if (!sheet) {
    sheet = ss.insertSheet(config.name);
  }

  // Add headers when the sheet is new or was cleared
  if (sheet.getLastRow() === 0) {
    writeHeaders_(sheet, config);
  }

  return sheet;
}

function writeHeaders_(sheet, config) {
  const cols = config.headers.length;
  const header = sheet.getRange(1, 1, 1, cols);

  header
    .setValues([config.headers])
    .setFontWeight('bold')
    .setFontColor(HEADER_TEXT)
    .setBackground(HEADER_BG)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 32);

  config.widths.forEach(function (w, i) {
    sheet.setColumnWidth(i + 1, w);
  });

  // Timestamp column format
  sheet.getRange(2, 1, sheet.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');

  // Wrap the last (long text) column
  sheet.getRange(1, cols, sheet.getMaxRows(), 1).setWrap(true);

  // Soft alternating row colors
  try {
    sheet
      .getRange(1, 1, sheet.getMaxRows(), cols)
      .applyRowBanding(SpreadsheetApp.BandingTheme.PINK, true, false)
      .setHeaderRowColor(HEADER_BG)
      .setFirstRowColor('#FFFFFF')
      .setSecondRowColor(BAND_BG);
  } catch (_ignored) {
    // Banding already exists on this range — safe to skip
  }

  // Remove the default extra columns so the sheet looks clean
  const extra = sheet.getMaxColumns() - cols;
  if (extra > 0) sheet.deleteColumns(cols + 1, extra);
}

function getWishes_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.WISHES.name);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();

  return rows
    .filter(function (r) { return r[1] && r[2]; })
    .map(function (r) {
      return {
        timestamp: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
        name: String(r[1]),
        message: String(r[2]),
      };
    })
    .reverse() // newest first
    .slice(0, MAX_WISHES_RETURNED);
}

/* ------------------------------------------------------------------ */
/*  Request helpers                                                    */
/* ------------------------------------------------------------------ */

function resolveSheetKey_(value) {
  const v = String(value || '').trim().toUpperCase();
  if (v === 'RSVP') return 'RSVP';
  if (v === 'WISH' || v === 'WISHES') return 'WISHES';
  return null;
}

function parsePayload_(e) {
  const params = (e && e.parameter) || {};
  if (Object.keys(params).length > 0) return params;

  const body = e && e.postData && e.postData.contents ? e.postData.contents : '';
  if (!body) return {};

  try {
    return JSON.parse(body);
  } catch (_err) {
    const out = {};
    body.split('&').forEach(function (pair) {
      if (!pair) return;
      const i = pair.indexOf('=');
      const k = decodeURIComponent((i >= 0 ? pair.slice(0, i) : pair).replace(/\+/g, ' '));
      const v = decodeURIComponent((i >= 0 ? pair.slice(i + 1) : '').replace(/\+/g, ' '));
      out[k] = v;
    });
    return out;
  }
}

/** Trims input, limits length and blocks spreadsheet formula injection. */
function clean_(value) {
  let s = String(value == null ? '' : value).trim().slice(0, 2000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

/** Forces Sheets to store the value as plain text. */
function asText_(s) {
  return s && s.charAt(0) !== "'" ? "'" + s : s;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
