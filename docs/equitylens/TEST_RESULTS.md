# EquityLens 分阶段实测结果

## 求职作品集 v0.1 发布候选复核（2026-10-29，当前工作树）

本轮在 Step C 现有产品代码、作品集文档和三条 Fork 工作流保护条件的**当前未提交工作树**运行。Python、Vitest、Playwright、TypeScript 和 Vite 均为本轮重新执行；没有将 Step C 旧日志冒充新测试。浏览器夹具是合成截获 API；真实 NVDA API/截图/原 SEC 来源另行检查。下列日志在本机 `/tmp/equitylens-portfolio-*.log`，不拟入 Git。

| 检查 / 命令 | 本轮结果 | 解释 |
| --- | --- | --- |
| `.venv/bin/python -m pytest -q tests/test_market_review.py tests/test_report_language_fallbacks_ko.py tests/test_analysis_api_contract.py tests/test_sec_financials.py tests/test_agent_chat_api.py` | **194 passed，8 warnings，22.40s** | 包含 SEC 选择与 API、报告语言、旧分析/Agent 合同；警告为既有 pandas 等提示。 |
| `apps/dsa-web`: `vitest run --maxWorkers=2` | **110 文件通过；1387 passed，2 skipped，0 failed，71.13s** | 完整 Vitest；没有改断言或跳过数。 |
| `apps/dsa-web`: `playwright test --config playwright.fixture.config.ts --workers=1`（本机 Chrome） | **35 passed，0 failed，1.1m** | 完整夹具套件，API 响应为明确的合成数据，只证明浏览器交互。 |
| `apps/dsa-web`: `tsc -b`；`vite build` | **均通过**；Vite **8.31s** | 产物写入 Git 忽略的 `static/`。 |
| `apps/dsa-web`: `eslint .` | **失败：37 errors、1 warning** | 与 Step C 记录一致，主要为继承 React effect 状态设置；旧筛选页有依赖警告。新增研究页/壳层/财务 API 文件未出现在此轮诊断中；未放宽规则。 |
| `git diff --check`；三条 YAML 解析和 job guard 核查 | **通过** | 工作流 guard 只允许原上游仓库运行，未激活线上工作流。 |

**真实数据与来源复核：** 本机 `/` 和 `/api/v1/financials/company/NVDA` 均 HTTP 200。API 含 22 个期间；最新 FY2026 10-K 期间为 2025-01-27 至 2026-01-25，营收 **215,938,000,000 USD**、净利润 **120,067,000,000 USD**、经营现金流 **102,718,000,000 USD**，取回时间 `2026-10-28T18:21:15.487824+00:00`。检查响应中的 **347 个**期间/数值来源链接（18 个不同 URL），全部使用 `https://www.sec.gov/Archives/edgar/data/`，不合格 URL 为 **0**；以已配置的有效 SEC 联系身份单次请求最新 10-K 原文，返回 **HTTP 200 / text/html**。本轮没有重新把全部 99 项事实与实时 CompanyFacts 逐条比较；此前有限样本的逐项对照仍由下方 Phase 1A 记录证明。

**真实页面与公开材料：** 2026-10-29 从生产 React/FastAPI 本机页面重新捕获 **7 张**非夹具 PNG：英文/中文 Research Home 与 Company Research、英文 390px 公司页、英文收入/经营现金流对照及展开证据。逐张查看关键视觉；PNG 无额外元数据；1440px 截图及 390px 手机截图尺寸符合文件名。对拟发布 Markdown 的 **54 个本地链接**检查，缺失或不在拟发布集合/既有仓库中的目标为 **0**。

**Git/安全检查：** 工作树现有 **105 个**修改或未跟踪路径；精确拟暂存 **91 个**，排除 **14 个**历史设计/原型文档，`git add --dry-run --pathspec-from-file=...` 仅打印这 91 项，未真实暂存。对拟暂存文本逐项扫描已知 token/私钥格式、非空 `SEC_CONTACT_EMAIL` 和用户绝对路径，**0 命中**；发现的地址仅为 `.env.example` 中的 `example.com` 与测试中的 `.test` 示例。`.env` 被 Git 忽略、未跟踪；API 响应不含联系邮箱或邮箱字符；`LICENSE` 未修改。此为本地启发式扫描与人工核对，不替代托管平台的完整密钥扫描。未 commit/push/merge/tag/deploy。

**发布判断：** 核心 NVDA 研究路径可作为有边界的求职作品集演示。全站英语 Step C 尚未通过，其失败项继续见 `LOCALIZATION_AUDIT.md`；这不应被写成核心 SEC 数值错误，也不能对外宣称全站双语完工。公开默认分支前还需人工核查 Fork 当前 Actions 设置；本地 guard 未改变已发布的默认分支。

