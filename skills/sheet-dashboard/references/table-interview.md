# Stage 1: Designing the table with the user

## Rules
1. **Only columns someone has to type.** Aim for 5–8; past 10, cut.
2. **Don't make people type what can be calculated**: days taken, overdue or not, % done, count this month, rankings → all of it belongs to the dashboard.
3. **Choose, don't type**: category, status, owner, platform → dropdowns (3–7 options).
4. **One row = one thing.** No "one block per month" layouts and no merged cells; the table just grows downwards.
5. **Short, clear column names** (1–3 words), no abbreviations.
6. If things get "done", there must be a status dropdown (including a done value) or a "Done" checkbox — otherwise the dashboard can't show progress.
7. If things have deadlines, add a date column so the dashboard can flag overdue / due soon.

## Question order (one at a time)
1. "What do you want to track with this sheet?" → if unclear, offer the examples below.
2. "How do you keep track today (in your head / notebook / WhatsApp / Excel…)? What do you always write down?" → these are the column candidates.
3. "Who fills it in — only you, or colleagues too?" → several people → add an "Owner" dropdown.
4. "When you open the dashboard, what do you most want to see at a glance?" Offer:
   - What's overdue / due soon
   - Overall % done
   - Progress per category (shop / platform / client)
   - How much got done this month vs last month
   - Money totals (sales, spending)
5. "Anything you'd find annoying or useless to see?"
6. Show the column table → "Does this work?"

## Examples (for users who don't know where to start)
Translate the column names and options into the user's language.

### 1. Work to-do / project tracker
| Column | Type | Example |
|--|--|--|
| Task | text | New menu photoshoot |
| Category | dropdown | Shop A / Shop B / Marketing / Other |
| Owner | dropdown | Me / Colleague A / Agency |
| Due date | date | 15/11/2026 |
| Status | dropdown | Not started / In progress / Waiting / Done |
| Latest update | text | Photographer confirmed the time |
Dashboard: overdue, due in 7 days, progress per category, % done.

### 2. Social media content plan
| Column | Type | Example |
|--|--|--|
| Title | text | Weekend promo Reel |
| Platform | dropdown | IG / FB / TikTok / Xiaohongshu |
| Format | dropdown | Reel / Post / Story |
| Planned date | date | 08/11/2026 |
| Status | dropdown | Idea / Shooting / Editing / Ready / Posted |
| Link | link | https://… |
Dashboard: what's due this week, which stage things get stuck in, posts per platform this month.

### 3. Client / sales follow-up
| Column | Type | Example |
|--|--|--|
| Client | text | ABC Sdn Bhd |
| Source | dropdown | IG / Referral / Website / Walk-in |
| Next follow-up | date | 05/11/2026 |
| Stage | dropdown | New lead / Contacted / Quoted / Won / Lost |
| Amount (RM) | number | 3,500 |
| Notes | text | Waiting for the boss to return |
Dashboard: who to follow up today, count per stage, amount won, win rate.

### 4. Events / partners (KOLs, suppliers)
| Column | Type | Example |
|--|--|--|
| Name | text | @foodie.my |
| Type | dropdown | KOL / Media / Supplier |
| Date | date | 12/11/2026 |
| Status | dropdown | Inviting / Confirmed / Completed / Cancelled |
| Fee (RM) | number | 500 |
| Result link | link | https://instagram.com/… |
Dashboard: partners this month, total spend, results not yet delivered.

### 5. Inventory / equipment loans
| Column | Type | Example |
|--|--|--|
| Item | text | Studio light |
| Category | dropdown | Equipment / Props / Stationery |
| Quantity | number | 2 |
| Borrowed by | dropdown | … |
| Return by | date | 03/11/2026 |
| Returned | checkbox | ☐ |
Dashboard: overdue returns, quantity per category.

## Mapping to `CONFIG` in Code.gs
- Each column → one `{ key, label, type, options?, width? }` in `columns` (key = short lowercase English; label = the header text in the sheet).
- `roles.title` = the name column; `roles.group` = the dropdown to group by; `roles.date` = due / planned date; `roles.status` = status dropdown; `roles.doneStatus` = which statuses count as done; no status but a "Done" checkbox → `roles.doneCheckbox`.
- Roles the table doesn't have → `null`; the dashboard hides those sections automatically.
- Anything the template doesn't do (money totals, monthly counts…) → return extra data from `getDashboardData` and add a section to `Index.html`.
