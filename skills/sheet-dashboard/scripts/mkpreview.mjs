// Turn Index.html into a local page that runs without Google, then screenshot it with Chrome.
//
// usage: node mkpreview.mjs <Index.html> <results.json> <out.html> [--vars vars.json] [--width 1280] [--shot out.png]
//   results.json = { "<server function>": <its return value> } — from mock_sheets.mjs
//   vars.json    = values for template tags, e.g. { "title": "My Dashboard" } → <?= title ?>
//   --shot       = also take a screenshot (needs Google Chrome / Edge / Chromium; skipped if none found)
// Look at the screenshot yourself before showing anything to the user.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const [src, resultsPath, out] = argv;
if (!src || !resultsPath || !out) { console.error('usage: node mkpreview.mjs <Index.html> <results.json> <out.html> [--shot out.png]'); process.exit(1); }
const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
const varsPath = opt('vars');
const vars = varsPath ? JSON.parse(fs.readFileSync(varsPath, 'utf8')) : { title: results.getDashboardData?.title || 'Dashboard' };

let html = fs.readFileSync(src, 'utf8').replace(/<\?!?=\s*([\w.]+)\s*\?>/g, (_, k) => (k in vars ? String(vars[k]) : ''));
// fake google.script.run: withSuccessHandler(f).anyFn() → f(results[anyFn])
const stub = `<script>
(function () {
  const R = ${JSON.stringify(results)};
  function runner(ok, fail) {
    return new Proxy({}, { get(_, p) {
      if (p === 'withSuccessHandler') return (f) => runner(f, fail);
      if (p === 'withFailureHandler') return (f) => runner(ok, f);
      if (p === 'withUserObject') return () => runner(ok, fail);
      return () => setTimeout(() => (p in R ? ok && ok(R[p]) : fail && fail(new Error('no mock for ' + p))), 0);
    } });
  }
  window.google = { script: { run: runner(null, null), host: { close() {} } } };
  window.onerror = (m) => { document.title = 'JS ERROR: ' + m; };
})();
</script>`;
html = html.includes('<head>') ? html.replace('<head>', '<head>\n' + stub) : stub + html;
fs.writeFileSync(out, html);
console.log('✓ preview → ' + out);

const shot = opt('shot');
if (shot) {
  const candidates = {
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Chromium.app/Contents/MacOS/Chromium'],
    win32: [
      path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Microsoft\\Edge\\Application\\msedge.exe'),
    ],
    linux: ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'],
  }[process.platform] || [];
  const chrome = candidates.find((p) => p && fs.existsSync(p));
  if (!chrome) {
    console.log('⚠ 找不到 Chrome / Edge，跳过截图（可以直接用浏览器打开 ' + out + ' 看）');
  } else {
    const width = opt('width', '1280');
    const r = spawnSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=${width},2600`,
      '--virtual-time-budget=5000', '--screenshot=' + path.resolve(shot), pathToFileURL(path.resolve(out)).href], { encoding: 'utf8' });
    console.log(fs.existsSync(shot) ? '✓ screenshot → ' + shot : '⚠ 截图失败：' + (r.stderr || '').slice(0, 300));
  }
}
