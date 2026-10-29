# EquityLens 进度与交接

## v0.2 本地候选版（2026-10-30；公开 v0.1 不变）

- 本地 React 静态演示复用现有 EquityLens 壳层，已加入 NVDA、MSFT、AMAT 三家公司、只读指标探索/对比/有限筛选、结构化收入与经营现金流问题报告，以及可保存/重开/删除/导出的浏览器本机研究。公开 Cloudflare URL 仍运行 NVDA-only v0.1；未上传 v0.2。
- Python 新增版本化报告合同、可比年度/同季度选择、Decimal 变化/增长/利润率计算、明确不足原因和来源链接；无需 LLM。可选 AI 解释接口默认关闭，仅有 mock/合同验证，无真实模型质量结论。
- 三家发行人的最新两个年度及两个季度样本，共 30 项 reported 和 6 项 derived quarter 值，按官方 SEC CompanyFacts 的 XBRL 概念、单位、期间、form、accession 和金额对照；MSFT/AMAT 最新 10-K/10-Q 原始文件另获 HTTP 200。AMD 因修订年度锚点缺失可靠财年标签而未纳入。详细边界、数据流和工具可用性见 [v0.2 候选说明](V0_2_RELEASE_CANDIDATE.md)。
- 最终全套构建/浏览器/安全回归及本地发布审查见 [测试结果](TEST_RESULTS.md)。未推送、部署或修改主分支。以下内容保留历史审计记录。
- 用户授权的 **71 文件**本地候选提交 `bf4a5a407dc259702cca15fe6dbd0c8377e524fe` 已创建，使用已有 GitHub noreply 作者身份；未推送。原先 14 份未跟踪设计草稿/原型继续保留，未纳入提交。远端功能分支与 `main` 均保持原 SHA。

