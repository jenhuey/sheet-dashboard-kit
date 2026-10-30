---
name: sheet-dashboard
description: 帮使用者从零做一个「Google Sheet 表格 + 实时网页 Dashboard」（Apps Script），或修改已经做好的 dashboard。触发：「Help me create dashboard」「帮我做一个 dashboard / 追踪表 / 表格」「我想追踪…」「帮我更新 <名字> dashboard」「Help me update <name> dashboard」。Use when the user wants to build a Google Sheets tracker with a live web dashboard (Apps Script + clasp), or update one they made before.
---

# Sheet Dashboard

帮**不懂程式**的使用者：先一起设计一张好填的 Google Sheet，再自动做出一个实时读这张表的网页 Dashboard，最后把这个专案的资料记下来，下次一句话就能接着改。

`<skill>` = 这个 SKILL.md 所在的资料夹。脚本都用 `node <skill>/scripts/<名字>.mjs` 执行（Mac / Windows 都一样）。
每个 dashboard 的资料夹：`~/Documents/Sheet-Dashboards/<名字>/`（Windows：`%USERPROFILE%\Documents\Sheet-Dashboards\<名字>\`）。

## 跟使用者沟通的规则（每个阶段都适用）
- 用使用者的语言、白话回答；不要丢术语（clasp、deploy、manifest…）给他，真的要提就顺便一句话解释。
- **一次只问一件事**。需要他选的时候，有提问工具就用；没有就列出 2–4 个编号选项，请他回数字。永远多一个「其他：自己说」。
- 需要他动手的步骤（打开某个网址、按某个按钮）要写清楚「在哪里、按什么、会看到什么」。
- 每个阶段结束前要他明确说 OK 才往下走。**阶段 1 还没确认，绝对不要开始做 dashboard 或装任何东西。**

---

## 阶段 0：先判断是「新做」还是「修改」
- 使用者说「帮我更新 / 修改 <名字> dashboard」或「Help me update <name> dashboard」→ 去 `~/Documents/Sheet-Dashboards/` 找对应资料夹，读 `PROJECT.md` 和 `project.json`，直接跳到**阶段 4**。找不到就列出现有资料夹让他选。
- 其他情况 → 阶段 1。

## 阶段 1：讨论表格（还没确认前不做别的）
目标：一张**只放要手动填的栏位**、一看就会填的表。提问题库、栏位原则、范例都在 `references/table-interview.md`，先读。

1. 先问：「你想用这个表格追踪什么？」如果他说不知道 / 很模糊，就从 `table-interview.md` 的范例挑 3–4 个最接近他工作的给他选。
2. 再依序问（每次一题）：现在平常怎么记？谁会填？**打开 dashboard 时最想一眼看到什么？**（给选项：逾期的事、完成率、每个分类的进度、本月做了多少…）
3. 设计栏位：
   - **目标 5–8 栏，最多 10 栏**。能自动算的（天数、是否逾期、本月几件、完成率）**不放进表格**，交给 dashboard 算。
   - 每栏决定类型：文字 / 下拉选单（给选项）/ 日期 / 打勾 / 数字 / 网址。能用下拉选单就不要让人打字。
   - 决定 dashboard 怎么用这些栏：哪栏是名称、哪栏用来分组、哪栏是截止日、哪栏是状态、什么算「完成」。
4. 用表格秀给他看：栏位名称 | 类型 | 怎么填 | 范例（2–3 行假资料），再加一句「Dashboard 会帮你算：…」。
5. 问「这样可以吗？想加、删、改哪一栏？」改到他说 OK。
6. 顺便问 dashboard 的名字（会变成网页标题和资料夹名称）。

## 阶段 2：准备上线环境（确认表格后主动做）
1. 执行 `node <skill>/scripts/check_env.mjs`，照「还需要」的清单一项一项处理：
   - **没有 Node.js**：请他到 https://nodejs.org 下载左边的 LTS 版、一路按下一步安装，装好后重开这个 AI 工具。（Mac 有 Homebrew 的话也可以经他同意后执行 `brew install node`；Windows 可用 `winget install OpenJS.NodeJS.LTS`。）
   - **没有 clasp**：直接帮他执行 `npm install -g @google/clasp`（clasp = Google 官方的 Apps Script 工具，用来把程式放上 Google）。权限不足时 Mac 改用 `sudo` 前先问他。
   - **Apps Script API 没开**：请他打开 https://script.google.com/home/usersettings ，用要放表格的 Google 账号登入，把「Google Apps Script API」切成「开启 / On」。
   - **还没登入**：执行 `clasp login`，告诉他「浏览器会跳出 Google 授权页面，选要放表格的那个账号，全部按允许，看到 Logged in 就可以回来」。如果你的环境开不了浏览器，就请他自己打开终端机（Mac：终端机 Terminal；Windows：PowerShell）输入 `clasp login`。
   - 再跑一次 `check_env.mjs`，全部 ✓ 才继续。
2. 问他表格要放在哪：
   - **A. 帮我新建一个 Google Sheet**（最简单，推荐）
   - **B. 我已经有一个 Google Sheet** → 请他贴 Sheet 网址：「打开那个 Google Sheet，复制浏览器最上面的网址贴给我，长这样：`https://docs.google.com/spreadsheets/d/一长串英数字/edit`，中间那串就是 Sheet ID」
   - **C. 我的 Sheet 已经有 Apps Script / 旧 dashboard** → 请他给 Script ID + 网址：「打开 Sheet → 上方选单『扩充功能 Extensions』→『Apps Script』→ 左边齿轮 ⚙️『专案设定 Project Settings』→ 复制『指令码 ID / Script ID』」；dashboard 网址：「Apps Script 右上角『部署 Deploy』→『管理部署作业 Manage deployments』→ 复制网页应用程式网址」。
