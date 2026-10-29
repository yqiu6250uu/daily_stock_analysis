# Phase 1A.5 Step B：Company Research 阅读体验实施提案

日期：2026-10-28。状态：**用户已批准；Step B 已在本地 React 应用实施，等待视觉审阅。** 下文的方案比较与实施顺序是批准前的历史计划；实际范围、测试与限制见 [PROGRESS.md](./PROGRESS.md)、[TEST_RESULTS.md](./TEST_RESULTS.md)、[D-014](./DECISIONS.md)。保持 Step A 的 EquityLens 左侧栏、暖白/深海军蓝、主题/语言与旧工具深链接。

## 1. 两种最小路径与推荐

| 方案 | 好处 | 代价 |
| --- | --- | --- |
| **推荐：在现有公司页内重排，加入可执行的“收入与现金流比较”数据视图** | 立即让“财务 → 问题 → 证据”有真实操作；沿用当前 SEC response、期间与来源，Step B 不建新后端/报告。 | 用户仍需等 Phase 1B 才能得到完整研究解释；界面必须明确“比较”并非“AI 结论”。 |
| 只做页面视觉和图表改进，问题区仅展示未来预告 | 改动最少、风险低。 | 用户仍难从财报进入有意义的研究任务，无法回应 Strategy 2.1 的 Discover。 |
| Step B 直接加入完整研究引擎和 Follow | 一次交付完整旅程。 | 触及新计算/AI/持久化/公开成本，超出 Step B 视觉与工作流范围，也难完成可靠验证。 |

推荐第一项；以一个真实、有限的财务比较入口连接既有事实和证据。**Step B 完成后停下浏览器视觉审阅**，不自行实施 Step C/1B。

## 2. 页面层级与操作

### 2.1 Company Identity & Data Freshness

页首同一行展示公司名、ticker、CIK、SEC 数据来源、当前 FY/Q、10-K/10-Q、财政期间起止、申报日期与 `retrieved_at`。取回时间不等于申报时间；格式化成可读本地时间并保留完整 UTC 元数据于证据。状态仅根据 API 已有 `data_quality`、`quality_issues` 和实际加载/请求结果，不能把“缓存”泛称“实时”。公司搜索留在页首，提交有效 ticker 后路由可复制/后退；无结果和 SEC 未配置各有清楚恢复路径。

### 2.2 Financial Overview

用一条按财报逻辑分组的指标带替代当前六张大边框 KPI 卡：营业收入、净利润、经营现金流为主，资产/负债及资本购置为次级展开。每项始终显示金额、USD、选定期间、`reported/derived`；来源控制就近可达。现有 `revenue_growth`、`net_profit_margin`、`operating_cash_flow_margin` 与申报值视觉分层，公式在证据中可展开。缺失显示“无符合口径的申报值”，不是 0。

### 2.3 Financial Trends

保留现有 Recharts/annual-quarterly 与收入/净利润切换，加入经营现金流指标。建议图高约 240–300px，限制线条数量；点选/键盘选择某一期间后，同步旁侧或下方的确切 USD 值、FY/Q、来源表单和 filing 链接。默认两至五个可比期间；季度不得把 YTD 与独立季度混画。颜色不是唯一编码，图下有屏幕阅读器可读的数值列表/紧凑表。切换指标不改变所选期间的来源上下文；无可比值时说明原因，不连跨缺口。

### 2.4 Research Questions：Step B 的真实能力边界

显示一个具有经济意义、可执行的入口：“收入增长是否转化为经营现金流？” / “Is revenue growth translating into cash flow?”。Step B 的按钮名为**“比较收入与现金流”**，点击后将图表切到收入/经营现金流比较视图、滚动到该视图并聚焦标题；它只使用已有 API 数值和来源，不输出判断、趋势评分或 AI 解释。旁边明确说明“完整研究报告将在后续版本提供”。若当前或可比期间缺收入/经营现金流，按钮改为查看可用证据，列出缺失字段，不暗示发现异常。不显示 Operating Profitability / Earnings Quality 的假入口。

### 2.5 Selected Research Investigation、Evidence & Calculations

Step B 的“调查”是当前期间与上一可比期间的**事实阅读视图**，不是 Phase 1B 报告。可见：收入、经营现金流、现有经营现金流率、期间和来源；任何尚未由 Python 正式计算的 OCF 增长率或 FCF **不在 Step B 计算并标为已验证**。呈现短的“下一步可核查什么”方法提示，不能写成已查明的原因。

点击事实旁的来源入口就近展开现有 `Evidence` 内容：XBRL 概念、单位、起止日、form、filed/accepted、accession、原始 URL 和取回时间。上下文与选中期间同步；“全部期间”保持当前表格的可比数值和质量问题，桌面使用紧凑表格、手机允许表格容器内横向滚动但不能整页溢出。公式只对 `derived` 项展示，不能把原始事实标为计算值。

### 2.6 Optional Follow / Save

Step B **不渲染无效 Follow 按钮**。在 Phase 1D 完成可靠本地保存、查看、清除、导出和浏览器数据丢失提示后，才把 Follow 接入报告末尾与 My Research 导航。报告内部预留语义位置即可，不在生产页面展示占位操作。

## 3. 组件、路由与数据边界

