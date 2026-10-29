# EquityLens 架构决定记录

## D-019 已定：三家公司静态数据宇宙与版本化研究报告（2026-10-30）

- 保留现有 FastAPI/React/SEC 正规化层；以 Python `Decimal` 在独立服务生成 `RevenueCashFlowReport` v1，前端静态/动态适配器消费同一结构。公开演示只装载经抽样核验的 NVDA、MSFT、AMAT 日期快照，不直接访问 SEC、私有后端或 LLM。
- 选 MSFT 和 AMAT 是为了覆盖不同财年日历与现金流事实；AMD 最新修订年度锚点缺失可靠财政年，暂不进入可发布宇宙。任何新增公司先经过独立原始 SEC 对照，不能从 NVDA 验证外推。
- 增长率只在正基数、同概念/单位/可比时计算；现金流为零或负数时仅保留绝对变化并披露原因。观察不等于因果。宽口径生产性资产取得不充当纯 PP&E 或无条件自由现金流。
- My Research 采用带版本校验的浏览器本机存储，无账户/同步/自动监测。可选 AI 只在本机私有后端显式开关与用户点击下运行，缺模型时报告仍可用，公开构建禁用 AI。
- Cloudflare Pages 仍为原 Direct Upload 项目。v0.2 开发期间不修改公开 v0.1；预览仅在凭据允许时创建，生产上传须用户另批。

日期：2026-10-29。已定指已经在本地实现或验证的决定；提案为后续设计评审，不代表产品代码已经落地。D-003 的原方案为 Phase 0 历史提案，Phase 1A 实际取舍由 D-008/D-009 覆盖；D-007 的待选方向由 D-011 覆盖。

## D-018 已定：公开作品集演示以静态快照上线，不开放本机分析服务

- 用户批准 Cloudflare Pages Free `equitylens-portfolio-v01` 项目及 13 文件直接上传，2026-10-29 已上线 `https://equitylens-portfolio-v01.pages.dev/`。公开站点是独立静态 React 构建，不连接 GitHub 自动部署、FastAPI、LLM、通知或工作流；预期增量托管费用 $0/月，仍须按 Cloudflare 账户实际用量与条款监测。
- 首次线上检查发现静态公司页残留“刷新”按钮，可能误导访客认为有实时财报；仅在 `IS_STATIC_DEMO` 模式隐藏并重新发布。本地完整 Web 的数据刷新与 API 行为不变。公开 NVDA 快照摘要与本机导出的原始 API JSON 完全一致，页面显著标注取回日期、仅支持 NVDA 与不实时更新。
- 公开 HTTPS 站点已通过深链刷新、财务事实/年度季度/现金流对比/SEC 来源、双语与浅暗主题、四种宽度、无私有 API 请求的浏览器检查。新静态演示源文件及上线记录仍是本机未提交改动；先前已推送的 91 文件功能分支不包含它们。后续如需把静态演示源码推到 GitHub，须取得单独 Git 操作授权。默认分支与继承的计划工作流未动。

## D-017 已定：Git 功能分支先安全发布，公开网站采用静态 NVDA 快照

- 用户授权的两次本地提交已无强推地发布到 Fork 的 `feature/equitylens-foundation`，当前默认 `main` 保持原 SHA；14 个设计草稿仍在本机。仓库专用 Deploy Key 私钥只保存在本机，Git 全局身份未改，提交使用 GitHub noreply 身份。默认分支及其继承工作流仍待独立审批。
- 网站以现有 React 研究组件和单独 Vite demo 模式构建，仅含 `/`、`/research`、`/research/NVDA` 的公开研究路径。数据是现有 FastAPI 通过 SEC 流程返回的未改写 JSON 快照，附取回时间、原申报链接和已核验计算定义；公开访问不要求账号、LLM、FastAPI 或本机环境变量。只接受 NVDA，其他旧路由明确说明不可用。
- 当时选择 Cloudflare Pages Free 的 Direct Upload 作为待批准的最小上传方案；用户随后批准且线上验收已完成，结果见 D-018。本决定的审批门槛已满足；GitHub 默认分支和继承工作流仍待独立决定。

## D-016 已定：先发布真实求职作品集，再推进全站本地化和 AI 研究

