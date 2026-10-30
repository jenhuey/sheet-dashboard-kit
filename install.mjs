// Install the sheet-dashboard skill for Claude Code and/or Codex.
//
// usage: node install.mjs            → auto-detect which AI tools are installed
//        node install.mjs --claude   → only Claude Code  (~/.claude/skills/)
//        node install.mjs --codex    → only Codex        (~/.agents/skills/)
//        node install.mjs --all      → both
//        node install.mjs --home <dir>  (testing: pretend <dir> is the home folder)
// An existing copy is moved to ~/.sheet-dashboard-backup/<time>/ first, never deleted.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const hi = argv.indexOf('--home');
const HOME = hi >= 0 ? path.resolve(argv[hi + 1]) : os.homedir();
const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, 'skills', 'sheet-dashboard');
const NAME = 'sheet-dashboard';

if (Number(process.versions.node.split('.')[0]) < 20) {
  console.error('✗ Node.js 版本太旧（' + process.versions.node + '），请到 https://nodejs.org 安装 LTS 版');
  process.exit(1);
}
if (!fs.existsSync(path.join(src, 'SKILL.md'))) {
  console.error('✗ 找不到 skills/sheet-dashboard/SKILL.md，请在解压后的资料夹里执行');
  process.exit(1);
}

const onPath = (cmd) => spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { encoding: 'utf8' }).status === 0;
const TOOLS = {
  claude: { label: 'Claude Code', dir: path.join(HOME, '.claude', 'skills'), found: () => fs.existsSync(path.join(HOME, '.claude')) || onPath('claude') },
  codex: { label: 'Codex', dir: path.join(HOME, '.agents', 'skills'), found: () => fs.existsSync(path.join(HOME, '.codex')) || onPath('codex') },
};

let picked = Object.keys(TOOLS).filter((k) => argv.includes('--' + k));
if (argv.includes('--all')) picked = Object.keys(TOOLS);
if (!picked.length) picked = Object.keys(TOOLS).filter((k) => TOOLS[k].found());
if (!picked.length) {
  console.log('⚠ 没侦测到 Claude Code 或 Codex，两边都先装好。');
  picked = Object.keys(TOOLS);
}

const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
for (const k of picked) {
  const t = TOOLS[k];
  const dest = path.join(t.dir, NAME);
  fs.mkdirSync(t.dir, { recursive: true });
  if (fs.existsSync(dest)) {
    const bak = path.join(HOME, '.sheet-dashboard-backup', stamp, k);
    fs.mkdirSync(path.dirname(bak), { recursive: true });
    fs.renameSync(dest, bak);
    console.log(`  旧版本已备份到 ${bak}`);
  }
  fs.cpSync(src, dest, { recursive: true });
  console.log(`✓ ${t.label}：${dest}`);
}
fs.mkdirSync(path.join(HOME, 'Documents', 'Sheet-Dashboards'), { recursive: true });

console.log(`
安装完成 ✅
下一步：重新打开 ${picked.map((k) => TOOLS[k].label).join(' / ')}，然后说：

    Help me create dashboard

（说中文「帮我做一个 dashboard」也可以）

它会先跟你讨论表格要放哪些栏位，确认后才开始做网页。`);
