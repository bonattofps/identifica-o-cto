const SHEET_NAME = 'Registros CTO';
const SPREADSHEET_ID = '';

function doPost(e) {
  try {
    const payload = getPayload_(e);
    const sheet = getSheet_();

    sheet.appendRow([
      new Date(),
      payload.olt || '',
      asText_(payload.pon),
      payload.tecnico || '',
      payload.suporte || '',
      payload.observacoes || '',
      payload.evidencia || ''
    ]);

    SpreadsheetApp.flush();
    return json_({ ok: true, row: sheet.getLastRow() });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function doGet() {
  try {
    const sheet = getSheet_();
    return json_({
      ok: true,
      app: 'Painel Gerador de Logins',
      spreadsheet: sheet.getParent().getName(),
      sheet: sheet.getName(),
      rows: sheet.getLastRow()
    });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function getSheet_() {
  const spreadsheet = getSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  sheet.getRange('C:C').setNumberFormat('@');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Data',
      'OLT',
      'SLOT/PON',
      'Tecnico de Campo',
      'Suporte Responsavel',
      'Observacoes Tecnicas',
      'Link da Evidencia'
    ]);
  }

  return sheet;
}

function asText_(value) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  return "'" + String(value);
}

function getSpreadsheet_() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error('Apps Script sem planilha ativa. Cole este codigo em Extensoes > Apps Script dentro da planilha ou preencha SPREADSHEET_ID.');
  }

  return spreadsheet;
}

function getPayload_(e) {
  if (e && e.parameter && Object.keys(e.parameter).length) {
    return e.parameter;
  }

  const contents = e && e.postData ? e.postData.contents : '{}';

  try {
    return JSON.parse(contents || '{}');
  } catch (error) {
    return {};
  }
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