## Phase 1A.5 Step C 当前代码状态验收（2026-10-29）

本节记录**最后一次产品代码改动之后**的结果。Step C 本地化尚有明确发布阻断项，测试通过不表示全站英语文案完成。以下命令在项目根或 `apps/dsa-web/` 执行，Node 使用本机已安装的兼容运行时；详细日志位于 `/tmp/equitylens-stepc-*.log`，一次性截图置于仓库外 `../phase1a5-evidence/step-c/`。

| 检查 | 最终实际结果 | 边界 |
| --- | --- | --- |
| Web `vitest run --maxWorkers=2` | **110 文件通过；1387 通过、2 跳过、0 失败**；`/tmp/equitylens-stepc-vitest-serial.log` | 先前与生产构建、Python、Playwright 并行运行时 56 项超时/失败，属于资源争用，未改断言或默认超时；全部重跑后通过。 |
| Web `playwright test --config playwright.fixture.config.ts --workers=1`，本机 Chrome | **35 通过、0 失败，58.0 秒**；`/tmp/equitylens-stepc-playwright-serial.log` | 首次并行时 23 通过、12 失败，多为页面/元素等待超时；串行全绿。夹具截取 API 并使用合成数据，只证明交互与回归。 |
| Web `tsc -b`、`vite build` | **均通过**；最终 Vite 构建 3 分 52 秒，静态产物在已忽略的 `static/` | 包含新增 Agent 请求语言与告警触发历史文案。 |
| Python `.venv/bin/python -m pytest -q tests/test_market_review.py tests/test_report_language_fallbacks_ko.py tests/test_analysis_api_contract.py tests/test_sec_financials.py tests/test_agent_chat_api.py` | **194 通过、8 警告**；`/tmp/equitylens-stepc-python-release.log` | 警告来自第三方弃用与测试辅助类收集；未修改 SEC 正规化/公式。 |
| Web `eslint .` | **37 errors、1 warning，失败** | 与本轮初次诊断相同；37 项主要是旧 React effect 内同步状态设置，警告在旧筛选页 useEffect 依赖。未放宽 lint 规则。 |
| Step C 相关文件定向 ESLint | **13 errors、0 warnings，失败** | 13 项全部位于既有 Home/Chat/Alerts/Settings/DataCenter 的旧 `react-hooks/set-state-in-effect` 代码路径；新增原文披露、告警触发历史等组件没有新增 lint 报错。该规则提示级联渲染与旧状态时序风险，未发现由这批诊断直接指向的安全缺陷；全仓警告可能提示筛选任务状态陈旧，需独立修复。 |
| `python -m py_compile`、`git diff --check`、`git check-ignore -v .env` | **通过**；`.env` 匹配 `.gitignore:4:*.env`，`git ls-files --error-unmatch .env` 返回未跟踪 | 没有输出或记录联系邮箱值；未提交、推送、部署。 |

**实际应用检查：** 回环服务 `/` 与 `/api/v1/financials/company/NVDA` 返回 HTTP 200。已缓存 SEC 响应保留 CIK 1045810、FY2026 10-K 的 2025-01-27 至 2026-01-25 期间，营收 **215,938,000,000 USD**、净利润 **120,067,000,000 USD**、经营现金流 **102,718,000,000 USD**，并带原申报链接；本轮没有将夹具当作真实数据或重新声称逐项在线核验。实际加载后的 React 首页/公司页在 1440、1024、768、390px 中英/亮暗组合无整页横向溢出；抽查的首页/公司页均有 SEC 链接。英文旧市场报告在展开前只显示英文来源告知，点击 `Inspect original report` 后才显示原始中文与原有 Emoji，内容未改。前后截图见 `before-daily-analysis-en.png`、`after-daily-analysis-en-final.png` 及 `after-daily-analysis-en-original-revealed.png`。尚未用真实 LLM 验收英语生成质量。

**语言审计的失败项：** 浏览器实际访问 `/screening`、`/portfolio` 英语模式仍显示中文标准控件；`/chat` 的后端技能名、旧会话可为中文，`src/notification.py` 新标准通知/报告模板仍有装饰 Emoji。`LOCALIZATION_AUDIT.md` 逐路由列明状态。Step C **尚未完整通过产品验收**，应先收尾这些问题，再决定进入 Phase 1B。

## Phase 1A.5 Step C 启动前 Step B 最终基线（2026-10-28）