3. 问谁要看 dashboard（决定存取权 `--access`）：
   - 只有我自己 → `MYSELF`（默认，最安全）
   - 公司 / 有 Google 账号的同事 → `ANYONE`（要登入 Google 才能看）
   - 任何拿到网址的人 → `ANYONE_ANONYMOUS`（不用登入；提醒他表格内容等于公开）

## 阶段 3：自动做 dashboard
1. 建资料夹 `~/Documents/Sheet-Dashboards/<名字>/apps-script/`，复制 `<skill>/templates/Code.gs` 和 `Index.html` 进去。
2. 改 `Code.gs` 的 `CONFIG`：`title`、`sheetName`、`columns`（阶段 1 定好的栏位）、`roles`、`palette`。把 `{{TITLE}}` / `{{SHEET_NAME}}` 换掉。
   - 版面先用模板的（数字卡 → 重点卡 → 状态分布 → 待处理清单 → 各组明细），再依他「最想一眼看到什么」调整，原则见 `references/design-guide.md`。
   - 配色：问他有没有品牌色 / 喜欢的颜色；没有就让他从 ocean（蓝）/ berry（莓红）/ forest（绿）选一个。
   - 网页文字在 `Index.html` 的 `TEXT` 物件，使用者不是用简体中文就整组翻译。
3. **本地测试（一定要做，不要让使用者当测试员）**：
   - 参考 `<skill>/templates/sample.json` 的格式，依他的栏位写一份 `sample.json`（6–10 笔像真的假资料，日期用 `"+3d"` / `"-2d"`，含逾期、快到期、已完成、长文字、网址），放在暂存资料夹，不要放进专案资料夹。
   - `node <skill>/scripts/mock_sheets.mjs <apps-script>/Code.gs sample.json results.json --setup`
   - `node <skill>/scripts/mkpreview.mjs <apps-script>/Index.html results.json preview.html --shot shot.png`（再用 `--width 500 --shot shot-m.png` 看手机版）
   - **自己打开截图看过**：数字对不对、有没有跑版、手机能不能看。有问题就修完再测。
4. 上线：
   - 新建（A / B）：`node <skill>/scripts/create_project.mjs <专案资料夹> --title "<名字>" --access <权限> [--sheet <Sheet 网址>]`
   - 已有专案（C）：`node <skill>/scripts/clasp_link.mjs <专案资料夹> <Script ID> <dashboard 网址>`，然后把阶段 1 的修改合并进拉下来的码，再用 `clasp_deploy.mjs` 上线。
   - 脚本会输出 `project.json`（含三个链接）。
5. 给他三个链接，并说明：
   - 📊 **Dashboard**（`links.dashboard`）：「第一次打开会出现『需要授权』，按『审查权限』→ 选你的账号 →（如果出现『Google 尚未验证这个应用程式』就按『进阶』→『前往…（不安全）』，这是你自己的程式，没关系）→ 允许。之后就不会再问。」
   - 📄 **Google Sheet**（`links.sheet`）：「打开后几秒，表头和下拉选单会自动出现；上方会多一个『📊 Dashboard』选单。」
   - 🛠 **Apps Script**（`links.editor`）：「这是程式本体，一般不用打开；**请不要在这里直接改程式**，要改跟我说就好。」
6. 请他填几笔真资料，刷新 dashboard 看看，告诉你哪里想改。

## 阶段 4：修改 → 定案 → 记下来
1. 每次修改：
   - 改 `<专案资料夹>/apps-script/` 的码 → 用新的 sample 资料重跑阶段 3 的测试并看截图。
   - `node <skill>/scripts/clasp_deploy.mjs <专案资料夹> "<这次改了什么>"`
   - 请他刷新 dashboard（Mac：Cmd+Shift+R；Windows：Ctrl+Shift+R）。网址不会变。
   - 改了栏位：请他在 Sheet 按「📊 Dashboard → 重新整理表格格式」。新栏位会加在最右边，旧资料不会动；**删栏位或改栏位名称前先跟他确认**（Sheet 里的旧栏位要他自己删 / 改名）。
   - `clasp_deploy.mjs` 回报「线上被手动改过」（exit 2）：表示有人在 Apps Script 编辑器直接改了程式。打开它给的线上版本，跟本地比较、合并后再上线；不要直接覆盖。
2. 他说「OK / 满意 / 就这样」之后，**主动**：
   - 依 `<skill>/templates/PROJECT.md` 写 `<专案资料夹>/PROJECT.md`：链接、ID、栏位定义、dashboard 显示什么、他的偏好（配色、不要的东西）、修改记录（日期 + 改了什么）。
   - 清楚告诉他：

     > 已经帮你记好了 ✅ 以后要修改，打开 Claude Code / Codex 说：
     > **「帮我更新 <名字> dashboard」**（英文：**Help me update <名字> dashboard**）
     > 再说要改什么就可以，网址都不会变。

3. 之后每次修改完，都在 `PROJECT.md` 的修改记录加一行。

---

## 出问题时
常见问题和解法在 `references/gotchas.md`（授权、登入过期、网页没变、日期格式、#REF! …）。先查那里再自己想办法。
