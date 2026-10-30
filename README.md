# Sheet Dashboard Kit 📊

**Chat with your AI agent to build a Google Sheet tracker + a live web dashboard. No coding needed.**

Works with **Claude Code** and **Codex** (OpenAI).

> 🇨🇳 跟 AI 聊天，就能做出「Google Sheet 表格 + 实时网页 Dashboard」，不用会写程式。支援 Claude Code 和 Codex。

```
You: Help me create dashboard
AI:  What do you want to track with this sheet? …(together you settle on 5–8 easy columns)
AI:  Table confirmed ✅ Setting things up now…(installs a tool, asks you to sign in to Google)
AI:  Done! 📊 Dashboard link / 📄 Google Sheet / 🛠 Apps Script
You: Put overdue items at the top and use a red colour theme
AI:  Updated — just refresh the page.
You: Perfect
AI:  Saved. Next time just say "Help me update <name> dashboard".
```

---

## What it does

| Step | What the AI does | What you do |
|--|--|--|
| 1. Design the table | Asks questions, shows examples, designs the **fewest** columns possible (anything that can be calculated stays out of the sheet) | Answer, then say OK |
| 2. Set up | Checks your computer, installs Google's `clasp` tool | Flip one Google setting and sign in to Google (once each) |
| 3. Build the dashboard | Creates the Google Sheet, writes the code, tests it with screenshots first, puts it online | Open the link and click "Allow" the first time |
| 4. Improve & remember | Makes your changes and publishes them; once you're happy, saves a project note | Say what to change; next time, one sentence picks it up again |

The dashboard reads your Google Sheet **live**: fill in the sheet, refresh the page, and it updates. It works on phones too.

Nothing gets built until you approve the table in step 1.

> 🇨🇳 **它会帮你做什么**
> 1. **讨论表格**：AI 问你问题、给范例，设计**最少**的栏位（能自动算的不放进表格）→ 你回答、说 OK
> 2. **准备环境**：AI 检查电脑、安装 Google 的 clasp 工具 → 你打开一个 Google 设定、登入 Google（各一次）
> 3. **做 Dashboard**：AI 建 Google Sheet、写程式、先自己测试截图、放上网 → 你打开链接，第一次按「允许」
> 4. **修改 & 记住**：AI 照你的意见改并自动上线；你满意后写一份记录档 → 以后一句话就能接着改
>
> Dashboard 会实时读你的 Google Sheet，手机也能看。表格没确认前，什么都不会开始做。

---

## Get started (3 steps)

### Step 1 — Have an AI agent and Node.js
You need one of these:
- **Claude Code**: https://claude.com/claude-code
- **Codex**: https://developers.openai.com/codex

And **Node.js** (free): download the **LTS** version from https://nodejs.org and click "Next" through the installer.
Not sure whether you have it? That's fine. The AI will check in step 2.

> 🇨🇳 **第 1 步**：准备 Claude Code 或 Codex，再到 https://nodejs.org 下载 **LTS** 版 Node.js 安装（不确定有没有装也没关系，第 2 步 AI 会检查）。

### Step 2 — Ask the AI to install it
Open Claude Code or Codex and **copy-paste** this:

```
Please install the sheet-dashboard skill from https://github.com/jenhuey/sheet-dashboard-kit.
Steps: check that Node.js 20+ is installed (if not, walk me through installing it), download the repo into my Documents folder (git clone, or the ZIP if git is missing), run `node install.mjs` in that folder, then tell me the result.
```

> 🇨🇳 **第 2 步**：打开 Claude Code 或 Codex，贴上这段话：
> ```
> 请帮我安装 https://github.com/jenhuey/sheet-dashboard-kit 的 sheet-dashboard skill。
> 步骤：先确认电脑有 Node.js 20 以上（没有就教我安装），把这个 repo 下载到「文件」资料夹（有 git 就 git clone，没有就下载 ZIP 解压），然后在那个资料夹执行 node install.mjs，最后告诉我结果。
> ```

<details>
<summary>Other ways to install / 其他安装方法</summary>

- **Claude Code plugin**: type these two lines in Claude Code, one at a time:
  ```
  /plugin marketplace add jenhuey/sheet-dashboard-kit
  /plugin install sheet-dashboard@sheet-dashboard-kit
  ```