- 用户将可核验的求职作品集列为当前最高优先。README/案例只宣称本机已有的 NVDA SEC 事实、确定性比较、证据链接、双语研究主路径和实际测试；不宣称完整自主 AI agent、所有美股验证、公开服务或原项目独立著作。Step C 的 `/screening`、`/portfolio` 英语缺口继续公开披露，不以旧工具债务阻断真实核心流程的求职展示。
- 保留 MIT 许可与上游署名。七张长期产品截图来自当前真实本机应用及 SEC-backed API；合成 Playwright 夹具不作财务准确性证明。Git 暂存使用精确清单，不使用 `git add -A`。
- Fork 的三条继承定时工作流增加上游仓库 job guard，防止这些版本进入 Fork 默认分支后继续执行每日分析、网络 smoke 或自动关闭 Issue/PR。当前默认分支及 Actions 设置未改变；发布审批前必须确认 Fork 现有工作流设置。现阶段不公开 FastAPI 服务，不开启付费 API、通知或部署。
- 优先把代码、文档和证据作为 GitHub 作品集候选提交；静态只读演示需另做数据快照适配和审计，不延误仓库发布。用户审批前不 commit/push/merge/tag/rename/deploy。

## D-015 已定：界面语言与原文语言分离；Step C 不掩盖遗留缺口

- `dsa.uiLanguage` 仅决定应用控件、标准标题及新任务请求语言，不作为历史内容已经翻译的证据。中文历史 Market Review/Markdown 在英语模式显示来源语言说明与主动展开；不覆写原始 SEC、A 股材料或已保存报告。
- Web 新任务显式传 `reportLanguage`；Agent Chat 可选 `report_language` 请求字段限定 `zh/en`，旧调用继续服务端默认值，且不改现有 `context` 中股票对象语义。英语工具进度名由后端映射，不将模型内容当作已核验翻译。
- 已获批 Step B 视觉与 SEC 财务合同不变；报告根标题去除装饰 Emoji，历史证据仍原样。`/screening`、`/portfolio` 英文硬编码及旧通知模板 Emoji 被明确列为尚待修复的 Step C 发布阻断项，不以全绿测试替代人工语言覆盖验收。

## D-014 已定：Step B 用已有 SEC 合同构建事实比较，不扩展财务计算

- 用户批准 Step B 真实 React 实施，并将最终视觉定为 Step A 品牌/侧栏基础上的暖白、深蓝与克制的编辑式排版；浅暗主题均使用本地字体和现有组件/图表库，不从第三方截图复制界面。
- `/research/:ticker` 用当前 `SecFinancialResponse` 展示公司上下文、主要/次要事实、既有派生指标、年度/季度趋势、收入与经营现金流比较和逐项 SEC 证据。比较按同财政年相邻、相同 FY/Q、期间长度接近和原始概念/单位一致性逐项判断；不计算新 OCF 增长率或自由现金流，不输出 AI 解读。`#cash-flow` 是可分享的真实调查入口。
- Market Tools 保留现有路由与 disclosure；工具深链接默认展开，并保留同会话人工选择。Step B 不修改 Python SEC 选值、公式、API、缓存或原始证据，也不创建 Follow/监测或新版报告。视觉审阅后再决定是否进入 Step C/1B。

## D-012 已定：采纳 Product Strategy 2.1；Step A 保持为产品基础

- 用户已批准 Step A 的白色/深海军蓝视觉、持续可辨认的 EquityLens 左栏、研究优先工作区和现有真实 NVDA 入口；不重新设计已获批的壳层。Strategy 2.1 以可核验的求职作品集为第一优先，真实金融研究价值第二，商业化第三；“Portfolio First”不等于把旧持仓工具升为主导航。
- 研究旅程为 Explore → Discover → Investigate → Verify → Follow；开始公司财务研究不依赖账户、券商、投资假设或 LLM。当前事实/证据链可用；研究问题报告、AI 解释和 Follow 是后续计划，不在本轮伪装为功能。
- 公共发布目标为每月增量 $0–5，但目前未部署也未实测成本。未来优先核验静态案例，动态 SEC/AI 需独立安全、速率、持久化和支出硬阈值 Gate。现有单进程 SEC 限速不视作多实例公开部署合规证明。

## D-013 已被 D-014 实施：Step B 的最小真实研究切片