更新时间：2026-10-29（Asia/Shanghai）。**公开作品集网站 v0.1 已上线并完成在线验收**：[EquityLens Portfolio Demo](https://equitylens-portfolio-v01.pages.dev/)。Phase 1A.5 Step C 已实施部分本地化修复，但尚未达到全站英语完成门槛；公开演示只呈现已验证的 NVDA 研究主路径。Step B 已由用户批准；Phase 1A 的 SEC 数据层保持不变，Phase 1B 未开始。以下历史基线保留供审计，当前功能以实际代码和下述最新记录为准。

## GitHub 功能分支和静态网站已发布

- 用户批准的 91 文件发布集已拆为两次提交并推送至现有 Fork 的 `feature/equitylens-foundation`：产品与测试 `74ce2f8fc5d519109b22b6093b1fe861f9f8fa53`，文档、截图和工作流防护 `6d794c450d5fcdd6b57b08731afef89f236c7529`。远端默认 `main` 仍是 `4e6226430b76124e5f43b19201fc6338a62f5e1d`；14 个排除的设计草稿未被提交。未合并、打标签或启用 Actions。
- Cloudflare Pages Free 项目 `equitylens-portfolio-v01` 已由用户明确批准后经 Direct Upload 上线：[公开 HTTPS 首页](https://equitylens-portfolio-v01.pages.dev/)；[NVDA 公司页](https://equitylens-portfolio-v01.pages.dev/research/NVDA)。13 个静态文件复用真实 React 研究首页/公司页，发布路由只接受 NVDA，并从有日期的只读 SEC 核验快照读取 22 个财务期间及 325 条数值来源记录；旧工具、账户、通知和 AI 后端不会出现在公开演示路由中。快照取回时间与摘要、构建和更新步骤见 [部署文档](PORTFOLIO_DEMO_DEPLOYMENT.md)。
- 最终公开地址已通过 Playwright 3/3、1440/1024/768/390px 浏览器检查、英文/中文与亮/暗四组合、深链接刷新、收入/现金流比较、原始证据、无整页溢出/私有 API 请求/页面错误；线上快照 SHA-256 与本机导出一致。完整旧 Vitest 最终重跑 **1390 通过、2 跳过、0 失败**；旧 Playwright 夹具 35/35、SEC/API Python 16/16、TypeScript 和普通/演示构建通过。准确命令与限制见 [测试结果](TEST_RESULTS.md)。
- 为避免暗示实时更新，演示版公司页移除了原“刷新”按钮；本机完整应用保留原按钮与 API 行为。网站源代码当时仍是未提交改动，现已随 v0.2 本地候选提交纳入，但尚未推送。`demo-dist/` 的 v0.1 13 文件当时已扫描，未发现邮箱、私钥、用户路径或个人配置；未连接 GitHub 自动构建、未公开本机 FastAPI。

## 求职作品集 v0.1 发布前检查记录（历史状态）

- README 已改为 EquityLens 产品入口，保留原项目 MIT 许可与署名，明确 SEC 研究功能和继承自 DSA 的市场工具边界；新增 [功能状态](FEATURE_STATUS.md)、[已知限制](KNOWN_LIMITATIONS.md)、[案例研究](PORTFOLIO_CASE_STUDY.md) 与 [发布清单](RELEASE_CHECKLIST.md)。
- 从实际回环运行的 React/FastAPI 应用重新捕获七张长期产品文档截图，包含英文/中文研究首页、公司页、移动端、收入/现金流对照及展开的 SEC 证据；不是合成夹具或静态原型。
- 在继承的三条定时 GitHub 工作流上准备了仅允许原上游仓库执行的本地 job guard。该变更未推送，不能改变当前 Fork 默认分支上的工作流状态；发布前还须核查 Fork 的 Actions 设置。
- 当前本机 NVDA API 与网页 HTTP 200，FY2026 10-K 的营收 215,938,000,000 USD、净利润 120,067,000,000 USD、经营现金流 102,718,000,000 USD；347 个返回的申报/证据链接均为 SEC Archives URL，最新 10-K 原文重新取得 HTTP 200。本轮不是对全部 99 项事实的重新在线逐项核验。
- 安全扫描、链接和截图核验及自动化重跑记录在 [测试结果](TEST_RESULTS.md)。`.env`、数据库、缓存、日志和构建产物不在拟暂存集合；目前**没有暂存、提交、推送、合并、打标签、部署或启用工作流**。

## Phase 1A.5 Step C：已实施但尚待收尾

- 已按 Step B 最终工作树先重跑完整 Vitest、Playwright、TypeScript/构建与 Python 定向基线，再修改 Step C 产品代码；结果见 `TEST_RESULTS.md`，不能将旧结果冒充本轮最终版本。
- 原市场复盘历史报告在英语模式下明确显示“原文为中文、无核验译本”，由用户主动展开；界面标题、按钮和标准栏目按 UI 语言显示，原始 Markdown/证据未改。新市场复盘根标题与推送标题去掉装饰 Emoji。旧股票报告 Markdown 也使用来源语言披露。
- 旧每日分析各任务入口显式传所选报告语言；问股 Web 请求新增可选 `report_language`，后端复用现有 Agent 上下文并按英语显示工具进度名。未配置 LLM 时没有真实模型输出质量验收。
- 公司页折叠对照时来源区序号为 04，展开时为 05；历史数据表可键盘聚焦并有区域标签。设置页首次检查、问股和告警主要控件、404、通知测试默认标题等按语言和 EquityLens 品牌修正。
- 实际浏览器已验证研究首页、NVDA 公司页 1440/1024/768/390px 无整页溢出、双语/双主题、原 SEC 链接及真实 API 数值；截图在仓库外 `../phase1a5-evidence/step-c/`。没有修改财务公式、事实选值或用户 `.env`。
- **剩余发布阻断缺口：** `/screening` 大量英语模式硬编码中文，`/portfolio` 新增账户界面仍有中文；旧 `src/notification.py` 标准报告/通知模板仍有装饰 Emoji，旧聊天会话/模型输出语言不能保证。覆盖矩阵见 `LOCALIZATION_AUDIT.md`。因此本轮**不声明 Step C 已完整验收**，也不进入 Phase 1B。

## Phase 1A.5 Step B：本地实现，等待视觉审阅

- 现有 EquityLens 标识、236px 研究优先侧栏和 Step A 搜索保持可用；浅色主题调整为暖白/象牙纸面与深海军蓝，暗色主题同步校正，研究标题有限使用本地 serif。没有复制用户提供的第三方产品截图，也没有加入远程字体或新 UI 框架。
- `/research/:ticker` 在原 `SecFinancialResponse` 上重排为公司身份与取回时间、所选财政期间与申报链接、主要申报值、可展开次要报表值、既有计算指标、财务趋势、真实研究问题入口、同类期间收入/经营现金流对照及就近证据。图表可切收入、净利润、经营现金流与年度/季度；期间按钮同步概览、对照和来源。证据仍显示概念、单位、起止日期、申报/受理日期、accession、原文链接和计算定义。
- “收入增长是否转化为现金流？”仅开启**事实比较**，并提供 `/research/NVDA#cash-flow` 深链接。上年可比期要求同类 FY/Q 且期间长度差不超过 10 天；某项同比对照另要求 USD 与原始概念一致。不符合时解释不能比较，不生成现金流增长率、FCF 或 AI 结论。首页只添加这个真实入口，仍复用既有 NVDA API 与缓存。
- 同一公司页直接切换到 `#cash-flow` 也可展开比较；趋势线禁用 Recharts 默认入场动画，避免短暂只绘制部分线段及 reduced-motion 观感不一致。
- Market Tools 使用原 disclosure，按现有路由分组；工具深链接及刷新会自动显示活跃工具，手动展开状态在会话中保留。桌面侧栏和手机 Drawer 共用这一导航；原工具路由与后端逻辑未改。
- 真实本机 NVDA API 与生产页面已再次核对，1440/1024/768/390px 的中英、亮暗页面与 390px 比较面板均无整页横向溢出；截图保存在仓库外 `../phase1a5-evidence/step-b/`。自动化准确结果见 `TEST_RESULTS.md`。未改用户 `.env`，未提交、推送、部署或公开服务。
- 当前缺口：没有完整研究问题引擎、AI 解释、Follow 或已保存研究；旧市场复盘的英语混中文与装饰 Emoji 属于 Step C 的明确待办。Step B 完成后停下供用户视觉审阅，不自动推进 Step C/1B。

## Product Strategy 2.1：已批准的规划基线（历史记录）

- 用户批准 Step A 的白色/深海军蓝品牌、左侧研究优先导航和真实数据 Research Home。新战略将求职作品集可验证性、真实研究价值、未来可选商业化依次排序；核心旅程为 Explore → Discover → Investigate → Verify → Follow，无账户、券商或 LLM 才能开始研究的门槛。
- 已审阅实际路由、`CompanyResearchPage.tsx`、SEC API 合同、旧工具和研究原型，并在本机 React/FastAPI 核实首页、健康接口、NVDA 财务接口 HTTP 200。Market Tools 可展开，但刷新工具深链接后重置为收起；公司页事实与证据可用，研究问题引擎和 Follow 未建。
- 该规划检查点曾建议在现有公司页内完成事实阅读、收入/经营现金流比较与就近证据，并修正工具导航；用户随后批准 Step B，本轮已依此实施。完整研究报告、可选 AI 和 Follow 仍分别留在后续阶段。

## Phase 1A.5 Step A：已实施，视觉与架构获批

- 首页 / 现为 EquityLens Research Home：白色/深海军蓝双主题、原创镜头与财务轨迹矢量标识、236px 研究优先侧栏、可折叠工具组与手机 Drawer。原分析首页完整迁到 /tools/daily-analysis；/tools 汇总现有旧工具，其他深链接和 API 保持原路径。
- 首页按 ticker 搜索：Enter/按钮提交，空值与非法格式有中英错误提示；合法但 SEC 不支持的代码交由公司页显示官方映射错误。轮换示例仅是 placeholder，聚焦/输入即停止，reduced-motion 下不轮换，不承诺名称或行业搜索。
- 首页精选 NVIDIA 使用现有 /api/v1/financials/company/NVDA。申报值、完整金额、FY/起止日、10-K 链接、取回时间和 5 个年度收入点均来自 API；可在财务报表/趋势/来源证据之间切换。10 分钟内的同一浏览器会话复用内存结果并合并并发请求；失败可重试，旧数据刷新失败会标记取回时间。没有虚构行情、活动流或 AI 结论。
- Company Research 的内容布局与旧报告本地化仍属 **Step B/C**，当前仅在新壳层中可用并已截图。英文旧市场复盘的中文正文和装饰性 Emoji 仍是明确未解决问题，未把它们误报为 Step A 已修复。
- 本机服务仍只监听 127.0.0.1:8000；未改 SEC 正规化计算、后端/数据库/通知、认证或用户 .env。未提交、推送、部署。生产页面实际截图在仓库外 ../phase1a5-evidence/step-a/；测试详见 TEST_RESULTS.md。

## Phase 1A 当前进度

- 新增 `data_provider/sec_edgar.py`：使用 SEC 官方 ticker 映射、Submissions、CompanyFacts，联系邮箱门控，进程内 2 次/秒节流，3 次有界重试，5/15 秒连接/读取超时，磁盘 TTL 缓存；只在服务端请求 SEC。`data/sec_cache/` 已被仓库的 `/data/` 忽略。
- 新增 `src/services/sec_financials.py`：按精确期间、USD 单位、优先 XBRL 概念和最后申报日期选择事实；冲突事实留空；区分 10-K/10-Q、修订、年度/独立季度/累计季度及 Q4 差额。金额源包含 accession、SEC 链接、概念、期间、提交/受理/取回时间，计算值附公式和输入来源。
- 新增 `/api/v1/financials/company/{ticker}` 类型化只读接口与现有 React 壳层的公司研究页。NVDA 为默认入口；年度/季度、历史图、6 项财务字段、3 个计算指标、逐项证据、缺失/错误/加载/配置状态、EN/ZH 已接入。旧分析逻辑、数据库表、Actions、通知均未改。
- 两项 Phase 0 Vitest 失败已消除：桌面更新进度改由 accessible description 承载；时间线测试夹具日期改为近 90 天内，保留原业务断言。完整 Vitest、后端相关回归、lint、构建结果见 `TEST_RESULTS.md`。
- 用户已在本机 `.env` 配置有效 `SEC_CONTACT_EMAIL`；应用实际读取成功，`.env` 被 Git 忽略、未跟踪，邮箱不在 API 响应或 SEC 缓存中。适配器仅为真实核验执行 3 个官方 JSON 请求；缓存后页面访问不重复抓取。另独立核对原始 10-K/10-Q。合成测试夹具没有用于生产页面。
- 真实请求发现 SEC Submissions 的 CIK 为补零字符串，已修复并加回归；NVIDIA 近年资本现金流采用较宽的 `PaymentsToAcquireProductiveAssets` 概念，已按“资本开支 / 生产性资产购置”明确口径并保留原始概念、来源。99 个 `reported` 值均可在官方 CompanyFacts 以概念/期间/单位/申报编号/数值精确匹配；FY2026 10-K 原文 HTTP 200 并含抽查显示值。
- 本地 FastAPI 在 `127.0.0.1:8000` 回环监听；`/api/v1/health`、真实 NVDA 财务 API、`/research/NVDA` 均 HTTP 200。页面实际显示 FY2026 营收、净利润、资产、负债、经营现金流与生产性资产购置及计算指标；双语和证据展开已人工浏览器核验。浏览器合成夹具 30/30 通过。

## 已完成且有证据

- 在新目录安全克隆用户 Fork 的完整当前工作树；用单次 Git HTTP/1.1 + macOS 已配置的本机代理解决克隆传输失败；本地分支 `feature/equitylens-foundation`，HEAD `4e6226430b76124e5f43b19201fc6338a62f5e1d`。未提交/推送。
- 使用稳定 Python 3.12 `.venv`、兼容 Node 24/npm 10 安装后端和前端依赖。系统全局 Python 3.16 alpha 未改。
- 审阅根 `AGENTS.md`、主要入口、Web/i18n、认证、数据 provider、SQLAlchemy 存储、测试与 GitHub 工作流；保留 MIT 署名。
- 实际启动回环地址 FastAPI 和构建后的 Web；两条健康检查 HTTP 200；浏览器首页/设置页、EN/ZH 切换及刷新持久化已观察并截图。
- 后端离线定向 pytest **198/198 通过**；`ci_gate` syntax/flake8/deterministic 通过；Web lint/build 通过；Playwright 离线 fixture **29/29 通过**。完整 Vitest **1372 通过、2 失败、2 跳过**，已如实记录。
- 新建 `BASELINE_AUDIT.md`、`IMPLEMENTATION_PLAN.md`、`DECISIONS.md`、`TEST_RESULTS.md`；基线截图及完整前端测试日志在仓库外 `../phase0-evidence/`。
- Phase 0.5 新建 `DESIGN_BRIEF.md`、`DESIGN_SYSTEM.md`、`UX_IMPLEMENTATION_PLAN.md` 和两套独立浏览器原型；原型桌面/手机截图及交互验证脚本在仓库外 `../phase0.5-evidence/`。生产 React/后端均未改动。

## 未完成、已知限制

- Phase 0 时没有实现财报、行业关系、Thesis Tracker 或研究质量模块 1–4；Phase 1A 现仅验证 NVDA 财报纵向切片，未验证其他公司或全部历史重述；模型/行情分析与通知不在本阶段。
- Phase 0 时完整 Vitest 有 2 个稳定失败，Phase 1A 已修复/校正；lint 仍有原项目 `StockScreeningPage.tsx` 的 1 条警告。
- `.env` 已存在且被忽略；模型渠道/自选股仍可能未配置，旧“分析”流程的可用性与新 SEC 页独立。英文旧动态配置说明部分仍含中文。
- 当前依赖下全仓 ESLint 扫描在未修改的旧组件/页面报告 38 个错误、1 个警告；本轮新增/修改 Web 文件的定向 ESLint 通过。该结果与 Phase 0 记录的全仓 lint 通过不一致，需要单独复核，不在财报阶段批量重构旧 UI。
- Docker 未安装；全量离线 pytest、需真实密钥的 Web smoke 和公开部署未运行。当前管理员认证关闭，所以服务必须保持 `127.0.0.1` 本地访问。
- `.venv` 和 Node/npm 使用 Codex 桌面随附运行时；如缓存被清理，需要用独立稳定安装重建。正式仓库为 `equitylens-git`，恢复用的不完整 ZIP 临时树不得继续开发。

## Phase 1A 剩余验收与 Phase 1B 建议

1. Phase 1A 已完成 NVDA 有限真实核验。后续扩大到其他发行人前，仍需针对各自 fiscal calendar、taxonomy 变更、旧历史申报与修订做独立样本核对；目前不将 99/99 精确原始事实匹配解释为跨发行人准确率。
2. Phase 1B 建议：加强 fiscal 周数、taxonomy 变化和旧历史申报覆盖；若需要跨重启版本审计，再设计独立事实表与幂等迁移。单独排查全仓 ESLint 与 Phase 0 基线不一致问题。
3. Phase 0.5 的 Research Desk / Evidence Ledger 方向仍需用户审阅；Phase 1A 没有对全站换肤。Phase 1B 不会自动开始。

## 用户决策

- 当前试点公司按用户 Phase 1A 指令固定为 NVDA。真实 SEC 核验已完成有限样本；无需 LLM API Key。Phase 0.5 设计方向可独立评审。
- `AGENTS.md` 要求 commit/tag/push 另获明确授权；本轮文档均为未提交的本地文件。