| 现有文件/拟改位置 | Step B 最小动作 |
| --- | --- |
| `apps/dsa-web/src/pages/CompanyResearchPage.tsx` | 保留请求/路由/年度季度状态，拆出页内 `CompanyIdentity`、`FinancialOverview`、`FinancialTrends`、`CashFlowComparison`、`EvidenceDetails`。仅在分解能降低重复和状态混乱时拆成 `components/research/` 文件。 |
| `apps/dsa-web/src/components/layout/equitylens.css` | 新增公司页 scoped 样式与亮/暗 token；不全局改旧 DSA 工具页。 |
| `apps/dsa-web/src/components/layout/SidebarNav.tsx` | 保留既有 `Market Tools` 链接与 `aria-expanded` 按钮；进入/刷新工具路由时默认展开，当前工具项可见；工具子项按真实任务分组。侧栏折叠/手机 Drawer 保留。 |
| `apps/dsa-web/src/pages/ResearchHomePage.tsx` | 微调价值说明和精选区 CTA，新增**数据比较**深链接或锚点；继续沿用 NVDA 现有 API 与 10 分钟内存复用，不再发起额外首页请求。 |
| `apps/dsa-web/src/i18n/uiText.ts`、`equitylensText.ts` | 增加公司阅读、比较与质量状态的 EN/简中文案；保持旧报告本地化专项留到 Step C。 |
| `apps/dsa-web/src/api/secFinancials.ts`、`src/types/secFinancials.ts`、`api/v1/endpoints/financials.py`、`src/services/sec_financials.py` | **Step B 不改 API 合同和财务选择/计算逻辑。** 只消费已有 `SecFinancialResponse`：`periods`、`FinancialValue`、`FactSource`、`quality_issues`。 |
| `apps/dsa-web/src/App.tsx` | 保留 `/research` 和 `/research/:ticker`；若采用页面锚点/查询参数，定义在该路由内，不先建空报告路由。 |

状态来源只保留一份：`selectedPeriodType`、`selectedPeriodEnd`、`selectedMetric`。图表、概览、调查与证据由同一 `FinancialPeriod` 派生，避免用户看 FY2026 图却展开 FY2025 来源。仅从 API 的 `reported` / `derived` / `definition` / `sources` 判断事实类型；前端格式化不能改变值。当前 API 以 JS number 表示整数金额，Step B 不重算金额；Phase 1B 计算精度另设后端 Decimal 规则。

## 4. Step B 实施顺序

1. **保护基线。** 记录当前公司页与展开的 Market Tools 的桌面/手机截图；逐一核对 `/research`、`/research/NVDA`、`/tools/daily-analysis` 和九条工具路由；保持现有 SEC API 99 个 reported 值对照记录不变。
2. **导航小修。** 仅改 Market Tools 路由驱动的默认展开、分组和 active/focus/手机行为；不重造侧栏。先跑导航组件与路由浏览器用例。
3. **公司身份与财务概览。** 把来源、期间、取回时间与主要数值放在第一屏；保持 EN/ZH 与浅/暗主题。检查日期、单位、来源随值可见。
4. **图表、问题入口与证据。** 加收入/经营现金流比较视图和选中期间同步；重用现有来源展开。数据不足时展示缺项，绝不生成回答。
5. **首页衔接与验收。** 精选 NVDA 进入公司页相关视图；实际浏览器验证并留仓库外前后截图。更新 `PROGRESS`、`TEST_RESULTS`、`DECISIONS`、`CHANGELOG`；**停下供视觉审阅**。

## 5. 验收与测试矩阵

| 测试面 | 可检查标准 |
| --- | --- |
| 事实一致性 | Step B 不改变 SEC response；NVDA FY2026 关键值、FY/Q 与 source accession/URL 与 API 完全一致。无填造数字；缺失、冲突、修订显示已有状态。 |
| 浏览器任务 | 从首页 ticker 搜索或精选入口 → 公司页 → 期间/指标切换 → 收入/现金流比较 → 展开对应期间原始证据，均可用鼠标和键盘完成。返回/刷新与深链接可恢复合理上下文。 |
| 导航 | Market Tools 展开/收起、`aria-expanded`、Enter/Space、当前路由高亮、工具深链接刷新、桌面侧栏收窄、手机 Drawer 链接与关闭均通过；不展示未建路由。 |
| 响应式与状态 | 1440、1024、768、390px；EN/ZH、亮/暗；加载、空、缺字段、SEC 503/502/404、重试；无整页横向溢出，图表有文本等价。 |
| 回归 | `tsc -b`、`vite build`、受影响 Vitest、完整 Playwright fixture、相关 SEC pytest；改动文件 ESLint 通过。全仓现存 38 error/1 warning 单列，不能弱化规则。 |

浏览器夹具证明交互，真实 NVDA 核验须独立读取本机 API/SEC 来源；截图不能代替事实检查。所有新页面文案双语；旧报告标题/内容泄漏与 Emoji 属于 Step C，Step B 不宣称已经解决。

## 6. 回滚与决策

Step B 没有后端迁移；如视觉方案未通过审阅，可再迭代公司页布局、首页 CTA 和侧栏组态，原 `SecFinancialResponse`、SEC 缓存、旧工具 URL 继续有效。**已批准并实施的具体取舍：**“现有数据的收入/现金流比较”是 Step B 唯一研究问题入口；完整 Python 研究计算、AI 解释和 Follow 留到后续独立 Gate。