- 推荐保留 `/research/:ticker` 与现有 `SecFinancialResponse`，在当前公司页重排公司身份/新鲜度、财务概览、趋势、一个收入与经营现金流比较入口、就近证据及数据不足状态。该比较只展示现有事实和已有指标，不在前端新增未经 Python 验证的增长率/自由现金流，也不冒称完整研究报告。
- `Market Tools` 保留既有链接与展开按钮；修正工具深链接刷新后当前项被折叠隐藏，并按真实工具路由分组。首页只加有功能的比较入口，不添加人工活动流或未建模块。
- 完整 Revenue & Cash Flow 问题引擎、Python 新计算和可选 AI 留至 Phase 1B；旧报告英语与 Emoji 治理为 Step C；本地 Follow 为之后独立阶段。具体文件、交互和验收见 [Step B 计划](./PHASE_1A5_STEP_B_PLAN.md) 及 [问题规格](./REVENUE_CASH_FLOW_SPEC.md)。用户已在后续请求中授权此最小切片，最终实现决策见 D-014。

## D-011 已定：研究优先壳层与真实数据首页，止于 Step A

- 用户批准 Research Desk + Evidence Ledger 的信息架构，最终视觉定为白色与深海军蓝、持续可辨认的 EquityLens 左侧栏及右侧研究工作区。原创 SVG 标识、236px 桌面栏、可折叠旧工具组和手机 Drawer 已在现有 React 壳层实现；保留现有主题/语言状态管理。
- / 是 Research Home；旧 HomePage 迁至 /tools/daily-analysis，/tools 是现有工具索引，其他深链接不变。首页只承诺 ticker 查询，不添加未接通的公司名/行业搜索、监控、研究历史或虚构活动流。
- 首页直接复用 Phase 1A 财务 API；浏览器内存缓存 10 分钟并合并并发请求，减少往返。金额展示既给四舍五入的十亿美元预览，也给原始完整 USD 数值及 SEC 文件、期间和取回时间；失败/空值不填造数字。旧服务器端 SEC 缓存及计算逻辑保持不变。
- 新首页和壳层用独立的 EN/ZH 文案与局部 CSS token，默认浅色；用户已保存的亮/暗偏好继续生效。旧报告生成和旧数据语言并未在 Step A 更动，英文市场复盘混合语言与 Emoji 留到用户批准后的 Step C。
- Step A 完成后暂停视觉审阅。Company Research 的内容重排、证据与图表交互优化属于 Step B；旧报告与全站语言治理属于 Step C。未经批准不继续实施、不提交/推送/部署。

## D-008 已定：SEC 只读适配器与磁盘缓存先行，数据库事实表延至下一阶段评估

- 用户当前明确要求 NVDA 单公司纵向切片、先验证现有应用，禁止大规模重构。`data_provider/sec_edgar.py` 只请求官方 ticker 映射、Submissions 和 CompanyFacts；`SEC_CONTACT_EMAIL` 缺失或格式无效时在发出请求前拒绝。2 次/秒进程级节流、3 次重试、连接/读取超时、24h/1h/6h TTL 缓存控制访问量；不使用 LLM Key。
- 本地单进程开发只保存 SEC 公共 JSON 的缓存内容与原始取回时间，不写旧 `FundamentalSnapshot` 或分析表。没有新 SQL 表/迁移；若 Phase 1B 需要长期版本审计，再设计独立事实表。多 worker/多实例需共享限流器，不能把本阶段进程内限速当作可直接公开部署的实现。
- 缓存命中保留最初取回时间；超期后请求失败返回错误，不把旧缓存冒充新鲜值。缓存目录在已有 Git 忽略的 `data/` 下；API 不输出联系邮箱。
- 本机真实请求证实 SEC Submissions CIK 可能为补零字符串，CompanyFacts CIK 可为整数；比较时统一校验纯数字后按整数比对。`.env` 被 Git 忽略且未跟踪，邮箱未出现在 API 返回和公共 JSON 缓存。

## D-009 已定：精确期间与申报来源优先于填满财务表