此基线在**任何 Step C 产品代码修改前**，针对已包含 `#cash-flow` 同页跳转修复及 Recharts 绘线动画关闭的 Step B 最终工作树实际重跑；不能与下面较早的 Step B 记录混同。

| 命令 / 检查 | 结果 |
| --- | --- |
| `apps/dsa-web`: `vitest run --reporter=dot` | **109 文件通过；1381 通过、2 跳过、0 失败**；日志 `/tmp/equitylens-stepc-baseline-vitest.log`。 |
| `apps/dsa-web`: `playwright test --config playwright.fixture.config.ts --workers=1`，使用本机 Chrome | **35 通过、0 失败，1.7 分钟**；日志 `/tmp/equitylens-stepc-baseline-playwright.log`。浏览器夹具使用合成数据，不作为真实 SEC 准确性证据。 |
| `apps/dsa-web`: `tsc -b`、`vite build` | **均通过**；生产构建 42.15 秒。 |
| `.venv/bin/python -m pytest -q tests/test_sec_financials.py tests/test_api_health.py` | **16 通过、4 警告**；日志 `/tmp/equitylens-stepc-baseline-pytest.log`。 |
| `git diff --check` 与 `.env` Git 排除检查 | **通过**；`.env` 命中 `.gitignore:4:*.env`，未跟踪。 |

当前工作树保留 Phase 1A/Step A/Step B 的全部未提交修改及未跟踪文件；忽略项还包括本地 `.venv`、`node_modules`、SEC 缓存 `data/`、日志和静态构建产物。本轮不清理、不覆盖这些内容。真实 NVDA 接口与浏览器数值检查另见下方 Step C 最新验收记录。

## Phase 1A.5 Step B 本地实施实测（2026-10-28）

本节测试实际 React 代码和本机回环服务。浏览器自动化在 Vite 中拦截 API 使用**明确标注的合成夹具**，只证明交互与回归；真实金额另通过当前生产 FastAPI/已缓存 SEC 来源读取并在浏览器人工核对。未修改 Python SEC 选值、计算、接口或缓存。

| 检查 | 实际结果 | 范围与限制 |
| --- | --- | --- |
| `apps/dsa-web`: `vitest run --reporter=dot` | **109 文件通过；1381 通过、2 跳过，0 失败** | 全量前端。首次全跑因旧测试假定工具组总是收起而失败 2 项；改为根据当前 disclosure 状态进入既有链接后重跑全绿，未删原路由错误恢复断言。日志 `/tmp/equitylens-stepb-vitest-final.log`。 |
| `apps/dsa-web`: `tsc -b`、`vite build` | **均通过** | 3202 个模块转换；产物写入仓库已忽略的 `static/`。 |
| `apps/dsa-web`: 变更 TypeScript/TSX 的定向 ESLint | **0 error / 0 warning** | CSS 不在 ESLint 配置适用范围；其构建和浏览器渲染已单独核查。全仓 ESLint **38 errors / 1 warning**，与 Step A 记录一致，错误在未触及的旧组件/页面；未放松规则。 |
| `apps/dsa-web`: `playwright test --config playwright.fixture.config.ts --workers=1`（本机 Chrome） | **35 通过，0 失败，59.6s** | 全部浏览器夹具；新增 Step B 比较/来源、路由 hash、工具深链接刷新与手机 Drawer。初次全跑的旧首页标题和自动展开假设造成失败，更新测试后全绿，日志 `/tmp/equitylens-stepb-playwright-final.log`。 |
| `.venv/bin/python -m pytest -q tests/test_sec_financials.py tests/test_api_health.py` | **16 通过，4 警告** | SEC 适配、规范化与 API/健康相关回归；警告为第三方库弃用与测试辅助类收集提示。 |
| 本机真实 `/`、`/research/NVDA`、`/api/v1/health`、`/api/v1/financials/company/NVDA` | **均 HTTP 200** | API 返回 NVIDIA CORP、CIK 1045810、22 个期间。FY2026 10-K：收入 215,938,000,000 USD、净利 120,067,000,000 USD、经营现金流 102,718,000,000 USD；FY2025 对照为 130,497,000,000 / 72,880,000,000 / 64,089,000,000 USD。两期收入及现金流原始概念均一致；原始 filing URL 仍由 API 提供。此次读取现有缓存，不构成新的 SEC 原站逐项审计；Phase 1A 原始核对见下文。 |
| 真实生产浏览器：公司页 1440/1024/768/390 × EN/ZH × 亮/暗 | **16/16 组合通过** | 每组实际读本机 API，校验 FY2026 营收、`html lang`、主题状态和整页横向溢出 0px。另在四组代表性组合中核查比较值、SEC 来源并截图；首页 EN 亮与 ZH 暗截图也已留存。截图在仓库外 `../phase1a5-evidence/step-b/`；手机表格只在自身容器内横向滚动。 |
| `git check-ignore -v .env`、`git diff --check` | **通过** | `.env` 由 `.gitignore` 的 `*.env` 排除；未输出联系邮箱、未提交、推送或部署。 |

