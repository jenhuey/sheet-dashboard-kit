# Troubleshooting & lessons learned

## What the user may run into
| Symptom | Cause / fix |
|--|--|
| Dashboard says "Authorization required" | Normal the first time. Review permissions → choose account → Advanced → Go to … (unsafe) → Allow. It's their own code. |
| "Google hasn't verified this app" | Same as above: click Advanced and continue. |
| Dashboard says "Sorry, unable to open the file at this time" | Access is MYSELF but the browser is signed in with a different Google account. Switch to the account that owns the sheet, or change the access setting. |
| Code changed but the page looks the same | Hard refresh: Cmd/Ctrl+Shift+R. Still the same → run `deployment_info.mjs` and check the version went up. |
| Sheet has no headers / no "📊 Dashboard" menu | Wait 5–10 seconds and reload. Still missing → in the Apps Script editor pick `onOpen` and press Run once (it will ask for authorization). |
| Typing 05/11 becomes 11 May, or stays as text | The sheet's locale isn't en_GB. File → Settings → Locale → United Kingdom. Sheets created by this kit are set automatically. |
| Formulas turn into #REF! | They moved data with Cut → Paste. Ask them to use Copy → Paste → delete the original instead. |
| Page shows "读取失败" (failed to load) | Usually the sheet tab was renamed or a header text was changed. Headers must match the `label`s in CONFIG exactly. |

## Tools / environment
| Symptom | Fix |
|--|--|
| `clasp: command not found` | `npm install -g @google/clasp`, then reopen the terminal / AI tool. On Windows, if it's still missing, check that `%APPDATA%\npm` is on PATH. |
| `npm install -g` permission denied (Mac) | Ask the user first, then `sudo npm install -g @google/clasp`. |
| `User has not enabled the Apps Script API` | Turn it on at https://script.google.com/home/usersettings and wait 1–2 minutes. |
| `invalid_grant` / sign-in expired | Run `clasp login` again. |
| A second Google account | `clasp login -u <name>`, then prefix every script with the env var `CLASP_USER=<name>` (Windows PowerShell: `$env:CLASP_USER="<name>"`). |
| Codex blocks npm / clasp network access | Codex's default sandbox may not allow network. Ask the user to approve the command, or switch to a mode with network access (see README). |
| `clasp_deploy.mjs` says the code was changed online (exit 2) | Someone edited the code in the Apps Script editor. Compare the online file it points to → merge into the local copy → publish again. **Never just overwrite it.** |
| Access setting changed after deploying | `webapp.access` in `appsscript.json` was changed. Put it back and deploy again. Always ask the user before changing access. |
| Time zone shows as `Asia/Singapore` instead of `Asia/Kuala_Lumpur` | Google rewrites some time-zone names to an equivalent alias. Same time zone, nothing to fix; the scripts already take the online manifest as the truth after each push. |

## Writing Apps Script
- Apps Script's `RangeList` has **no** `setDataValidation`; set it range by range. `mock_sheets.mjs` only implements methods that really exist — if a test says a method "不存在" (doesn't exist), it would break online too.
- Data sent to the page can't contain `Date` objects (they arrive as null); always convert to `'yyyy-MM-dd'` strings first.
- The web dashboard opens the sheet with `CONFIG.spreadsheetId` + `openById` (`create_project.mjs` fills it in). Simple triggers like `onOpen` can't use services that need authorization (e.g. `ScriptApp.getService()`); put those in functions run from a menu click.
- `insertCheckboxes()` fills empty rows with FALSE, so decide "is this row empty" by whether any column was actually filled in (the template does this).
- To change the table structure, add columns on the right. Never rebuild or move columns that hold data, and never rewrite a whole column whose formulas refer to themselves (e.g. a checkbox that stamps a date).
- Set Google Sheets recalculation to "every hour" if formulas use TODAY()/NOW() (File → Settings → Calculation).
