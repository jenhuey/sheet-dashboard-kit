/**
 * {{TITLE}} — Google Sheet + 网页 Dashboard
 *
 * 表格栏位只在 CONFIG.columns 定义一次：
 *   - 打开 Sheet 时（onOpen）会自动补上缺少的栏位、下拉选单、日期格式，不会动到已经填的资料
 *   - 网页（Index.html）依同一份 CONFIG 画出 Dashboard
 * 改完 CONFIG 可在 Sheet 菜单按「📊 Dashboard → 重新整理表格格式」。
 */
const CONFIG = {
  title: '{{TITLE}}',
  spreadsheetId: '', // create_project.mjs 会自动填入
  sheetName: '{{SHEET_NAME}}',
  palette: 'ocean', // ocean / berry / forest / custom（custom 改 Index.html 的 --c1…--c4）
  dataRows: 500, // 预先套用下拉选单 / 格式的列数
  // type: text | select | date | checkbox | number | url
  columns: [
    { key: 'item', label: '项目', type: 'text', width: 260 },
    { key: 'group', label: '分类', type: 'select', options: ['A', 'B', 'C'] },
    { key: 'due', label: '截止日', type: 'date' },
    { key: 'status', label: '状态', type: 'select', options: ['未开始', '进行中', '完成'] },
    { key: 'note', label: '备注', type: 'text', width: 300 },
  ],
  // Dashboard 用哪一栏做什么；表格没有这种栏位就填 null
  roles: {
    title: 'item', // 每一笔的名称
    group: 'group', // 分组切换按钮 + 各组明细
    date: 'due', // 逾期 / 快到期
    status: 'status', // 状态分布
    doneStatus: ['完成'], // status 是这些值 = 完成
    doneCheckbox: null, // 或用一个 checkbox 栏位的 key 表示完成
  },
  dueSoonDays: 7,
};

// ---------- 网页 ----------

function doGet() {
  const t = HtmlService.createTemplateFromFile('Index');
  t.title = CONFIG.title;
  return t.evaluate()
    .setTitle(CONFIG.title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** 网页用 google.script.run 呼叫。日期一律转成 'yyyy-MM-dd' 字串（Date 物件传不过去）。 */
function getDashboardData() {
  const ss = ss_();
  const tz = ss.getSpreadsheetTimeZone();
  const sheet = ss.getSheetByName(CONFIG.sheetName);
  const rows = [];
  if (sheet && sheet.getLastRow() >= 2) {
    const lastCol = sheet.getLastColumn();
    const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
    const idx = {};
    CONFIG.columns.forEach((c) => { idx[c.key] = header.indexOf(c.label); });
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, lastCol).getValues();
    values.forEach((r, n) => {
      const row = { _row: n + 2 };
      let filled = false;
      CONFIG.columns.forEach((c) => {
        const v = idx[c.key] >= 0 ? r[idx[c.key]] : '';
        row[c.key] = cell_(v, c.type, tz);
        if (c.type === 'checkbox' ? v === true : v !== '' && v != null) filled = true;
      });
      if (filled) rows.push(row);
    });
  }
  return {
    title: CONFIG.title,
    palette: CONFIG.palette,
    columns: CONFIG.columns.map((c) => ({ key: c.key, label: c.label, type: c.type, options: c.options || null })),
    roles: CONFIG.roles,
    dueSoonDays: CONFIG.dueSoonDays,
    today: Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd'),
    updatedAt: Utilities.formatDate(new Date(), tz, 'dd/MM/yyyy HH:mm'),
    sheetUrl: ss.getUrl(),
    rows: rows,
  };
}

function cell_(v, type, tz) {
  if (type === 'checkbox') return v === true;
  if (v instanceof Date) return Utilities.formatDate(v, tz, type === 'date' ? 'yyyy-MM-dd' : 'dd/MM/yyyy HH:mm');
  if (type === 'number') return typeof v === 'number' ? v : v === '' || v == null || isNaN(Number(v)) ? null : Number(v);
  return v === '' || v == null ? '' : String(v);
}

// ---------- Sheet ----------

function ss_() {
  return CONFIG.spreadsheetId ? SpreadsheetApp.openById(CONFIG.spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📊 Dashboard')
    .addItem('打开 Dashboard', 'showDashboardLink')
    .addItem('重新整理表格格式', 'reformatSheet')
    .addToUi();
  try { setupSheet_(false); } catch (e) { console.log('setupSheet_: ' + e); }
}

function reformatSheet() {
  setupSheet_(true);
  SpreadsheetApp.getActive().toast('表格格式已更新');
}

function showDashboardLink() {
  const url = ScriptApp.getService().getUrl();
  const html = HtmlService.createHtmlOutput(
    url ? '<p style="font-family:sans-serif"><a href="' + url + '" target="_blank">👉 点这里打开 Dashboard</a></p>'
      : '<p style="font-family:sans-serif">还没有部署网页。</p>'
  ).setWidth(320).setHeight(90);
  SpreadsheetApp.getUi().showModalDialog(html, CONFIG.title);
}

/**
 * 建表头 + 下拉选单 + 格式。只补缺的栏位（加在最右边），不删、不搬既有资料。
 * force=false 时，表头齐全就什么都不做（每次打开 Sheet 都会跑，所以要快）。
 */
function setupSheet_(force) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || ss_();
  let sheet = ss.getSheetByName(CONFIG.sheetName);
  let fresh = false;
  if (!sheet) {
    const only = ss.getSheets();
    if (only.length === 1 && only[0].getLastRow() === 0) {
      sheet = only[0].setName(CONFIG.sheetName); // 新 Sheet 的空白「工作表1」直接拿来用
    } else {
      sheet = ss.insertSheet(CONFIG.sheetName, 0);
    }
    fresh = true;
  }
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  const missing = CONFIG.columns.filter((c) => header.indexOf(c.label) < 0);
  if (!missing.length && !force) return;

  if (header.every((h) => h === '')) {
    fresh = true;
    header.length = 0;
  }
  missing.forEach((c) => {
    header.push(c.label);
    sheet.getRange(1, header.length).setValue(c.label);
  });
  if (fresh) {
    ss.setSpreadsheetLocale('en_GB'); // 日期用 dd/mm/yyyy 输入
    ss.setSpreadsheetTimeZone(Session.getScriptTimeZone());
  }

  const n = CONFIG.dataRows;
  const head = sheet.getRange(1, 1, 1, header.length);
  head.setFontWeight('bold').setBackground('#20373B').setFontColor('#FFFFFF').setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 32);
  CONFIG.columns.forEach((c) => {
    const col = header.indexOf(c.label) + 1;
    const range = sheet.getRange(2, col, n, 1);
    sheet.setColumnWidth(col, c.width || (c.type === 'checkbox' ? 70 : c.type === 'date' ? 110 : 140));
    if (c.type === 'select' && c.options) {
      range.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(c.options, true).setAllowInvalid(true).build());
    } else if (c.type === 'checkbox') {
      range.insertCheckboxes();
    } else if (c.type === 'date') {
      range.setNumberFormat('dd/mm/yyyy');
      range.setDataValidation(SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(true).build());
    } else if (c.type === 'number') {
      range.setNumberFormat('#,##0.##');
    } else {
      range.setWrap(true);
    }
  });
}
