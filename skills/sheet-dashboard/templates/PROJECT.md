# {{name}} Dashboard

> Prompt to change it: **"Help me update {{name}} dashboard"**
> For the AI: edit `apps-script/` → test → `node <skill>/scripts/clasp_deploy.mjs <this folder> "<what changed>"` → ask the user to refresh → add a line to the change log below.
> Write this file in the user's language.

## Links
- 📊 Dashboard: {{dashboard link}}
- 📄 Google Sheet: {{sheet link}}
- 🛠 Apps Script: {{editor link}}
- Access: {{MYSELF / ANYONE / ANYONE_ANONYMOUS}} (who can open it)
- Google account: {{which account owns it; for a second account, its CLASP_USER name}}
- All IDs are in `project.json` in this folder

## What this sheet tracks
{{one or two sentences: purpose, who fills it in, how often}}

## Columns (tab "{{tab name}}")
| Column | Type | Options / notes |
|--|--|--|
| {{Task}} | text | |

Dashboard roles: name = {{}}, group = {{}}, date = {{}}, status = {{}}, done = {{}}

## What the dashboard shows
- {{e.g. overdue / due in 7 days / % done cards, each opening a list}}
- {{e.g. per-shop tiles}}

## User preferences (follow these in every change)
- Colours: {{palette or hex codes}}
- Things they don't want: {{e.g. no "/ total" on warning cards, no separate progress tab}}
- {{other}}

## Change log
| Date | What changed |
|--|--|
| {{yyyy-mm-dd}} | First version online |
