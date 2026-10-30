// Check everything the dashboard flow needs and say in plain words what is missing.
// usage: node check_env.mjs [--json]
// exit 0 = all ready, 1 = something to fix (see the ✗ lines / "next" in JSON)
import { spawnSync } from 'node:child_process';
import { accessToken, scriptApi } from './lib.mjs';

const r = { node: null, clasp: null, login: null, email: null, appsScriptApi: null, next: [] };

const major = Number(process.versions.node.split('.')[0]);
r.node = process.versions.node;
if (major < 20) r.next.push('Node.js 版本太旧（需要 20 以上）：到 https://nodejs.org 下载 LTS 版安装后，重开终端机');

const c = spawnSync('clasp', ['--version'], { encoding: 'utf8', shell: process.platform === 'win32' });
r.clasp = c.status === 0 ? c.stdout.trim() : null;
if (!r.clasp) r.next.push('还没装 clasp：执行 npm install -g @google/clasp');

if (r.clasp) {
  try {
    const tok = await accessToken();
    r.login = true;
    const u = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: 'Bearer ' + tok } });
    r.email = (await u.json()).email || null;
    // a made-up project id: 404 = API on, 403 "not enabled" = API off
    const { status, body } = await scriptApi('projects/check-env-probe-0000000000000000000000');
    const msg = JSON.stringify(body);
    r.appsScriptApi = !(status === 403 && /not enabled|has not enabled|usersettings/i.test(msg));
    if (!r.appsScriptApi) r.next.push('Apps Script API 还没打开：打开 https://script.google.com/home/usersettings ，把「Google Apps Script API」切成开启（On），等 1 分钟');
  } catch (e) {
    r.login = false;
    r.next.push('还没登入 Google：执行 clasp login（浏览器会跳出 Google 授权页，选要放表格的账号，全部按允许）');
  }
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(r, null, 1));
} else {
  const ok = (b) => (b ? '✓' : '✗');
  console.log(`${ok(major >= 20)} Node.js ${r.node}`);
  console.log(`${ok(r.clasp)} clasp ${r.clasp || '未安装'}`);
  if (r.clasp) console.log(`${ok(r.login)} Google 登入 ${r.email || ''}`);
  if (r.login) console.log(`${ok(r.appsScriptApi)} Apps Script API`);
  if (r.next.length) console.log('\n还需要：\n' + r.next.map((s, i) => `${i + 1}. ${s}`).join('\n'));
  else console.log('\n全部准备好了 ✅');
}
process.exit(r.next.length ? 1 : 0);
