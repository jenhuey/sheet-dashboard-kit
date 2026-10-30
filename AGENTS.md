# For AI agents

This folder is the **Sheet Dashboard Kit**: a skill that helps non-technical users build a Google Sheet + live Apps Script web dashboard.

- **Install request** ("帮我安装 / install this skill"; repo: https://github.com/jenhuey/sheet-dashboard-kit): make sure Node.js 20+ is available (if not, guide the user to https://nodejs.org LTS), then run `node install.mjs` in this folder and report what it printed. Tell the user to restart their agent and say "Help me create dashboard" (or 「帮我做一个 dashboard」).
- **Your tool has no skill support?** Read `skills/sheet-dashboard/SKILL.md` and follow it directly; `<skill>` in that file means `skills/sheet-dashboard/` in this folder.
- Talk to the user in their language, in plain words. They are not programmers.