当前仍存在 Step C 范围内的旧市场报告英文/中文混合与装饰 Emoji；本节不将其记为已修复。完整 Revenue & Cash Flow 解释、AI、Follow 与更多发行人验证也未在 Step B 建立。

最终生产浏览器复核额外发现并修正两项页面细节：同一公司页中修改 hash 时，比较区现在会立即出现；Recharts 默认入场绘线曾让即时截图只显示部分线条，现关闭该图表入场动画。修复后 `tsc -b`、`vite build`、受影响 Vitest **5/5**、Playwright **3/3**、定向 ESLint **0/0** 均再通过；真实页面四种宽度的完整趋势线、比较原始来源链接和零整页横向溢出均再次核验。全量 Vitest/Playwright 通过记录是在这两项微调前完成，微调后的定向复测覆盖了改动范围。

## Strategy 2.1 / Step B 规划检查（历史记录，2026-10-28）

本轮仅审阅产品与代码并编写计划，**没有实施 Step B，也没有重跑自动化测试**。下方 Step A/1A 的历史测试数不能当作本轮新增功能的通过记录。

| 实际检查 | 结果与限制 |
| --- | --- |
| 本机 `uvicorn server:app --host 127.0.0.1 --port 8000`；`curl` 访问 `/`、`/api/v1/health`、`/api/v1/financials/company/NVDA` | 三个端点均 HTTP 200；服务只绑定本机回环。财务接口返回官方来源的 NVDA 数据，经现有缓存/请求管理取得；这不是新的一轮 SEC 原文逐项对照。 |
| 实际浏览器打开 React `/`、展开 `Market Tools`、导航至 `/research` 并刷新 | 首页显示 FY2026 NVIDIA 10-K 营收 215,938,000,000 USD 和净利润 120,067,000,000 USD、期间和 SEC 链接；公司页显示财务与证据。工具组可展开，刷新公司页后恢复收起；工具深链接初始状态同样由当前代码默认收起，Step B 需修复。 |
| 核对现有路由、`SecFinancialResponse`、`SidebarNav` 和公司页 | 研究问题报告/AI/Follow 不存在；旧 DSA 历史不等于 SEC 研究历史；导航有现有旧工具真实路由。 |
| `git diff --check` | 通过；本轮只修改规划文档与更新记录，不修改产品代码、不提交/推送/部署。 |

当前生产 React 的窄窗口截图保存在仓库外 `../phase1a5-evidence/strategy-2-1/current-home-narrow.png` 与 `current-company-narrow.png`。它们记录的是 **Step A 已运行页面及 Step B 改造前的公司页**，不是新设计效果图或 Step B 完工证据。


## Phase 1A.5 Step A 实测（2026-10-28）

本节仅涵盖实际 React 壳层、Research Home 与旧工具入口；Company Research 的内容设计及旧报告语言治理仍待 Step B/C 审批。浏览器夹具使用合成财务数据；下述真实页面另由本机现有 SEC API 返回。

| 检查 | 实际结果 |
| --- | --- |
| Web `tsc -b` 与 `vite build` | 通过，最终构建产物由本机 FastAPI 提供。 |
| 完整 Vitest `vitest run --maxWorkers=4` | 109 files passed；1378 passed、2 skipped、0 failed。日志在仓库外 `/tmp/equitylens-stepa-vitest-serial.log`。 |
| 完整 Playwright fixture `EQUITYLENS_CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' playwright test --config playwright.fixture.config.ts --workers=1` | 33 passed（58.6 秒）。覆盖首页搜索、键盘 tab、reduced-motion、加载/空/错误/重试、1024/768/390 响应式、旧深链接等；财务值是明确标识的夹具。日志 `/tmp/equitylens-stepa-playwright-33.log`。本机缺少 Playwright 下载的 headless shell，因此显式使用已安装 Chrome；一次新增夹具误拦截 Vite 的 `/src/api/*` 模块，修正拦截范围后全量通过。 |
| Python `.venv/bin/python -m pytest -q tests/test_sec_financials.py tests/test_api_health.py` | 16 passed、4 warnings；未更改 SEC 计算逻辑。日志 `/tmp/equitylens-stepa-python.log`。 |
| 改动 Web 文件定向 ESLint | 通过。完整 ESLint 仍失败：38 个旧文件 error、1 个旧 warning；新增 Step A 文件无这些错误，规则未放宽。日志 `/tmp/equitylens-stepa-lint.log`。 |
| `git diff --check` 与 `git check-ignore -v .env` | 前者通过；后者确认 `.gitignore:4:*.env` 忽略本机联系邮箱文件。未打印邮箱。 |

