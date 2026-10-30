// Connect a project folder to an Apps Script project that ALREADY exists (someone made it in the editor).
//
// usage: node clasp_link.mjs <project dir> <Script ID> <dashboard /exec URL or deployment ID> [--title "<名字>"]
//   Script ID = Sheet → 扩充功能 (Extensions) → Apps Script → ⚙️ 专案设定 (Project Settings) → 指令码 ID (Script ID)
// Never overwrites the online code: online Code/Index win. If the local folder already has a
// different Code.gs / Index.html, it stops (exit 2) so the two versions can be merged first.
import fs from 'node:fs';
import path from 'node:path';
import { cloneOnline, deploymentInfo, fail, saveSnapshot, sameFile, scriptApi, writeClaspIgnore } from './lib.mjs';

const [dirArg, scriptId, depArg] = process.argv.slice(2);
const ti = process.argv.indexOf('--title');
if (!dirArg || !scriptId || !depArg) fail('usage: node clasp_link.mjs <project dir> <Script ID> <dashboard URL or deployment ID>');
const projectDir = path.resolve(dirArg);
const src = path.join(projectDir, 'apps-script');
const deploymentId = (depArg.match(/(AKfycb[\w-]+)/) || [])[1];
if (!deploymentId) fail('看不懂部署网址，要长这样：https://script.google.com/macros/s/AKfycb…/exec');

const online = cloneOnline(scriptId);
if (!online.files['Code.gs']) fail('线上专案里找不到程式码档，请确认 Script ID 是对的');
if (online.extra.length) console.log('⚠ 线上还有其他程式码档（' + online.extra.join(', ') + '），本工具只管理 Code.gs / Index.html');
fs.mkdirSync(src, { recursive: true });
for (const f of ['Code.gs', 'Index.html']) {
  const local = path.join(src, f);
  if (fs.existsSync(local) && online.files[f] && !sameFile(local, online.files[f])) {
    fail(`线上的 ${f} 跟本地不一样。线上版本在 ${online.files[f]}，请先合并再执行`, 2);
  }
}
for (const f of ['Code.gs', 'Index.html', 'appsscript.json']) {
  if (online.files[f]) fs.copyFileSync(online.files[f], path.join(src, f));
}
if (!fs.existsSync(path.join(src, 'Index.html'))) fail('线上专案没有 Index.html（不是网页 dashboard？）');
fs.writeFileSync(path.join(src, '.clasp.json'), JSON.stringify({ scriptId, rootDir: '' }, null, 2) + '\n');
writeClaspIgnore(src);
saveSnapshot(src);

const info = await deploymentInfo(scriptId, deploymentId);
const { body } = await scriptApi(`projects/${scriptId}`);
const sheetId = body.parentId || null;
const project = {
  title: ti > 0 ? process.argv[ti + 1] : body.title || path.basename(projectDir),
  scriptId,
  sheetId,
  deploymentId,
  access: info.access,
  links: {
    dashboard: info.url,
    sheet: sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit` : null,
    editor: `https://script.google.com/d/${scriptId}/edit`,
  },
  linkedAt: new Date().toISOString().slice(0, 10),
};
fs.writeFileSync(path.join(projectDir, 'project.json'), JSON.stringify(project, null, 2) + '\n');
console.log('✓ 已连接（线上版本 v' + info.version + '）');
console.log(JSON.stringify(project, null, 2));
