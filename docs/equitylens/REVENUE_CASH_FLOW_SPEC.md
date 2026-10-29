# 旗舰研究流程规格：收入增长能否转化为现金流？

日期：2026-10-28。状态：**Phase 1B 候选规格；本轮仅规划，没有研究引擎、AI 报告或 Follow 生产功能。** Step B 只会提供基于现有 SEC 数据的比较入口，实施边界见 [Step B 计划](./PHASE_1A5_STEP_B_PLAN.md)。本规格不构成 Phase 1B 开发授权。

## 1. 用户旅程与报告

1. **Explore：** 用户在 `/` 输入 ticker（如 NVDA），或点击真实精选公司；无需账户、假设或 LLM Key。
2. **Discover：** 公司页在已取得至少一个有效收入与经营现金流期间时显示“收入增长能否转化为现金流？”作为研究路径；条件不满足时解释缺哪个字段/期间，不把缺失写成异常。
3. **Investigate：** 选择年度或独立季度。默认最近两个可比年度；若选择季度，只和上一财政年度**同季度**比。页面呈现收入、经营现金流、净利润的同期值及程序计算的增长/比率；用户可切换期间，但不能混合 YTD 与独立季度。
4. **Verify：** 点击报告中的任何重要数字或结论，定位对应 `FactSource`：概念、单位、起止、form、filed/accepted、accession、URL、retrieved_at；派生季度须展示全部输入来源和公式。移动端展开为页内证据，不遮住数字。
5. **Follow：** Phase 1D 才提供自愿保存、查看、清除、导出；未实现前没有可点击的假保存按钮。用户即使直接离开，也已完成财务调查。

报告顺序：**Research Question → Key Findings（仅有证据支持的观察）→ Financial Evidence（可比期间表与图）→ Calculations → Interpretation（可选 AI）→ Alternative Explanations → Needs Review / Insufficient Evidence → Sources & Method → 可选 Follow**。桌面在主文旁可有紧凑证据目录；手机单列并让关键来源就近展开。所有标题、状态、数字标签和方法说明提供 EN/简中；原 SEC 概念/原文不翻译。

## 2. 六类研究状态，不能混标

| 状态 | 何时使用 | 用户可核查内容 |
| --- | --- | --- |
| **Source Confirmed** | API `reported` 事实且可对应 SEC 原始记录 | 原数、单位、期间、form、accession、文件链接。 |
| **Calculation Verified** | Python 按确定公式用合格输入计算，或已有 API `derived` 季度差额 | 精确输入、公式、口径、结果、所有输入来源。 |
| **Interpretation** | AI 或明确署名的分析文字解释已验证数字 | 关联事实 ID，生成时间、模型/人工来源与限制；不自动升格为“事实”。 |
| **Alternative Explanations** | 对同一观察的其他合理机制 | 明示是待检验假设，指出需要何种新证据。 |
| **Needs Review** | 事实冲突、期间/口径不匹配、来源过期或解释超出证据 | 冲突/疑点和下一步核查动作；禁止给确定结论。 |
| **Insufficient Evidence** | 必需事实或可比期间不存在 | 缺哪些字段/期间，仍可查看现有已核验事实。 |

“收入增长与现金流同步”只描述相关变化；**不宣称收入增长导致现金流变化**，更不推导买卖建议。收款时点、营运资本、税费、非现金项目、客户预付款、一次性交易等是**候选解释**；没有解析相应附注或 MD&A 就必须标为尚未检验。

## 3. 输入、期间和确定性计算

复用 `GET /api/v1/financials/company/{ticker}` 的 `SecFinancialResponse`。`FinancialPeriod.values` 当前已有 `revenue`、`net_income`、`operating_cash_flow`、`capital_expenditure`；`metrics` 已有 `revenue_growth`、`operating_cash_flow_margin`、`net_profit_margin`。每项 `FinancialValue` 带 `kind`、`definition`、`sources`。Step 1B 新计算只在 Python 服务端加，不把前端浮点格式化当作财务算法。

