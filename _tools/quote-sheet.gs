/**
 * Eagle Vision Logistics: quote requests -> Google Sheet
 *
 * Paste this whole file into Extensions > Apps Script inside a Google Sheet that lives in the
 * receiving Gmail account. Then follow README.md, "Quote requests in a spreadsheet".
 * It holds no passwords or keys, so it is safe to keep in the public repository.
 */

var SHEET_NAME = 'Quote requests';
var TIME_ZONE = 'Africa/Accra';
var NOTIFY_EMAIL = '';   // optional: an address to email a short "new row added" note to. Leave '' to skip
                         // (Web3Forms already emails you each request).

// Columns A-I are filled by the website. J-L are for you.
var HEADERS = ['Received', 'Reference', 'Status', 'Name', 'Email', 'Phone / WhatsApp',
               'Service required', 'Shipment route', 'Cargo details',
               'Quote amount', 'Follow-up date', 'Notes'];
var STATUSES = ['New', 'Quoted', 'Won', 'Lost'];
var WEBSITE_COLS = 9;    // columns A-I are stored as plain text, so nothing a visitor types can run as a formula

/** Run this once from the editor (Run > setup) to create the headers and approve permissions. */
function setup() {
  var sheet = getSheet_();
  SpreadsheetApp.getActive().toast('Sheet "' + SHEET_NAME + '" is ready.', 'Eagle Vision', 5);
  return sheet.getName();
}

/** The website calls this for every quote request. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);                      // two requests at the same moment will not overwrite each other
    var p = (e && e.parameter) || {};
    var name = clean_(p.name, 120), email = clean_(p.email, 160), message = clean_(p.message, 3000);
    if (!name || !email || !message) return reply_('missing fields');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply_('bad email');

    var sheet = getSheet_();
    var row = Math.max(sheet.getLastRow(), 1) + 1;
    var values = [
      Utilities.formatDate(new Date(), TIME_ZONE, 'yyyy-MM-dd HH:mm'),
      clean_(p.ref, 30),
      'New',
      name,
      email,
      clean_(p.phone, 40),
      clean_(p.service, 120),
      clean_(p.route, 200),
      message
    ];
    sheet.getRange(row, 1, 1, WEBSITE_COLS).setNumberFormat('@').setValues([values]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, 'New quote request ' + values[1] + ' - ' + name,
        values[6] + '\n' + values[7] + '\n\nOpen the sheet: ' + SpreadsheetApp.getActive().getUrl());
    }
    return reply_('ok');
  } catch (err) {
    return reply_('error: ' + err);
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/** Opening the web app link in a browser shows this, which is a quick way to check the deployment. */
function doGet() {
  return reply_('Eagle Vision quote sheet is running.');
}

/** Optional: run this from the editor to add a fake row and see it appear (delete it afterwards). */
function testRow() {
  doPost({ parameter: { ref: 'QR-TEST-0000', name: 'Test Customer', email: 'test@example.com',
    phone: '+233 20 000 0000', service: 'International Freight Forwarding',
    route: 'Shanghai -> Tema', message: '=1+1 (this should appear as plain text, not 2)' } });
}

/* ---------- helpers ---------- */

function getSheet_() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    // First run: use the empty default tab if there is one, otherwise add a new tab.
    var first = ss.getSheets()[0];
    sheet = (ss.getSheets().length === 1 && first.getLastRow() === 0) ? first.setName(SHEET_NAME) : ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0 || sheet.getRange(1, 1).getValue() !== HEADERS[0]) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
      .setFontWeight('bold').setFontColor('#ffffff').setBackground('#0b2248');
    sheet.setFrozenRows(1);
    var widths = [130, 120, 80, 150, 210, 140, 220, 200, 420, 110, 110, 260];
    widths.forEach(function (w, i) { sheet.setColumnWidth(i + 1, w); });
    sheet.getRange(2, 9, 1000, 1).setWrap(true);
    sheet.getRange(2, 3, 1000, 1).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build());
    sheet.setConditionalFormatRules([
      rule_('New', '#fff4cc', sheet), rule_('Quoted', '#dbe8ff', sheet),
      rule_('Won', '#d6f2dc', sheet), rule_('Lost', '#e6e6e6', sheet)
    ]);
  }
  return sheet;
}

function rule_(status, colour, sheet) {
  return SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$C2="' + status + '"')
    .setBackground(colour).setRanges([sheet.getRange(2, 1, 1000, HEADERS.length)]).build();
}

function clean_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

function reply_(msg) {
  return ContentService.createTextOutput(msg).setMimeType(ContentService.MimeType.TEXT);
}
