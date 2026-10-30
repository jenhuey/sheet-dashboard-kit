// Run Code.gs locally against sample data, without Google.
//
// usage: node mock_sheets.mjs <Code.gs> <sample.json> <results.json> [--setup]
//   sample.json = { "timeZone": "Asia/Kuala_Lumpur",
//                   "sheets": { "<sheet name>": [["表头1","表头2"], ["值", "+3d", true], …] } }
//     "+3d" / "-2d" / "0d" = a date relative to today;  "2026-11-02" = that date (both become Date objects)
//   results.json ← { "getDashboardData": <what it returned> }   (feed this to mkpreview.mjs)
//   --setup also runs onOpen() on an EMPTY spreadsheet first, to test setupSheet_ (headers, validation…)
//
// The fake objects only have methods that exist in real Apps Script. Calling anything else throws,
// so a test can't pass with code that would break online. Add a method here only after checking
// it exists at https://developers.google.com/apps-script/reference/spreadsheet
import fs from 'node:fs';
import vm from 'node:vm';

const [codePath, samplePath, outPath] = process.argv.slice(2);
if (!codePath || !samplePath || !outPath) { console.error('usage: node mock_sheets.mjs <Code.gs> <sample.json> <results.json> [--setup]'); process.exit(1); }
const sample = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
const TZ = sample.timeZone || 'Asia/Kuala_Lumpur';

function strict(name, obj) {
  return new Proxy(obj, {
    get(t, p) {
      if (p in t || typeof p === 'symbol' || p === 'then' || p === 'toJSON') return t[p];
      throw new Error(`${name}.${String(p)}() 不存在（或 mock 还没实作）— 先确认真的 Apps Script 有这个方法`);
    },
  });
}

function toValue(v) {
  if (typeof v === 'string' && /^[+-]?\d+d$/.test(v)) {
    const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + parseInt(v, 10)); return d;
  }
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v + 'T12:00:00');
  return v == null ? '' : v;
}

function makeSheet(ss, name, rows = []) {
  const grid = rows.map((r) => r.map(toValue));
  const at = (r, c) => (grid[r - 1] && grid[r - 1][c - 1] !== undefined ? grid[r - 1][c - 1] : '');
  const put = (r, c, v) => { while (grid.length < r) grid.push([]); const row = grid[r - 1]; while (row.length < c) row.push(''); row[c - 1] = v; };
  const range = (r, c, nr = 1, nc = 1) => {
    const self = strict('Range', {
      getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => at(r + i, c + j))),
      getValue: () => at(r, c),
      setValue: (v) => { put(r, c, v); return self; },
      setValues: (vals) => { vals.forEach((row, i) => row.forEach((v, j) => put(r + i, c + j, v))); return self; },
      insertCheckboxes: () => { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) if (at(r + i, c + j) === '') put(r + i, c + j, false); return self; },
      setFontWeight: () => self, setBackground: () => self, setFontColor: () => self, setVerticalAlignment: () => self,
      setHorizontalAlignment: () => self, setNumberFormat: () => self, setWrap: () => self, setDataValidation: () => self,
      setFontSize: () => self, setBorder: () => self, setNote: () => self, clearContent: () => self,
      getRow: () => r, getColumn: () => c, getNumRows: () => nr, getNumColumns: () => nc,
    });
    return self;
  };
  const sheet = strict('Sheet', {
    getName: () => name,
    setName: (n) => { delete ss._sheets[name]; name = n; ss._sheets[n] = sheet; return sheet; },
    getLastRow: () => { for (let i = grid.length; i > 0; i--) if (grid[i - 1].some((v) => v !== '')) return i; return 0; },
    getLastColumn: () => grid.reduce((m, row) => { for (let j = row.length; j > 0; j--) if (row[j - 1] !== '') return Math.max(m, j); return m; }, 0),
    getRange: (a, b, c, d) => {
      if (typeof a === 'string') throw new Error('mock 只支援 getRange(row, col, numRows, numCols)');
      return range(a, b, c, d);
    },
    getDataRange: () => range(1, 1, Math.max(sheet.getLastRow(), 1), Math.max(sheet.getLastColumn(), 1)),
    setFrozenRows: () => sheet, setFrozenColumns: () => sheet, setColumnWidth: () => sheet, setRowHeight: () => sheet,
    hideSheet: () => sheet, getMaxRows: () => 1000, getMaxColumns: () => 26,
  });
  return sheet;
}

