# Dashboard design rules

These come from real dashboards that users found genuinely useful.

## Layout order (the template already follows it)
1. **Title bar**: name, last updated, "Open sheet", "Refresh"
2. **Group buttons**: All / each category (the choice is remembered)
3. **Big number cards** — clickable, opening a list underneath
   - Cards with a meaningful total (done, not done): `n / total · %` + progress bar
   - Warning cards (overdue, due soon): **just the number + one plain sentence**. No "/ total" — users don't understand what the denominator means there.
4. **Dark highlight card**: next deadline, most overdue, latest entry (swap for whatever the user "most wants to see")
5. **Status split** bar
6. **To-do list** sorted by date, with "2 days overdue / today / in 3 days" next to the date
7. **Per-group detail**: dark header bar + counts + coloured tiles (green = done, red = overdue, amber = due soon, grey = in progress); click a tile to see the full row

## Numbers need a "so what"
- Good: 3 overdue, 12 done this month, 70% complete, RM 8,500 won
- Bad: "items handled", "steps processed", "categories served" — numbers that don't make anyone feel or do anything
- Ask yourself: when the user sees this number, do they know what to do? If not, drop it.

## Visual
- Colours are 4 CSS variables: `--c1` light background, `--c2` main, `--c3` accent, `--c4` dark. Presets: ocean / berry / forest, or the user's brand colours.
- Status colours always mean the same thing: green = done, red = overdue / problem, amber = soon / watch, grey = normal.
- Numbers in Bebas Neue (narrow, big, easy to read); body text in Inter + Noto Sans SC.
- Capitalise the first letter of English labels.
- Long URLs always become short "🔗 Google Sheet / Drive / Instagram" links (the template's `linkify()`), never stretching a table.
- Must work at phone width (< 860px): cards wrap, tables hide secondary columns (`.hide-sm`).

## Interaction
- Never show the same information in two places (e.g. a separate "project progress" tab that repeats the list → don't).
- Very long cards start collapsed and open on click; remember the state in localStorage (wrapped in try/catch).
- Things meant for someone else (e.g. the boss) can get a "📋 Copy" button that copies plain text, ready to paste into WhatsApp.
- Re-read the data every 5 minutes; the Refresh button reads it immediately.
- Several languages: all on-screen words live in the `TEXT` object; for a language switch use a URL parameter like `?lang=en` (pass `e.parameter.lang` from `doGet` into the template).

## Private data
- Tabs / columns that must stay hidden are never sent from `getDashboardData` (server side). Don't send them to the page and hide them with CSS.
- Password-protected pages: compare the password on the server, and only then return the data.
