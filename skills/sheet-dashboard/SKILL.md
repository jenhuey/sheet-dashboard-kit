---
name: sheet-dashboard
description: Build a Google Sheet tracker + live web dashboard (Apps Script + clasp) from scratch with a non-technical user, or update one made before. Triggers - "Help me create dashboard", "Help me update <name> dashboard", "I want to track…", 「帮我做一个 dashboard / 追踪表 / 表格」「帮我更新 <名字> dashboard」.
---

# Sheet Dashboard

Help a **non-technical** user: first design a Google Sheet together that is easy to fill in, then automatically build a web dashboard that reads it live, and finally record the project so one sentence picks it up again next time.

`<skill>` = the folder containing this SKILL.md. Run scripts as `node <skill>/scripts/<name>.mjs` (same on Mac and Windows).
Each dashboard lives in `~/Documents/Sheet-Dashboards/<name>/` (Windows: `%USERPROFILE%\Documents\Sheet-Dashboards\<name>\`).

## Talking to the user (every stage)
- Reply in **the user's language**, in plain words. Don't throw jargon at them (clasp, deploy, manifest…); if you must mention one, explain it in half a sentence.
- **Ask one thing at a time.** When they need to choose, use your question tool if you have one; otherwise list 2–4 numbered options and ask them to reply with a number. Always add "Other: tell me in your own words".
- Any step they must do by hand (open a page, press a button) says exactly **where, what to press, and what they will see**. Google's UI labels depend on their language — give the English label and, if they write in another language, the likely local label too (e.g. Extensions / 扩充功能).
- Get an explicit OK before leaving each stage. **Until stage 1 is confirmed, never start building the dashboard or install anything.**

---

## Stage 0: New dashboard or an update?
- They say "Help me update / change <name> dashboard" (any language) → look in `~/Documents/Sheet-Dashboards/`, read that folder's `PROJECT.md` and `project.json`, and go straight to **stage 4**. If nothing matches, list the existing folders and let them pick.
- Anything else → stage 1.

## Stage 1: Design the table (nothing else until it is confirmed)
Goal: a table with **only the columns someone has to type**, obvious to fill in. The question bank, column rules and examples are in `references/table-interview.md` — read it first.

1. Ask: "What do you want to track with this sheet?" If they don't know or are vague, offer the 3–4 examples from `table-interview.md` closest to their work.
2. Then ask, one at a time: how do they keep track today? Who fills it in? **What do they most want to see at a glance when they open the dashboard?** (offer options: overdue items, % done, progress per category, how much got done this month…)
3. Design the columns:
   - **Aim for 5–8 columns, 10 at most.** Anything that can be calculated (days taken, overdue or not, count this month, % done) **does not go in the sheet** — the dashboard calculates it.
   - Give every column a type: text / dropdown (with options) / date / checkbox / number / link. Prefer dropdowns over free typing whenever possible.
   - Decide how the dashboard uses them: which column is the item name, which groups items, which is the due date, which is the status, and what counts as "done".
4. Show it as a table: column name | type | how to fill it | 2–3 rows of example data, plus one line "The dashboard will work out for you: …".
5. Ask "Does this work? Anything to add, remove or change?" Iterate until they say OK.
6. Ask for the dashboard's name (it becomes the page title and the folder name).

## Stage 2: Prepare the computer (do this proactively once the table is confirmed)
1. Run `node <skill>/scripts/check_env.mjs` and fix each item it lists under "还需要" (still needed):
   - **No Node.js**: ask them to download the LTS version from https://nodejs.org and click Next through the installer, then reopen this AI tool. (With their OK, Mac + Homebrew can use `brew install node`; Windows can use `winget install OpenJS.NodeJS.LTS`.)
   - **No clasp**: run `npm install -g @google/clasp` yourself (clasp = Google's official tool for putting Apps Script code online). If it fails for permissions on Mac, ask before using `sudo`.
   - **Apps Script API off**: ask them to open https://script.google.com/home/usersettings , signed in with the Google account that should own the sheet, and switch "Google Apps Script API" to **On**.
   - **Not signed in**: run `clasp login` and tell them: "A Google sign-in page will open in your browser. Pick the account that should own the sheet, allow everything, and come back when you see *Logged in*." If your environment can't open a browser, ask them to open a terminal (Mac: Terminal, Windows: PowerShell) and type `clasp login` themselves.
   - Run `check_env.mjs` again; continue only when everything is ✓.
2. Ask where the table should live:
   - **A. Create a new Google Sheet for me** (simplest, recommended)
   - **B. I already have a Google Sheet** → ask for its link: "Open that Google Sheet, copy the address from the top of the browser and paste it here. It looks like `https://docs.google.com/spreadsheets/d/<long code>/edit` — the long code in the middle is the Sheet ID."
   - **C. My sheet already has an Apps Script / an old dashboard** → ask for the Script ID and the link: "Open the sheet → menu **Extensions** → **Apps Script** → gear icon ⚙️ **Project Settings** on the left → copy the **Script ID**." For the dashboard link: "In Apps Script, top right **Deploy** → **Manage deployments** → copy the web app URL."
3. Ask who will open the dashboard (sets `--access`):
   - Only me → `MYSELF` (default, safest)
   - Colleagues with a Google account → `ANYONE` (they must sign in to Google)
   - Anyone with the link → `ANYONE_ANONYMOUS` (no sign-in; warn them the sheet's content is effectively public)

## Stage 3: Build the dashboard
1. Create `~/Documents/Sheet-Dashboards/<name>/apps-script/` and copy `<skill>/templates/Code.gs` and `Index.html` into it.
2. Edit `CONFIG` in `Code.gs`: `title`, `sheetName`, `columns` (from stage 1), `roles`, `palette`. Replace `{{TITLE}}` / `{{SHEET_NAME}}`.
   - Start from the template layout (number cards → highlight card → status split → to-do list → per-group detail), then adapt it to what they said they most want to see. Rules in `references/design-guide.md`.
   - Colours: ask whether they have brand colours or a favourite colour; otherwise let them pick ocean (blue) / berry (red-pink) / forest (green).
   - All on-screen words are in the `TEXT` object in `Index.html` (Simplified Chinese by default). Translate the whole object into the user's language, and translate the Sheet menu labels in `Code.gs` `onOpen()` too.
3. **Test locally (always — never make the user the tester):**
   - Using `<skill>/templates/sample.json` as the format, write a `sample.json` for their columns (6–10 realistic fake rows; dates as `"+3d"` / `"-2d"`; include overdue, due soon, done, a long text and a link). Keep it in a temp folder, not in the project folder.
   - `node <skill>/scripts/mock_sheets.mjs <apps-script>/Code.gs sample.json results.json --setup`
   - `node <skill>/scripts/mkpreview.mjs <apps-script>/Index.html results.json preview.html --shot shot.png` (and `--width 500 --shot shot-m.png` for phones)
   - **Open the screenshots and look at them yourself**: are the numbers right, anything broken, readable on a phone? Fix and re-test before showing anything.
4. Put it online:
   - New (A / B): `node <skill>/scripts/create_project.mjs <project folder> --title "<name>" --access <access> [--sheet <Sheet link>]`
   - Existing project (C): `node <skill>/scripts/clasp_link.mjs <project folder> <Script ID> <dashboard link>`, merge the stage-1 changes into the code it pulled down, then publish with `clasp_deploy.mjs`.
   - The script prints `project.json` (with the three links).
5. Give them the three links and explain:
   - 📊 **Dashboard** (`links.dashboard`): "The first time, you'll see *Authorization required*. Click **Review permissions** → choose your account → if you see *Google hasn't verified this app*, click **Advanced** → **Go to … (unsafe)** — it's your own code, so that's fine → **Allow**. It won't ask again."
   - 📄 **Google Sheet** (`links.sheet`): "A few seconds after opening it, the headers and dropdowns appear by themselves, and a new **📊 Dashboard** menu shows up at the top."
   - 🛠 **Apps Script** (`links.editor`): "This is the code itself. You normally don't need it — **please don't edit the code there**; just tell me what to change."
6. Ask them to type a few real rows, refresh the dashboard, and tell you what to change.

## Stage 4: Change → finalise → remember
1. Every change:
   - Edit the code in `<project folder>/apps-script/` → re-run the stage-3 tests with fresh sample data and look at the screenshots.
   - `node <skill>/scripts/clasp_deploy.mjs <project folder> "<what changed>"`
   - Ask them to hard-refresh the dashboard (Mac: Cmd+Shift+R; Windows: Ctrl+Shift+R). The link does not change.
   - Columns changed: ask them to click **📊 Dashboard → reformat the sheet** in the Sheet menu. New columns are added on the right and existing data is untouched. **Confirm before removing or renaming a column** (they have to delete / rename the old one in the sheet themselves).
   - `clasp_deploy.mjs` says the code was changed online (exit 2): someone edited the code in the Apps Script editor. Open the online copy it points to, compare it with the local one, merge, then publish. Never just overwrite it.
2. When they say OK / happy / that's it, **without being asked**:
   - Fill in `<skill>/templates/PROJECT.md` and save it as `<project folder>/PROJECT.md`: links, IDs, column definitions, what the dashboard shows, their preferences (colours, things they don't want), change log (date + what changed). Write it in the user's language.
   - Tell them clearly (in their language):

     > All saved ✅ Whenever you want to change it, open Claude Code / Codex and say:
     > **"Help me update <name> dashboard"**
     > then tell me what to change. The link stays the same.

3. After every later change, add a line to the change log in `PROJECT.md`.

---

## When something goes wrong
Known problems and fixes are in `references/gotchas.md` (authorization, expired sign-in, page not updating, date format, #REF! …). Check there first.
