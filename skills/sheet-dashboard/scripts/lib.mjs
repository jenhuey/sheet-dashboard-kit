// Shared helpers for the sheet-dashboard scripts. Node 18+, works on macOS / Windows / Linux.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const HOME = os.homedir();
export const DASHBOARDS_DIR = path.join(HOME, 'Documents', 'Sheet-Dashboards');
export const TRACKED = ['Code.gs', 'Index.html', 'appsscript.json'];

/** Run clasp (clasp.cmd on Windows). Honours CLASP_USER for a second Google account. */
export function clasp(args, { cwd, quiet = false } = {}) {
  const user = process.env.CLASP_USER ? ['-u', process.env.CLASP_USER] : [];
  const r = spawnSync('clasp', [...user, ...args], { cwd, encoding: 'utf8', shell: process.platform === 'win32' });
  const out = (r.stdout || '') + (r.stderr || '');
  if (r.error) throw new Error('找不到 clasp，请先执行：npm install -g @google/clasp');
  if (r.status !== 0) throw new Error(`clasp ${args.join(' ')} 失败：\n${out.trim()}`);
  if (!quiet && out.trim()) console.log(out.trim());
  return out;
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** Fresh access token from clasp's saved login (~/.clasprc.json). */
export async function accessToken() {
  const rc = path.join(HOME, '.clasprc.json');
  if (!fs.existsSync(rc)) throw new Error('还没登入 clasp，请执行：clasp login');
  const t = readJson(rc).tokens?.[process.env.CLASP_USER || 'default'];
  if (!t?.refresh_token) throw new Error('clasp 登入资料不完整，请重新执行：clasp login');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: t.client_id, client_secret: t.client_secret,
      refresh_token: t.refresh_token, grant_type: 'refresh_token',
    }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error('clasp 登入已过期，请重新执行：clasp login');
  return j.access_token;
}

/** GET an Apps Script API path; returns { status, body }. */
export async function scriptApi(apiPath) {
  const res = await fetch('https://script.googleapis.com/v1/' + apiPath, {
    headers: { Authorization: 'Bearer ' + (await accessToken()) },
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

/** { version, access, executeAs, url } of one web-app deployment. */
export async function deploymentInfo(scriptId, deploymentId) {
  const { status, body } = await scriptApi(`projects/${scriptId}/deployments/${deploymentId}`);
  if (status !== 200) throw new Error(`读不到部署资料 (${status})：${body.error?.message || ''}`);
  const web = (body.entryPoints || []).find((e) => e.entryPointType === 'WEB_APP')?.webApp || {};
  return {
    version: body.deploymentConfig?.versionNumber ?? null,
    access: web.entryPointConfig?.access ?? null,
    executeAs: web.entryPointConfig?.executeAs ?? null,
    url: web.url ?? null,
  };
}

/** Clone the live project into a temp dir; returns { dir, files: {Code.gs|Index.html|appsscript.json: path} }. */
export function cloneOnline(scriptId) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clasp-online-'));
  clasp(['clone', scriptId], { cwd: dir, quiet: true });
  const names = fs.readdirSync(dir);
  const files = {};
  const js = names.filter((n) => n.endsWith('.js') || n.endsWith('.gs'));
  // the editor's server file may be called Code / 代码 / 程式碼 … — treat the single server file as Code.gs
  const code = js.find((n) => /^Code\.(js|gs)$/.test(n)) || (js.length === 1 ? js[0] : null);
  if (code) files['Code.gs'] = path.join(dir, code);
  if (names.includes('Index.html')) files['Index.html'] = path.join(dir, 'Index.html');
  if (names.includes('appsscript.json')) files['appsscript.json'] = path.join(dir, 'appsscript.json');
  return { dir, files, extra: js.filter((n) => n !== code) };
}

/** Same content? JSON compared by value, text byte for byte (line endings normalised). */
export function sameFile(a, b) {
  if (!a || !b || !fs.existsSync(a) || !fs.existsSync(b)) return false;
  const ta = fs.readFileSync(a, 'utf8');
  const tb = fs.readFileSync(b, 'utf8');
  if (a.endsWith('.json')) {
    const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === 'object'
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
    try { return JSON.stringify(canon(JSON.parse(ta))) === JSON.stringify(canon(JSON.parse(tb))); } catch { return false; }
  }
  return ta.replace(/\r\n/g, '\n') === tb.replace(/\r\n/g, '\n');
}

/** Files clasp should push: only the three tracked ones. */
export function writeClaspIgnore(srcDir) {
  fs.writeFileSync(path.join(srcDir, '.claspignore'), '**/**\n' + TRACKED.map((f) => '!' + f).join('\n') + '\n');
}

/** Remember what we last pushed so we can tell when someone edits the code in the browser editor. */
export function saveSnapshot(srcDir) {
  const snap = path.join(srcDir, '.clasp-last-push');
  fs.rmSync(snap, { recursive: true, force: true });
  fs.mkdirSync(snap);
  for (const f of TRACKED) fs.copyFileSync(path.join(srcDir, f), path.join(snap, f));
}

/**
 * After a push, Google may rewrite appsscript.json (key order, time-zone aliases such as
 * Asia/Kuala_Lumpur → Asia/Singapore). Take the online manifest as the truth, then snapshot.
 */
export function syncAfterPush(srcDir, scriptId) {
  const online = cloneOnline(scriptId);
  if (online.files['appsscript.json']) fs.copyFileSync(online.files['appsscript.json'], path.join(srcDir, 'appsscript.json'));
  saveSnapshot(srcDir);
}

/** Syntax-check Code.gs and the inline <script> blocks of Index.html. Throws with a readable message. */
export function syntaxCheck(srcDir) {
  const code = fs.readFileSync(path.join(srcDir, 'Code.gs'), 'utf8');
  try { new Function(code); } catch (e) { throw new Error('Code.gs 语法错误：' + e.message); }
  const html = fs.readFileSync(path.join(srcDir, 'Index.html'), 'utf8').replace(/<\?!?=[\s\S]*?\?>/g, '0');
  [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].forEach((m, i) => {
    try { new Function(m[1]); } catch (e) { throw new Error(`Index.html 第 ${i + 1} 段 <script> 语法错误：${e.message}`); }
  });
}

export function sheetIdFrom(text) {
  if (!text) return null;
  const m = String(text).match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  return m ? m[1] : /^[a-zA-Z0-9_-]{20,}$/.test(text) ? text : null;
}

export function fail(msg, code = 1) {
  console.error('✗ ' + msg);
  process.exit(code);
}