- **Manual install**: on this page click the green **Code** button → **Download ZIP**. Unzip it, open a terminal (Mac: Terminal / Windows: PowerShell), go into the folder and run `node install.mjs`.
- **Update to the latest version later**: tell your AI *"Update sheet-dashboard-kit to the latest version from GitHub and run node install.mjs again"*. Your old copy is backed up automatically.

It installs to `~/.claude/skills/` (Claude Code) and/or `~/.agents/skills/` (Codex), depending on which you have.

> 🇨🇳 Claude Code 可以用上面两行 `/plugin` 指令安装；也可以按绿色「Code」→「Download ZIP」，解压后在终端机执行 `node install.mjs`。以后要更新，跟 AI 说「帮我更新 sheet-dashboard-kit 到 GitHub 最新版，再执行一次 node install.mjs」，旧版会自动备份。

</details>

### Step 3 — Start
**Restart** Claude Code / Codex and say:

```
Help me create dashboard
```

Then just answer the AI's questions.

> 🇨🇳 **第 3 步**：重新打开 Claude Code / Codex，说 **Help me create dashboard**（说中文「帮我做一个 dashboard」也可以），然后回答 AI 的问题就好。

---

## FAQ

**Does it cost anything?**
Google Sheets, Apps Script and clasp are free. You only need your Claude Code or Codex subscription.
> 🇨🇳 要钱吗？Google Sheet、Apps Script、clasp 都免费，只需要 Claude Code 或 Codex 本身的订阅。

**Where is my data? Is it safe?**
The sheet and the code live in **your own Google account**. The AI only writes and uploads the code for you. By default, only you can open the dashboard. The AI asks before making it visible to anyone else.
> 🇨🇳 资料在哪？表格和程式都在**你自己的 Google 账号**里。Dashboard 默认只有你能看，要给别人看时 AI 会先问你。

**"Google hasn't verified this app" appears the first time I open the dashboard.**
That's normal. It's your own code. Click **Advanced** → **Go to … (unsafe)** → **Allow**. You'll only be asked once.
> 🇨🇳 第一次打开出现「Google 尚未验证这个应用程式」？正常。按「进阶」→「前往…」→「允许」，只会问一次。

**Using Codex, the install or upload fails with a network error.**
Codex's default sandbox may block network access. Approve the command when asked, or switch to a mode that allows network access (type `/approvals` in Codex).
> 🇨🇳 用 Codex 时说没有网络？Codex 默认安全模式可能挡住网络。出现询问时选允许，或在 Codex 输入 `/approvals` 换成可以连网的模式。

**How do I change my dashboard later?**
Say **"Help me update <name> dashboard"**, then tell it what to change. The link stays the same.
Each dashboard's files are in `Documents/Sheet-Dashboards/<name>/`.
> 🇨🇳 以后怎么改？说「**帮我更新 <名字> dashboard**」再说要改什么，网址不会变。资料在「文件 / Sheet-Dashboards / <名字>」。

**Can I use a Google Sheet I already have?**
Yes. When the AI asks where the table should live, choose "I already have a Google Sheet" and paste its link.
> 🇨🇳 可以用已经有的 Google Sheet 吗？可以，AI 问表格放哪时选「我已经有一个 Google Sheet」，贴上网址就好。

**Does it work on Windows?**
Yes. All the tools are cross-platform (Node.js).
> 🇨🇳 Windows 可以用吗？可以，所有工具都是跨平台的。

---

## What's inside

```
sheet-dashboard-kit/
├─ README.md            ← this guide
├─ install.mjs          ← installer
├─ INSTALL-PROMPT.txt   ← the text to paste in step 2
├─ AGENTS.md            ← entry point for other AI agents
└─ skills/sheet-dashboard/
   ├─ SKILL.md          ← the AI's playbook (4 stages)
   ├─ references/       ← table-design questions, design rules, troubleshooting
   ├─ templates/        ← dashboard starter template
   └─ scripts/          ← tools to check, create, publish and test
```

> 🇨🇳 `SKILL.md` 是 AI 的作业手册（4 个阶段）；`references/` 是表格设计题库、设计原则、常见问题；`templates/` 是 Dashboard 起手模板；`scripts/` 是检查环境、建立、上线、测试的小工具。

---

Made by [jenhuey](https://github.com/jenhuey) · MIT License