- 仅选 `us-gaap` 的 USD 项，字段优先级固定：营收 `RevenueFromContractWithCustomerExcludingAssessedTax` → `Revenues` → `SalesRevenueNet`；其他字段见 `src/services/sec_financials.py`。对同一结束日按 instant/年度/独立季度/YTD 期间长度过滤；同一概念中按申报/受理日及 accession 选较晚申报，最新同一上下文有冲突值则置空；修订申报可胜出。相同概念/单位/财年起点才允许累计差分与 Q4 推导。
- `operating_cash_flow`、`capital_expenditure` 的季度累计差分与 Q4 均标记 `derived`，保留两个输入来源。收入同比要求上一可比财年/季度、相同概念和正分母；净利率/经营现金流率均附公式。无匹配、单位不一致、冲突、累计资本开支逆向等情形显示空值或质量标记，绝不补估计值。
- 现有 React 壳层内新增公司页，保留当前设计系统。报告数值和计算数值逐项展开证据；用户尚未选定 Phase 0.5 A/B 视觉方案，因此不做全站样式迁移。
- NVIDIA 近年 `PaymentsToAcquirePropertyPlantAndEquipment` 不再覆盖最新期间；官方 `PaymentsToAcquireProductiveAssets` 定义包含 PP&E、软件及其他无形资产。按该顺序作为备选概念，页面标为“资本开支 / 生产性资产购置”并展开口径说明，避免将宽口径数值声称为纯 PP&E。不同概念不可直接用于差分推导。
- 用户配置本机项目联系邮箱后已做有限真实 SEC 对照；离线合成夹具仍只证明算法与组件，不能替代在线核验。

## D-010 已定：真实数据 Gate 采用逐项原始事实核对，保留范围限制

- 以 SEC 官方 ticker、Submissions、CompanyFacts、FY2026 10-K 与 FY2027 Q2 10-Q 为来源；NVDA 的 99 个页面 `reported` 数值以概念、USD、起止日期、form、accession 和整数值精确匹配官方 CompanyFacts，10-K/10-Q 原文可定位抽查显示值。来源链接和取回时间留在 API/页面，核验记录见 `TEST_RESULTS.md`。
- 当前证明范围为 NVDA 最近六年年度和近十二个 10-Q 形成的 22 个期间；它不代表其他公司、所有历史、所有派生值或跨周期口径都已人工审核。公司搜索仍可查询其他 SEC 映射代码，但商业发布前需逐发行人验证并加入跨实例限流、长期版本审计。
- Phase 1A 只用本地回环服务；真实 SEC 调用已获用户在本机配置邮箱后的授权。未提交、推送或部署，也未启用计划任务、通知或 LLM。

## D-001 已定：在现有 Web/API 单体内增量扩展

- 背景：[`apps/dsa-web/src/App.tsx`](../../apps/dsa-web/src/App.tsx) 已有路由与认证边界；[`api/app.py`](../../api/app.py) 托管 Web 并挂载 [`api/v1/router.py`](../../api/v1/router.py)。
- 取舍：保留 React/TypeScript/Vite 与 FastAPI，而不是另建 Streamlit 或第二套 API。Phase 0 只构建/启动，不重写入口。
- 兼容/回滚：旧路由与认证未改；本轮仅需删除新增的 `docs/equitylens/` 文档即可撤销文档 diff（须由用户决定是否执行）。
- 验证：Web 构建成功，页面和健康接口实际加载；详见 `TEST_RESULTS.md`。

## D-002 已定：本地隔离运行，单次命令定向使用代理

- 背景：无代理 Git HTTP/2 出现 framing 错误、HTTP/1.1 出现空响应；macOS 系统代理是 `127.0.0.1:7897`。全局 Python 为 3.16 alpha，系统 PATH 无 Node。
- 取舍：仅在克隆命令传 `http.proxy` + HTTP/1.1；项目内 `.venv` 用稳定 Python 3.12；复用 Codex 随附 Node 24 和本地 npm 10 缓存。未改变系统/Git 全局设置，也没有配置真实密钥。
- 兼容/回滚：仓库源码不受影响；随附运行时若缓存被清理需要重新安装兼容 Python/Node，并重建 `.venv`/`node_modules`。服务仅绑定 `127.0.0.1`。
- 验证：克隆 HEAD/文件数、依赖安装、API、浏览器和测试结果见基线审计。

## D-003 提案：SEC 官方事实独立于旧聚合基本面