实际本机服务 `127.0.0.1:8000` 返回首页和 NVDA API 均为 200；浏览器 Research Home 从 API 显示 NVIDIA CORP 的 FY2026 10-K 年度营收 215,938,000,000 USD、净利润 120,067,000,000 USD、2025-01-27 至 2026-01-25 期间、原申报链接及取回时间。首页所示十亿美元数值是同一 API 整数的格式化预览，完整整数仍可见。已在桌面 1440/1024、平板 768、手机 390 检查中英文、亮暗主题、侧栏、搜索、证据和无整页横向溢出；截图保存于仓库外 `<local-evidence>/step-a/`。原 `/research/NVDA` 财务内容仍为 Phase 1A 版本；Step A 截图只验证新壳层兼容，不能代表 Step B 设计完成。旧 Market Review 英文混中文及装饰 Emoji 尚未处理，属于 Step C 已知缺陷。

## Phase 1A 本地实测追加（2026-10-28）

以下结果来自未提交的 `feature/equitylens-foundation` 工作树。自动化单元/浏览器夹具使用明确标识的合成数据；另行使用本机有效 `SEC_CONTACT_EMAIL` 对 NVIDIA 执行了少量真实 SEC 请求。检查配置与日志时没有输出邮箱。

| 实际执行 | 结果 | 边界 |
| --- | --- | --- |
| `PATH=<Codex Node 24>/bin:$PATH ./node_modules/.bin/vitest run --reporter=dot`（`apps/dsa-web`） | **108 files passed；1379 passed、2 skipped、0 failed** | 包括新增页面 EN/ZH/缺失/配置状态、API v1 路径、导航与两项原失败修正。完整输出在仓库外 `/tmp/equitylens-phase1a-vitest.log`。 |
| `.venv/bin/python -m pytest -m 'not network' -q tests/test_api_health.py tests/test_auth_status_setup_state.py tests/test_api_app_cors.py tests/test_storage.py tests/test_intelligence_api.py tests/test_analysis_api_contract.py tests/test_sec_financials.py` | **207 passed、23 warnings** | 原 Phase 0 定向 198 用例加 SEC 新用例 9；含补零 CIK 与生产性资产现金流回归，均为离线。完整输出 `/tmp/equitylens-phase1a-pytest-final.log`。 |
| `PATH=<Codex Node 24>/bin:$PATH ./node_modules/.bin/eslint .` | **FAIL**；当前安装依赖检查出 38 个旧文件错误、1 个旧 warning | 新增/本轮修改的 Web 文件定向 ESLint 通过。错误涉及未修改的原项目组件/页面（主要为 `react-hooks/set-state-in-effect`）；本轮没有跨模块批量改写。此结果与 Phase 0 记录的 0 error 不一致，需在后续单独复核依赖/基线。 |
| `tsc -b && vite build`（Node 24 PATH） | PASS | 新 `CompanyResearchPage` chunk 被打包到根目录 `static/`；静态产物由现有 FastAPI 服务。 |
| `PATH=$PWD/.venv/bin:$PATH ./scripts/ci_gate.sh syntax`、`flake8`、`deterministic` | 全部 PASS | flake8 critical count 0；YFinance 代码转换离线检查通过。 |
| `playwright test --config playwright.fixture.config.ts` | 首次环境失败，29 用例未启动 | 当前 Playwright 指向的 Chromium headless shell 版本在本机缓存缺失；并非断言失败。 |
| 指定系统已安装 Google Chrome 的一次性本地 config，`playwright test --workers=1` | **30 passed，55.6s** | 原 29 个 fixture 加新增研究页桌面/390px、证据、图表、EN/ZH、空状态用例；全部拦截 API 并标明合成数据。默认 Playwright Chromium headless shell 缺失，故本机显式指向已安装 Chrome；最后源码状态的完整输出 `/tmp/equitylens-phase1a-playwright-final.log`。一次性 config 已删除。 |
| 本地 `SCHEDULE_ENABLED=false STOCK_INDEX_REMOTE_UPDATE_ENABLED=false .venv/bin/python -m uvicorn server:app --host 127.0.0.1 --port 8000 --no-proxy-headers`；GET `/api/v1/health`、`/api/v1/financials/company/NVDA`、`/research/NVDA` | 服务启动；HTTP **200 / 200 / 200** | 财务 API 返回 `NVIDIA CORP`、CIK 1045810、22 个期间；FY2026 营收 215,938,000,000 USD、净利润 120,067,000,000 USD、生产性资产购置 6,042,000,000 USD。 |
| 检查 `.env`/配置/Git 与 API/缓存 | PASS | `.env` 被 `.gitignore:4:*.env` 忽略且未跟踪；`Config.sec_contact_email` 存在并通过格式门控；邮箱不出现在财务 API 响应或 SEC JSON 缓存中。 |
| SEC 官方 ticker、Submissions、CompanyFacts + 原始 10-K/10-Q | **受控少量真实 SEC 请求，PASS** | 初次真实请求发现 Submissions CIK 为补零字符串，修复后回归；99 个页面候选的 reported 值按 `concept/unit/start/end/form/accession/value` 逐项精确匹配原始 CompanyFacts。FY2026 10-K 原文 HTTP 200，营收 `215,938`、净利润 `120,067`、生产性资产购置 `6,042`；FY2027 Q2 10-Q 原文营收 `96,221`、净利润 `59,688`、半年生产性资产购置 `4,434`，均为百万美元。来源：[CompanyFacts](https://data.sec.gov/api/xbrl/companyfacts/CIK0001045810.json)、[原始 10-K](https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm)、[原始 10-Q](https://www.sec.gov/Archives/edgar/data/1045810/000104581026000075/nvda-20260726.htm)。 |
| 对真实 SEC 输入独立重算 FY2026 比率及 FY2027 Q2 生产性资产季度差额 | PASS | 收入同比 65.4735%、净利率 55.6025%、经营现金流率 47.5683%；Q2 差额 `4,434,000,000 − 1,757,000,000 = 2,677,000,000 USD`，显示为 `derived` 且保留两条原始 10-Q 来源。 |
| 实际内置浏览器打开真实 `/research/NVDA`、EN/ZH 切换与证据展开 | PASS | 英文和中文真实数值、公式、XBRL 概念、原始链接可见；截图在仓库外 `../phase1a-evidence/nvda-live-en.png`、`nvda-live-zh-evidence.png`。另有显著标明 SYNTHETIC 的测试截图，绝不当作生产结果。 |
| `git diff --check` | PASS | 没有空白错误；未提交、推送、部署。 |

初始浏览器运行曾显示路由错误边界：新 API 客户端遗漏 `/api/v1`，请求落到 SPA HTML 回退。修正路径并新增契约测试后，真实浏览器显示预期配置状态。真实 SEC 请求又揭示补零 CIK；新增真实格式夹具后通过。新浏览器夹具的路由拦截曾误拦 Vite `/src/api/` 模块，已限于 `/api/`；390px 证据长文本溢出及图表 CSS 色值也已修复。Phase 0 的两项原 Vitest 失败均在修正后的完整测试中消失。

**在线核验范围：** 真实 NVDA ticker/CIK、最近 10-K/10-Q、99 个申报值到 CompanyFacts 的精确元组匹配，以及 FY2026 10-K、FY2027 Q2 10-Q 原文显示值已核对；它证明本轮样本及接口链路，不等于所有公司、所有历史或所有派生值均经人工审计。FY2021 资本支出等缺项仍保留空值；生产性资产购置的口径比纯 PP&E 更宽，并在页面标明。

执行日期：2026-10-27 至 2026-10-28（Asia/Shanghai）。正式代码修订：`4e6226430b76124e5f43b19201fc6338a62f5e1d`；目录：`<local-repo>`；分支：`feature/equitylens-foundation`。以下 `PASS` 只表示列出的命令/检查通过，不扩大解释为所有产品功能已完成。

## 恢复与环境

| 实际命令 / 检查 | 结果 | 证据与说明 |
| --- | --- | --- |
| `git -c http.version=HTTP/1.1 clone --depth 1 https://github.com/yqiu6250uu/daily_stock_analysis.git equitylens-source` | FAIL，退出码 128 | `Empty reply from server`；原始 HTTP/2 路径也复现 `Error in the HTTP2 framing layer`。未覆盖原有 0 字节文件。 |
| `scutil --proxy`；对 Git smart endpoint 用 `curl --proxy http://127.0.0.1:7897 --http1.1` | PASS | 系统 HTTP(S) 代理为回环地址 `127.0.0.1:7897`；显式走代理后 smart endpoint 返回 HTTP 200。未更改系统或 Git 全局设置。 |
| `git -c http.proxy=http://127.0.0.1:7897 -c http.version=HTTP/1.1 clone --depth 1 https://github.com/yqiu6250uu/daily_stock_analysis.git equitylens-git` | PASS，退出码 0 | `git rev-parse HEAD` 为 `4e6226430b76124e5f43b19201fc6338a62f5e1d`；`origin` 指向 Fork；1,216 个跟踪文件；浅历史。 |
| `git switch -c feature/equitylens-foundation` | PASS，退出码 0 | 只创建本地分支，未提交或推送。 |
| `git status --short --branch` / `git remote -v` / `git rev-parse --is-shallow-repository` | PASS | 初次克隆为干净 `main`，建分支后为干净 `feature/equitylens-foundation`；浅历史为 `true`。 |
| `git fsck --no-reflogs --full` | PASS，退出码 0 | 本地浅克隆对象完整性检查没有报错。 |
| Codex 随附 Python 执行 `-m venv .venv`，再运行 `.venv/bin/python --version` | PASS，退出码 0 | 3.12.14；系统默认 3.16.0a1 未替换。 |
| `HTTPS_PROXY=http://127.0.0.1:7897 HTTP_PROXY=http://127.0.0.1:7897 PIP_DISABLE_PIP_VERSION_CHECK=1 .venv/bin/python -m pip install -q -r .github/requirements-ci.txt` | PASS，退出码 0 | 首次下载出现可重试 TLS EOF 警告，pip 最终完成。此文件包括主 `requirements.txt` 和 pytest/flake8 工具。 |
| `PATH=<bundled-node-bin>:$PATH <bundled-pnpm> dlx npm@10 ci --no-audit --no-fund`（在 `apps/dsa-web`） | PASS，退出码 0 | 锁文件安装 463 个包；Node 24.22.1，npm 10.9.9。 |

## 后端离线检查

下列命令从正式仓库根目录执行，PATH 中的 `python`/`flake8` 指向 `.venv/bin`：

| 命令 | 结果 | 说明 |
| --- | --- | --- |
| `PATH=$PWD/.venv/bin:$PATH ./scripts/ci_gate.sh syntax` | PASS，退出码 0 | CI 指定 Python 文件语法检查通过。 |
| `PATH=$PWD/.venv/bin:$PATH ./scripts/ci_gate.sh flake8` | PASS，退出码 0 | 严重错误选择集计数 0。 |
| `PATH=$PWD/.venv/bin:$PATH ./scripts/ci_gate.sh deterministic` | PASS，退出码 0 | `scripts/test.sh code` 与 `scripts/test.sh yfinance` 的离线代码/代码转换案例全通过；没有请求实时行情。 |
| `.venv/bin/python -m pytest -m 'not network' -q tests/test_api_health.py tests/test_auth_status_setup_state.py tests/test_api_app_cors.py` | PASS，退出码 0 | 15/15 通过，3 条第三方或收集警告。 |
| `.venv/bin/python -m pytest -m 'not network' -q tests/test_storage.py tests/test_intelligence_api.py tests/test_analysis_api_contract.py` | PASS，退出码 0 | 183/183 通过，21 条依赖/SQLAlchemy/pytest 警告。两次定向测试合计 198/198。 |
| `./scripts/ci_gate.sh offline-tests`（全仓离线 pytest） | NOT RUN | CI 原本分成三片；Phase 0 已覆盖健康、认证、CORS、存储、资讯和分析 API 合同。全量回归留在业务变更后的阶段门。 |

## Web 检查

下列 `npm` 命令在 `apps/dsa-web` 执行，均带 `PATH=<bundled-node-bin>:$PATH`，通过 `<bundled-pnpm> dlx npm@10` 调用：

实际 shell 调用形式：

```bash
PATH=<bundled-node-bin>:$PATH <bundled-pnpm> dlx npm@10 run lint
PATH=<bundled-node-bin>:$PATH <bundled-pnpm> dlx npm@10 run build
PATH=<bundled-node-bin>:$PATH <bundled-pnpm> dlx npm@10 run test
PATH=<bundled-node-bin>:$PATH ./node_modules/.bin/playwright test --config playwright.fixture.config.ts
```

| 命令 | 结果 | 说明 |
| --- | --- | --- |
| `npm run lint` | PASS，退出码 0 | 0 error、1 warning：`StockScreeningPage.tsx:1383` 的 `useEffect` 依赖项。 |
| `npm run build` | PASS，退出码 0 | TypeScript 和 Vite 构建完成，产物在根目录 `static/`。 |
| `npm run test` | FAIL，退出码 1 | **1372 passed、2 failed、2 skipped**（1376 tests / 106 files）。失败 ① `tests/ui_governance.test.ts` 的原生 `title` 禁令命中 `src/components/layout/DesktopUpdateIndicator.tsx`；② `DecisionSignalsPage.test.tsx` 的过期信号刷新测试找不到 `timeline-click-90`。原始完整输出在仓库外 `../phase0-evidence/web-vitest.log`。两项在定向重跑中仍失败。 |
| `./node_modules/.bin/playwright test --config playwright.fixture.config.ts` | PASS，退出码 0 | 29/29 浏览器 fixture 通过；这些用例拦截 API，不证明真实数据接入。完整输出在 `../phase0-evidence/playwright-fixtures.log`。 |

第一次完整 Vitest 曾在 ZIP 临时树与 lint/build 并行时出现 3 个失败，其中 `StockScreeningPage` 的恢复测试在正式克隆的定向重跑与完整重跑均通过，暂记时序待观察；正式结果以本表的 **2 个失败**为准。未修改原项目测试或业务代码来消除失败。

## 真实服务与人工浏览器验收

| 命令 / 操作 | 结果 | 证据 |
| --- | --- | --- |
| `STOCK_INDEX_REMOTE_UPDATE_ENABLED=false SCHEDULE_ENABLED=false .venv/bin/python -m uvicorn server:app --host 127.0.0.1 --port 8000 --no-proxy-headers` | PASS | Uvicorn 输出 `Application startup complete` 与 `http://127.0.0.1:8000`；未启用调度。日志目录 `logs/` 被 Git 忽略。 |
| `curl --noproxy '*' --fail-with-body http://127.0.0.1:8000/api/health` | PASS | HTTP 200，`{"status":"ok",...}`。 |
| `curl --noproxy '*' --fail-with-body http://127.0.0.1:8000/api/v1/health` | PASS | HTTP 200，`{"status":"ok",...}`。 |
| `curl --noproxy '*' http://127.0.0.1:8000/` | PASS | HTTP 200、`text/html`；返回 Vite 构建后的首页。 |
| 浏览器打开 `/`、切换 EN、刷新、打开 `/settings` | PASS，人工观察 | 首页和设置页渲染；语言切换刷新后保持；分析按钮因缺少模型渠道/自选股而禁用。截图：`../phase0-evidence/baseline-web.png`、`../phase0-evidence/baseline-web-en.png`。英文动态配置项仍有中文。 |
| `curl --noproxy '*' http://127.0.0.1:8000/api/v1/auth/status` | PASS | 返回 `authEnabled:false`；仅将服务器绑定 `127.0.0.1`。 |

**未运行**：真实股票分析、SEC companyfacts 拉取、外部模型、通知、Docker、未配置密钥的端到端 Playwright smoke、公开部署。它们不构成 Phase 0 成功声明。

## Phase 0.5 设计原型验证（2026-10-28）

以下仅检查 `docs/equitylens/concepts/` 中的独立原型，**不是生产 React 功能测试**。

| 实际命令 / 检查 | 结果 | 证据与限制 |
| --- | --- | --- |
| `.venv/bin/python -m http.server 8765 --bind 127.0.0.1 --directory docs/equitylens/concepts`，然后 `curl` 两个 HTML | PASS；两页 HTTP 200 | 本机静态原型服务，未调用后端 API。 |
| `node --check docs/equitylens/concepts/prototype.js` | PASS，退出码 0 | 原型脚本语法检查。 |
| `NODE_PATH=$PWD/apps/dsa-web/node_modules <Codex Node 24 路径> ../phase0.5-evidence/check-previews.cjs` | PASS，退出码 0 | Playwright Chromium 打开 A/B；检验搜索、年/季、键盘柱形选择与焦点保留、证据展开、错误/重试、EN/ZH、主题、关注反馈；1440px 截图、390px 中英截图；390/768/1024px 无整页水平溢出。脚本和截图均在仓库外 `../phase0.5-evidence/`。 |
| 原项目 1440px 当前首页截图 | PASS，人工审阅 | `../phase0.5-evidence/current-ui-desktop.png`；仅用于设计审计，不证明截图中历史数值准确。 |
| 新设计的生产 React 测试、真实数据源与 API 合同 | NOT RUN | 本阶段未改产品 React/后端。Phase 0 的原有测试结果不因此改变。 |

初测 B 原型在 390px 顶栏发生整页水平溢出；修正搜索栏布局后重新执行以上 Playwright 检查，退出码 0。原型截图包含虚构公司和示例数值，不能作为真实研究或已完成产品功能展示。
