// Put a new dashboard online: create the Apps Script (bound to a new or existing Google Sheet),
// push Code.gs + Index.html, make the first web-app deployment, and save the links.
//
// usage: node create_project.mjs <project dir> --title "<名字>" [--sheet <Sheet URL or ID>]
//                                [--access MYSELF|ANYONE|ANYONE_ANONYMOUS] [--tz Asia/Kuala_Lumpur]
//   <project dir>/apps-script/Code.gs and Index.html must already exist (made from templates/).
//   --sheet omitted → a brand-new Google Sheet is created in the user's Drive.
//   Writes <project dir>/project.json and prints it.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { clasp, deploymentInfo, fail, readJson, scriptApi, sheetIdFrom, syncAfterPush, syntaxCheck, writeClaspIgnore } from './lib.mjs';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const projectDir = argv[0] && !argv[0].startsWith('--') ? path.resolve(argv[0]) : null;
const title = opt('title');
const access = opt('access', 'MYSELF');
const tz = opt('tz', Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kuala_Lumpur');
const sheetArg = opt('sheet');
if (!projectDir || !title) fail('usage: node create_project.mjs <project dir> --title "<名字>" [--sheet <url>] [--access MYSELF]');
if (!['MYSELF', 'ANYONE', 'ANYONE_ANONYMOUS', 'DOMAIN'].includes(access)) fail('access 只能是 MYSELF / ANYONE / ANYONE_ANONYMOUS / DOMAIN');

const src = path.join(projectDir, 'apps-script');
if (!fs.existsSync(path.join(src, 'Code.gs')) || !fs.existsSync(path.join(src, 'Index.html'))) fail(`${src} 里要先有 Code.gs 和 Index.html`);
if (fs.existsSync(path.join(src, '.clasp.json'))) fail('这个资料夹已经连到一个 Apps Script 专案了；要更新请用 clasp_deploy.mjs');
const parentId = sheetArg ? sheetIdFrom(sheetArg) : null;
if (sheetArg && !parentId) fail('看不懂这个 Sheet 网址，请贴完整网址（https://docs.google.com/spreadsheets/d/…/edit）');
syntaxCheck(src);

// 1. create the bound script (and the Sheet, if none given) in a scratch dir so clasp can't touch our files
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'clasp-create-'));
const createArgs = ['create', '--title', title, '--type', 'sheets'];
if (parentId) createArgs.push('--parentId', parentId);
const out = clasp(createArgs, { cwd: tmp, quiet: true });
const claspJson = readJson(path.join(tmp, '.clasp.json'));
const scriptId = claspJson.scriptId;
let sheetId = parentId
  || [].concat(claspJson.parentId || []).find(Boolean)
  || (out.match(/(?:spreadsheets\/d\/|open\?id=)([a-zA-Z0-9_-]{20,})/) || [])[1];
if (!sheetId) {
  const { body } = await scriptApi(`projects/${scriptId}`);
  sheetId = body.parentId || null;
}
if (!sheetId) fail('建好了 Apps Script，但找不到 Sheet ID：\n' + out);

// 2. wire the local folder
fs.writeFileSync(path.join(src, '.clasp.json'), JSON.stringify({ scriptId, rootDir: '' }, null, 2) + '\n');
writeClaspIgnore(src);
fs.writeFileSync(path.join(src, 'appsscript.json'), JSON.stringify({
  timeZone: tz,
  dependencies: {},
  exceptionLogging: 'STACKDRIVER',
  runtimeVersion: 'V8',
  webapp: { executeAs: 'USER_DEPLOYING', access },
}, null, 2) + '\n');
// let Code.gs open the Sheet by ID (works from the web app and from triggers)
const codePath = path.join(src, 'Code.gs');
fs.writeFileSync(codePath, fs.readFileSync(codePath, 'utf8').replace(/spreadsheetId:\s*'[^']*'/, `spreadsheetId: '${sheetId}'`));

// 3. push + first deployment
clasp(['push', '--force'], { cwd: src, quiet: true });
const dep = clasp(['deploy', '-d', 'v1'], { cwd: src, quiet: true });
const deploymentId = (dep.match(/(AKfycb[\w-]+)/) || [])[1];
if (!deploymentId) fail('部署失败：\n' + dep);
syncAfterPush(src, scriptId);
const info = await deploymentInfo(scriptId, deploymentId);

const project = {
  title,
  scriptId,
  sheetId,
  deploymentId,
  access: info.access,
  links: {
    dashboard: info.url,
    sheet: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
    editor: `https://script.google.com/d/${scriptId}/edit`,
  },
  createdAt: new Date().toISOString().slice(0, 10),
};
fs.writeFileSync(path.join(projectDir, 'project.json'), JSON.stringify(project, null, 2) + '\n');
console.log(JSON.stringify(project, null, 2));