- 背景：[`data_provider/yfinance_fundamental_adapter.py`](../../data_provider/yfinance_fundamental_adapter.py) 可用信息字段和估算值做报告补全；[`src/storage.py`](../../src/storage.py) 的 `FundamentalSnapshot` 仅为 write-only 上下文 JSON。两者均不能保证 accession/period/unit 逐项可审计。
- 方案：在现有目录内新增 `data_provider/sec_edgar.py`、`src/services/sec_financial_service.py` 与类型化事实/来源表；旧聚合数据继续支持旧页面，不混标为 SEC 核实值。
- API/存储：新 `/api/v1/financials` 端点与新表；旧字段/端点不改。依照已有 `DatabaseManager` 做幂等新增迁移，不迁移旧报告。
- 依赖/成本：优先已有 `requests`/SQLAlchemy/Pydantic；SEC 官方接口无 API Key，但需合规 User-Agent、限速/缓存与网络预算。按官方文档在实施当日复核政策。
- 测试/回滚：固定 SEC fixture、人工 ground truth、旧库升级/新旧 API 回归；出错可关闭新入口，旧页面继续读原数据。

## D-004 提案：复用现有双语壳层，服务端显式处理研究语言

- 背景：[`UiLanguageContext.tsx`](../../apps/dsa-web/src/contexts/UiLanguageContext.tsx) 与 [`uiText.ts`](../../apps/dsa-web/src/i18n/uiText.ts) 支持 EN/ZH，`src/config.py` 有 `REPORT_LANGUAGE`；浏览器已验证切换持久化，但英文页仍出现中文配置动态项。
- 方案：新页面文案加入现有字典，新研究解释 API 明确传入/返回 locale；财务字段/ticker/官方文档标题保持原标识。避免仅在前端翻译英文报告。
- API/存储：只有新端点新增 locale 字段；旧报告语言合同不变。
- 测试/回滚：EN/ZH 组件和浏览器测试、刷新持久化与无混合文案检查；关掉新路由可回到旧体验。

## D-005 提案：Thesis Tracker 使用用户版本而非旧决策信号

- 背景：[`api/v1/schemas/research_artifact.py`](../../api/v1/schemas/research_artifact.py) 的 `ResearchThesis` 允许 action；[`src/storage.py`](../../src/storage.py) 的 `DecisionSignalRecord` 含 entry/stop/target price，服务于原项目的决策信号，并非 EquityLens 用户控制的版本账本。
- 方案：Phase 3 新增可追加的 thesis/version/evidence-link 表与独立接口，借鉴现有展示组件和仓储模式，但不复用旧交易语义为研究证据。
- API/存储：新端点、追加式版本、原证据引用；不改旧 signal 合同。
- 测试/回滚：版本不被覆盖、重载持久化、AI 建议须人工采纳、无自动买卖文案；新模块可禁用，旧 signal 路由保持。

## D-006 已定：Phase 0 不提交、不部署、不启用自动任务

- 背景：[`AGENTS.md`](../../AGENTS.md) 禁止未经确认的 commit/tag/push；[`.github/workflows/00-daily-analysis.yml`](../../.github/workflows/00-daily-analysis.yml) 有工作日定时分析及通知映射。
- 取舍：本轮只写审计/计划文档、做本机测试和回环地址运行；不做 GitHub Actions、通知、公开服务或真实股票分析。
- 验证：最终 `git status` 仅显示 `docs/equitylens/` 未跟踪新文档，已跟踪源码的 `git diff` 为空；运行命令含 `SCHEDULE_ENABLED=false`，本机 API 状态显示认证关闭。

## D-007 提案：先选定研究页设计方向，再局部接入 React

- 背景：`Shell.tsx` 的窄侧栏、`index.css` 的多套视觉特例与 `HomePage.tsx` 的大型任务流程，使直接整体换肤有较高回归风险。
- 方案：Phase 0.5 交付 Research Desk 与 Evidence Ledger 两套独立原型及 `DESIGN_BRIEF.md`、`DESIGN_SYSTEM.md`；用户选定方向后，在 Phase 1A 新公司页局部加入 `--el-*` token，再逐步统一 Shell/总览。
- 范围：原型只在 `docs/equitylens/concepts/`，使用虚构公司和示例数字；未改变 `apps/dsa-web/src/`、后端、API 或财务计算。
- 测试/回滚：本地 Chromium 两套 1440/390 视口、搜索/期间/证据/状态/语言/主题交互已验证；撤销设计文档不会影响现有应用。是否采用 A/B/组合尚待用户决定。
