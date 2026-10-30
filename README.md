# Sheet Dashboard Kit 📊

**跟 AI 聊天，就能做出「Google Sheet 表格 + 实时网页 Dashboard」。不用会写程式。**

适用：Claude Code、Codex（OpenAI）。

```
你：Help me create dashboard
AI：你想用这个表格追踪什么？…（一起讨论出 5–8 个好填的栏位）
AI：表格确认 ✅ 现在帮你准备环境…（装工具、请你登入 Google）
AI：做好了！📊 Dashboard 网址 / 📄 Google Sheet / 🛠 Apps Script
你：逾期的放最上面，颜色换成红色系
AI：改好了，刷新网页就看得到。
你：OK 很好
AI：已经记下来了。以后说「帮我更新 XX dashboard」就能接着改。
```

---

## 它会帮你做什么

| 步骤 | AI 做的事 | 你要做的事 |
|--|--|--|
| 1. 讨论表格 | 问你问题、给范例、设计**最少**的栏位（能自动算的不放进表格） | 回答问题，说 OK |
| 2. 准备环境 | 检查电脑、安装 Google 的 clasp 工具 | 打开一个 Google 设定开关、登入 Google（各 1 次） |
| 3. 做 Dashboard | 建 Google Sheet、写程式、自己先测试和截图、放上网 | 打开链接，第一次按「授权」 |
| 4. 修改 & 记住 | 照你的意见改，改完自动上线；你满意后写一份记录档 | 说哪里要改；以后一句话就能接着改 |

做出来的 Dashboard 会**实时读你的 Google Sheet**：你在表格填资料，网页刷新就更新，手机也能看。

---

## 开始使用（3 步）

### 第 1 步：准备好 AI 工具
你需要其中一个：
- **Claude Code**：https://claude.com/claude-code
- **Codex**：https://developers.openai.com/codex

还有 **Node.js**（免费）：到 https://nodejs.org 下载 **LTS** 版，一路按「下一步」安装。
（不确定有没有装？没关系，第 2 步 AI 会帮你检查。）

### 第 2 步：请 AI 帮你安装
打开 Claude Code 或 Codex，**复制贴上**下面这段话：

```
请帮我安装 https://github.com/jenhuey/sheet-dashboard-kit 的 sheet-dashboard skill。
步骤：先确认电脑有 Node.js 20 以上（没有就教我安装），把这个 repo 下载到「文件」资料夹（有 git 就 git clone，没有就下载 ZIP 解压），然后在那个资料夹执行 node install.mjs，最后告诉我结果。
```

<details>
<summary>其他安装方法</summary>

- **Claude Code 内建的 plugin 安装**：在 Claude Code 输入这两行（一次一行）：
  ```
  /plugin marketplace add jenhuey/sheet-dashboard-kit
  /plugin install sheet-dashboard@sheet-dashboard-kit
  ```
- **自己手动装**：在这个页面按绿色的「Code」→「Download ZIP」，解压后打开终端机（Mac：Terminal / Windows：PowerShell），进到那个资料夹，输入 `node install.mjs`。
- **以后要更新到新版**：跟 AI 说「帮我更新 sheet-dashboard-kit 到 GitHub 最新版，再执行一次 node install.mjs」。旧版会自动备份。

</details>

### 第 3 步：开始做
**重新打开** Claude Code / Codex，说：

```
Help me create dashboard
```

（说中文「帮我做一个 dashboard」也可以。）

接下来跟着 AI 的问题回答就好。

---

## 常见问题

**要钱吗？**
Google Sheet、Apps Script、clasp 都免费。你只需要 Claude Code 或 Codex 本身的订阅。

**资料放在哪里？安全吗？**
表格和程式都在**你自己的 Google 账号**里。AI 只是帮你写程式、放上去。Dashboard 默认「只有你自己能看」，要给同事看时 AI 会先问你。

**第一次打开 Dashboard 出现「Google 尚未验证这个应用程式」？**
正常。这是你自己的程式，按「进阶」→「前往…」→「允许」就好，只会问一次。

**用 Codex 时，安装或上传失败、说没有网络？**
Codex 默认的安全模式可能会挡住网络。出现询问时选择允许；或者用允许网络的模式启动 Codex（在 Codex 里输入 `/approvals` 选择可以连网的选项）。

**以后怎么修改？**
打开 AI 工具说「**帮我更新 <名字> dashboard**」，再说要改什么。网址不会变。
每个 dashboard 的资料都在「文件 / Sheet-Dashboards / <名字>」资料夹里。

**可以用在已经有的 Google Sheet 吗？**
可以。AI 问「表格要放在哪」时选「我已经有一个 Google Sheet」，贴上网址就好。

**Windows 可以用吗？**
可以，所有工具都是跨平台的（Node.js）。

---

## 资料夹里有什么

```
sheet-dashboard-kit/
├─ README.md            ← 你正在看的说明
├─ install.mjs          ← 安装程式
├─ INSTALL-PROMPT.txt   ← 第 2 步要贴给 AI 的那段话
├─ AGENTS.md            ← 给其他 AI 工具看的入口
└─ skills/sheet-dashboard/
   ├─ SKILL.md          ← AI 的作业手册（4 个阶段）
   ├─ references/       ← 表格设计题库、设计原则、常见问题
   ├─ templates/        ← Dashboard 起手模板
   └─ scripts/          ← 检查环境、建立、上线、测试的小工具
```

---

## English

**Build a Google Sheets tracker + live web dashboard just by chatting with your AI coding agent (Claude Code or Codex). No coding needed.**

How it works:
1. **Design the table together** — the agent interviews you and proposes the fewest columns possible (anything that can be calculated goes to the dashboard, not the sheet). Nothing is built until you approve the table.
2. **Set up** — the agent checks Node.js, installs Google's `clasp` CLI, and asks you to enable the Apps Script API and sign in to Google once.
3. **Build** — it creates the Sheet + Apps Script, tests locally with sample data and screenshots, deploys, and gives you the Dashboard / Sheet / Apps Script links.
4. **Iterate & remember** — every change is pushed to the same URL. Once you're happy, it writes `~/Documents/Sheet-Dashboards/<name>/PROJECT.md` and tells you the prompt to use next time: *"Update my <name> dashboard"*.

Install: you need Node.js 20+ (https://nodejs.org). Tell your agent *"Install the sheet-dashboard skill from https://github.com/jenhuey/sheet-dashboard-kit: clone it into my Documents folder and run `node install.mjs`"* — or download the ZIP and run `node install.mjs` yourself. Claude Code users can also run `/plugin marketplace add jenhuey/sheet-dashboard-kit` then `/plugin install sheet-dashboard@sheet-dashboard-kit`. It installs to `~/.claude/skills/` (Claude Code) and/or `~/.agents/skills/` (Codex). Restart the agent and say *"Help me create dashboard"*.

Everything lives in your own Google account. Default access is "only me". MIT licensed.

---

Made by [jenhuey](https://github.com/jenhuey) · MIT License
