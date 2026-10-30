# 常见问题 & 踩过的坑

## 使用者那边看到的问题
| 现象 | 原因 / 解法 |
|--|--|
| 打开 dashboard 出现「需要授权 / Authorization required」 | 第一次正常。审查权限 → 选账号 → 进阶 → 前往（不安全）→ 允许。是他自己的程式。 |
| 出现「Google 尚未验证这个应用程式」 | 同上，按「进阶」继续。 |
| 打开 dashboard 显示「很抱歉，目前无法开启这个档案」 | 存取权是 MYSELF，但他用了另一个 Google 账号登入浏览器。请他切换到建立表格的账号，或改存取权。 |
| 改完程式，网页没变 | 请他按 Cmd/Ctrl+Shift+R 强制刷新。还是没变 → `deployment_info.mjs` 看版本号有没有 +1。 |
| Sheet 打开后没有表头 / 没有「📊 Dashboard」选单 | 等 5–10 秒再刷新。仍没有 → Apps Script 编辑器选 `onOpen` 按「执行」一次（第一次会要授权）。 |
| 日期打 05/11 变成 5 月 11 日，或变成文字 | Sheet 的语言区域不是 en_GB。档案 → 设定 → 语言区域改成「英国」。新建的表会自动设好。 |
| 公式变成 #REF! | 他用了「剪下 → 贴上」搬资料。请他改用「复制 → 贴上 → 删除原本的」。 |
| 网页显示「读取失败」 | 多半是 Sheet 分页被改名，或表头文字被改。表头要跟 CONFIG 的 label 一模一样。 |

## 工具 / 环境
| 现象 | 解法 |
|--|--|
| `clasp: command not found` | `npm install -g @google/clasp`；装完要重开终端机 / AI 工具。Windows 若仍找不到，确认 `%APPDATA%\npm` 在 PATH。 |
| `npm install -g` 权限不足（Mac） | 先问使用者，再用 `sudo npm install -g @google/clasp`。 |
| `User has not enabled the Apps Script API` | https://script.google.com/home/usersettings 打开 API，等 1–2 分钟。 |
| `invalid_grant` / 登入过期 | 重新 `clasp login`。 |
| 要用第二个 Google 账号 | `clasp login -u <名字>`，之后所有脚本前面加环境变数 `CLASP_USER=<名字>`（Windows PowerShell：`$env:CLASP_USER="<名字>"`）。 |
| Codex 执行 npm / clasp 时网络被挡 | Codex 默认沙盒可能不允许连网。请使用者在 Codex 允许这次指令，或用允许网络的模式启动（见 README）。 |
| `clasp_deploy.mjs` 说线上被手动改过（exit 2） | 有人在 Apps Script 编辑器直接改程式。比对它给的线上档案 → 合并进本地 → 再部署。**不要直接覆盖。** |
| 部署后存取权变了 | `appsscript.json` 的 `webapp.access` 被改到。改回来再部署。改存取权前一定要先问使用者。 |

## 写 Apps Script 时
- Apps Script 的 `RangeList` **没有** `setDataValidation`，要一个一个 Range 设。`mock_sheets.mjs` 只做真的有的方法，测试报「不存在」就是线上也会坏。
- 传给网页的资料不能有 `Date` 物件（会变 null），一律先转成 `'yyyy-MM-dd'` 字串。
- 网页 dashboard 用 `CONFIG.spreadsheetId` + `openById` 开表（`create_project.mjs` 会自动填）；`onOpen` 这类简单触发器不能用需要授权的服务（例如 `ScriptApp.getService()`），放在选单按下去才执行的函式里。
- `insertCheckboxes()` 会让空白列也有 FALSE 值，读资料时要用「这一列有没有填任何东西」判断是不是空列（模板已处理）。
- 改表格结构用「加栏在最右边」，不要重建或搬动有资料的栏位；有公式会自己引用自己的栏（例如打勾记日期）绝对不要整栏重写。
- Google Sheet 的自动重算设「每小时」，用到 TODAY()/NOW() 的公式才会自己更新（档案 → 设定 → 计算）。
