// Put local changes online. The dashboard URL stays the same; it just moves to a new version.
//
// usage: node clasp_deploy.mjs <project dir> "<what changed>"
//   1 syntax check
//   2 stop (exit 2) if the code was edited in the browser editor since our last push
//   3 clasp push + deploy to the same deployment
//   4 check the version went up and the access setting did not change
import path from 'node:path';
import { clasp, cloneOnline, deploymentInfo, fail, readJson, sameFile, syncAfterPush, syntaxCheck, TRACKED } from './lib.mjs';

const [dirArg, desc = 'update'] = process.argv.slice(2);
if (!dirArg) fail('usage: node clasp_deploy.mjs <project dir> "<what changed>"');
const projectDir = path.resolve(dirArg);
const src = path.join(projectDir, 'apps-script');
let project;
try { project = readJson(path.join(projectDir, 'project.json')); } catch { fail('找不到 project.json，请先用 create_project.mjs 或 clasp_link.mjs'); }
const { scriptId, deploymentId } = project;

try { syntaxCheck(src); } catch (e) { fail(e.message); }
console.log('✓ 语法检查');

const online = cloneOnline(scriptId);
for (const f of TRACKED) {
  if (!sameFile(online.files[f], path.join(src, '.clasp-last-push', f))) {
    fail(`线上的 ${f} 在网页编辑器被改过了（不是用这个工具改的）。\n  线上版本：${online.files[f] || '(已删除)'}\n  先把线上的修改合并进本地，再执行一次。`, 2);
  }
}
console.log('✓ 线上没有被手动修改');

const before = await deploymentInfo(scriptId, deploymentId);
clasp(['push', '--force'], { cwd: src, quiet: true });
clasp(['deploy', '-i', deploymentId, '-d', desc], { cwd: src, quiet: true });
let after = before;
for (let i = 0; i < 6 && after.version === before.version; i++) {
  await new Promise((r) => setTimeout(r, 2000));
  after = await deploymentInfo(scriptId, deploymentId);
}
if (!(after.version > before.version)) fail(`版本没有更新（还是 v${before.version}）`);
if (after.access !== before.access) fail(`⚠ 存取权被改了：${before.access} → ${after.access}，请检查 appsscript.json 的 webapp.access`);
syncAfterPush(src, scriptId);
console.log(`✓ 已上线 v${before.version} → v${after.version}（存取权 ${after.access}）\n  ${after.url}`);