| 指标 | 定义和准入 |
| --- | --- |
| 收入同比 | `(本期收入 − 上年可比期收入) / 上年可比期收入 × 100`。先复用现有 `revenue_growth`；基期收入必须大于 0、概念/单位/期间口径可比。 |
| 经营现金流同比 | `(本期 OCF − 上年可比期 OCF) / 上年可比期 OCF × 100`。两期均有效且基期 OCF **大于 0** 才显示百分比；基期 0/负数时只显示绝对变化并标记百分比不可解释。 |
| 经营现金流率 | `OCF / 本期收入 × 100`。复用已有指标；收入需大于 0，负 OCF 可如实显示负比率。 |
| 净利润及变化 | 两期均有来源时显示；同比百分比仅基期净利润大于 0 时计算。作为交叉观察，不单独判定盈利质量。 |
| 自由现金流 | **默认不输出无修饰的 FCF。** 仅当纯 PP&E 购置概念、同口径/同期间/同单位与 OCF 都可证明时，展示 `OCF − PP&E 购置` 并附具体定义。若来源概念为 `PaymentsToAcquireProductiveAssets`，如 NVDA 当前部分期间，其范围含软件和其他无形资产；可单独显示“OCF 减生产性资产购置”及原始概念，但**不能标作纯 PP&E FCF**。概念跨期变化时不画同比。 |

年度使用同财政年连续 10-K 的可比全年期间；季度使用独立三个月 Q 与前一年同 Q。10-Q 的 YTD OCF 若须差分，沿用 `src/services/sec_financials.py` 的同概念/同单位/同财政年起点规则，并保留两个输入 accession；Q4 差额明确为 `derived`。修订申报沿用既有确定性选择规则，不能盲取最大或最新 XBRL 数。任一关键输入缺失/冲突/币种不同/期间起点不一致，则该计算为 null + 原因，不补零、不估算。计算用 Python `Decimal` 或整数运算保留精度，UI 才做显示舍入；若现有 schema 的 JSON number 精度不足以覆盖新增公司大额/高精度值，再单独评估兼容的数值表示，不悄改合同。

最小调查需要**当前收入 + 当前 OCF + 可比基期收入 + 可比基期 OCF**。若只缺基期，可继续展示当前事实/现金流率，但同比结论为 Insufficient Evidence；Net income 和资本购置为可选增强，不阻塞主体路径。选择最新期间时必须回传“为何这两期可比”的机器可读方法说明。

## 4. Phase 1B 最小 API 与组件草案

**不在 Step B 增加以下 API。** Phase 1B 建议新增只读 `GET /api/v1/research/company/{ticker}/revenue-cash-flow?basis=annual|quarterly`，由服务端获取现有 SEC 归一化结果并生成确定性报告。响应不复制整份 CompanyFacts，引用既有 `FactSource` 结构：

```text
question_id: revenue-cash-flow-v1
company: ticker, cik, company_name
basis: annual | quarterly
period_pair: current + prior (fiscal labels, start/end, forms, accessions)
facts: [{id, field, period, FinancialValue|null, quality_status}]
calculations: [{id, formula_id, input_fact_ids, value|null, unit, status, reason}]
observations: [{id, template_id, calculation_ids, status}]
quality_issues: [stable code]
retrieved_at, calculated_at, method_version
interpretation: {status: not_requested|not_configured|generated|cached|rejected|failed, ...}
```

服务器生成稳定 fact/calculation ID；所有展示数值可由响应内输入与来源重算。不要让客户端 POST 自称已核验的数字或任意 SEC URL。AI 可选动作建议单独 `POST /api/v1/research/company/{ticker}/revenue-cash-flow/interpretation`，请求仅含 `basis`、`locale`（后端重新读取/校验当前财务事实），避免改变 GET 的无 Key 可用性。路由设计在实施前须检查现有认证/错误契约及 URL 冲突，旧 `/api/v1/financials` 原样保留。

后端候选文件：`src/services/revenue_cashflow_research.py`（选择与 Decimal 计算）、`api/v1/schemas/research_questions.py`、`api/v1/endpoints/research_questions.py`、`api/v1/router.py`。前端候选：`apps/dsa-web/src/api/researchQuestions.ts`、`src/types/researchQuestions.ts`、`src/components/research/RevenueCashFlowReport.tsx`，接入现有 `CompanyResearchPage.tsx`。复用现有 Axios client、React Router、主题、语言与 Recharts；不新增 agent 框架。