function makeSpreadsheet(def) {
  const ss = { _sheets: {}, _order: [] };
  const api = strict('Spreadsheet', {
    _sheets: ss._sheets,
    getSheetByName: (n) => ss._sheets[n] || null,
    getSheets: () => Object.values(ss._sheets),
    insertSheet: (n) => (ss._sheets[n] = makeSheet(api, n)),
    getSpreadsheetTimeZone: () => TZ,
    getSpreadsheetLocale: () => 'en_GB',
    setSpreadsheetLocale: () => {}, setSpreadsheetTimeZone: () => {},
    getUrl: () => 'https://docs.google.com/spreadsheets/d/MOCK/edit',
    getId: () => 'MOCK', getName: () => 'Mock', toast: () => {},
  });
  for (const [n, rows] of Object.entries(def)) ss._sheets[n] = makeSheet(api, n, rows);
  return api;
}

function pad(n) { return String(n).padStart(2, '0'); }
function formatDate(d, tz, pattern) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(d).map((x) => [x.type, x.value]));
  const MMM = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(p.month) - 1];
  return pattern.replace(/yyyy|MMM|MM|dd|d|HH|mm/g, (k) => ({ yyyy: p.year, MMM, MM: p.month, dd: p.day, d: String(Number(p.day)), HH: pad(Number(p.hour)), mm: p.minute }[k]));
}

function runCode(spreadsheet) {
  const validation = () => { const b = strict('DataValidationBuilder', { requireValueInList: () => b, requireDate: () => b, requireCheckbox: () => b, requireNumberBetween: () => b, setAllowInvalid: () => b, setHelpText: () => b, build: () => ({}) }); return b; };
  const menu = () => { const m = strict('Menu', { addItem: () => m, addSeparator: () => m, addSubMenu: () => m, addToUi: () => {} }); return m; };
  const html = () => { const h = strict('HtmlOutput', { setTitle: () => h, addMetaTag: () => h, setWidth: () => h, setHeight: () => h, setXFrameOptionsMode: () => h, evaluate: () => h }); return h; };
  const ctx = {
    console, Date, JSON, Math,
    SpreadsheetApp: strict('SpreadsheetApp', {
      openById: () => spreadsheet, getActiveSpreadsheet: () => spreadsheet, getActive: () => spreadsheet,
      newDataValidation: validation, getUi: () => strict('Ui', { createMenu: menu, showModalDialog: () => {}, alert: () => {} }),
    }),
    Utilities: strict('Utilities', { formatDate }),
    Session: strict('Session', { getScriptTimeZone: () => TZ }),
    HtmlService: strict('HtmlService', { createTemplateFromFile: html, createHtmlOutputFromFile: html, createHtmlOutput: html }),
    ScriptApp: strict('ScriptApp', { getService: () => ({ getUrl: () => 'https://script.google.com/macros/s/MOCK/exec' }) }),
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(codePath, 'utf8'), ctx, { filename: 'Code.gs' });
  return ctx;
}

const results = {};
if (process.argv.includes('--setup')) {
  const empty = makeSpreadsheet({ Sheet1: [] });
  const ctx = runCode(empty);
  vm.runInContext('onOpen()', ctx);
  vm.runInContext('reformatSheet()', ctx);
  const names = empty.getSheets().map((s) => s.getName());
  const first = empty.getSheets()[0];
  const header = first.getRange(1, 1, 1, first.getLastColumn()).getValues()[0];
  console.log('✓ setup：分页 ' + JSON.stringify(names) + '，表头 ' + JSON.stringify(header));
  results._setup = { sheets: names, header };
}
const ctx = runCode(makeSpreadsheet(sample.sheets));
results.getDashboardData = JSON.parse(JSON.stringify(vm.runInContext('getDashboardData()', ctx)));
fs.writeFileSync(outPath, JSON.stringify(results, null, 1));
console.log(`✓ getDashboardData：${results.getDashboardData.rows?.length ?? '?'} 笔 → ${outPath}`);