## 5. AI 的明确职责、验证与失败路径

AI 只解释服务端构建的**结构化、已验证事实包**：可能机制、替代解释、待查证问题与简洁叙述。系统输入含事实 ID、数值、单位、期间、来源 ID、计算公式和质量状态，不包含用户私密研究笔记、SEC 联系邮箱或其他密钥。优先复用仓库已有 LiteLLM 依赖和 `src/llm/` 的配置/用量工具，做一个专用的、可关闭的解释适配层；不调用 `src/agent/executor.py` 做多 Agent 自主研究。

要求模型返回受 Pydantic 验证的结构化字段：`interpretations[]`、`alternative_explanations[]`、`needs_review[]`；每条标明可引用的 fact/calculation ID 与状态。服务端验证引用 ID 存在、数字与确定性事实一致、不得新增“已核实来源”；对无法自动判定的因果语句设置人工评估样本和保守模板。验证失败则拒绝 AI 文本并保留完整确定性报告；不能简单把任意模型输出渲染为“Verified”。用户能看见 AI 生成/缓存时间和解释状态。

**没有 LLM Key：** GET 仍返回事实、计算、来源和数据不足原因；解释区显示“AI 解释未配置，可继续核查数据”。**超时/配额/供应商失败：** 请求返回明确状态，已有确定性报告不消失；可展示注明日期与事实版本的有效旧解释缓存，版本不匹配则不复用。**有 Key：** 只在用户明确点击解释时调用，不在页面访问、搜索或图表切换时自动调用。

缓存键至少包含 CIK、question_id、basis、两期 accession、事实版本/hash、方法版本；AI 缓存另含 locale、模型 ID、prompt 版本。若 SEC 数据更新或修订使事实版本改变，旧解释不被当作新报告。服务端密钥永不返回浏览器。公开 API 在独立安全 Gate 前禁用实时 AI；须有认证或防滥用、每 IP/会话请求限制、单次 token 上限、服务端月支出硬阈值、供应商账单上限和用量可核查记录。**预算目标 $0、规划上限 $5/月；若硬限额无法证明，公开站只提供静态核验报告与本地受控演示。**

## 6. 可执行验收与评估

- **财务夹具：** 年度/同季度；Q1 与 YTD Q2/Q3、Q4 差分；修订与相同上下文冲突；缺值、零/负基期、概念和单位变化、跨财政年及不匹配开始日；productive-assets 与纯 PP&E 口径分离；公式输入与来源逐项可追踪。
- **API：** schema 类型、稳定状态码、无 Key GET 成功、AI POST 未配置/超时/超额/非法引用、同一事实 hash 命中缓存、修订后失效；服务端无密钥/邮箱泄露。旧财务和旧分析 API 回归。
- **Web：** 从首页 NVDA 到报告与证据的鼠标/键盘路径；EN/简中、浅/暗、1440/1024/768/390；加载/空/错误/无 AI、长数字、焦点回归、reduced-motion、无整页横向溢出。源文件链接指向 SEC，独立读取 API 对照 UI。
- **真实对照：** 以用户批准的小样本真实 10-K/10-Q 核对每条页面事实元组及计算，记录“正确/总数”和不适用项；离线夹具不冒充在线核验。AI 解释至少一次真实受控模型调用才能报告“AI 流程已验证”，且需人工核对引用、数字、因果措辞和替代解释。未配置 Key 时仅报告确定性流程已验证。
- **质量门槛：** 不发布未经测量的准确率/“AI 置信度”；发现无效来源、捏造数值或错误期间则阻止该案例作为公开已核验示例。测试命令与精确结果写入 `TEST_RESULTS.md`。

本规格不包含自动买卖建议、价格预测、自由聊天研究、付费行情、全天候监控或自动通知。SEC 原始证据和既有 `src/services/sec_financials.py` 选择规则在 Phase 1B 开发前仍为权威。
