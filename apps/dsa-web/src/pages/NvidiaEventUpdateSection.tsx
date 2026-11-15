import { ArrowUpRight, Download, FileText } from 'lucide-react';
import { useUiLanguage } from '../contexts/UiLanguageContext';

const eventRoot = `${import.meta.env.BASE_URL}research/nvidia-china-paradox/event-2026-11-14/`;
const sources = {
  board: 'https://nvidianews.nvidia.com/news/statement-from-nvidia-board-of-directors',
  filing: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000082/nvda-20261111.htm',
  commentary: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000073/q2fy27cfocommentary.htm',
  guidance: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000073/q2fy27pr.htm',
  bill: 'https://www.govinfo.gov/content/pkg/BILLS-119hr9442ih/html/BILLS-119hr9442ih.htm',
  senate: 'https://www.dailypress.senate.gov/monday-november-9-2026/',
  grid: 'https://www.energy.senate.gov/wp-content/uploads/2026/11/Data-Center-One-Pager.pdf',
};

const overlays = [
  { en: 'Data Center growth −5 pp each FY2028–FY2033', zh: 'FY2028–FY2033 数据中心增速每年降低 5 个百分点', value: '$130.20', delta: '−$27.44' },
  { en: 'WACC +100 bp through equity risk premium', zh: '股权风险溢价推高 WACC 100 基点', value: '$141.03', delta: '−$16.61' },
  { en: 'Gross margin −2 pp, FY2028–FY2036', zh: 'FY2028–FY2036 毛利率降低 2 个百分点', value: '$150.98', delta: '−$6.65' },
  { en: 'Treasury 10-year row 4.86% → 5.15%', zh: '美国 10 年期国债行值 4.86% → 5.15%', value: '$152.47', delta: '−$5.16' },
  { en: 'Receivable days +15, FY2028–FY2033', zh: 'FY2028–FY2033 应收天数增加 15 天', value: '$156.24', delta: '−$1.40' },
  { en: 'Hypothetical $10bn net guarantee payment in 2030', zh: '假设 2030 年净担保支付 100 亿美元', value: '$157.33', delta: '−$0.30' },
] as const;

function Citation({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight aria-hidden="true" /></a>;
}

export default function NvidiaEventUpdateSection() {
  const { language } = useUiLanguage();
  const zh = language === 'zh';

  return <section className="el-nvda-event" aria-labelledby="nvda-event-title">
    <div className="el-nvda-event-topline"><span>{zh ? '最新事件研究 · 独立更新' : 'Latest research · dated event update'}</span><time dateTime="2026-11-14">{zh ? '截至 2026-11-14 23:23 北京时间' : 'Evidence cutoff 14 Nov 2026, 23:23 Beijing'}</time></div>
    <h2 id="nvda-event-title">{zh ? '股价更接近旧估值，经营与治理的不确定性却扩大了' : 'A lower quote has narrowed the old valuation gap, while the operating range has widened'}</h2>
    <p className="el-nvda-event-lead">{zh ? '11 月 6 日至 13 日，Nasdaq 历史 Close/Last 从 $186.64 跌至 $162.85（−12.75%）；同期 SMH 上涨 4.91%。旧中央 DCF 仍为 11 月 6 日估值日的 $157.63／股，与市价差距由 15.5% 缩至 3.2%。价格变化使原模型的长期增长要求看似降低，但治理与执行变化也可能改写现金流，不能仅凭股价认定单一事件的影响。' : 'From 6 to 13 November, Nasdaq historical Close/Last fell from $186.64 to $162.85 (−12.75%) while SMH rose 4.91%. The unchanged Central DCF remains $157.63/share as of 6 November; its gap to the quote narrowed from 15.5% to 3.2%. The lower quote eases the old model’s growth hurdle, while governance and execution may also change future cash flows. Prices alone cannot identify one event as the cause.'}</p>
    <p className="el-nvda-event-source-line">{zh ? '五只证券的日期、字段和原始来源链接：' : 'Five-security dated fields and original-source links:'} <a href={`${eventRoot}EVENT_SOURCE_REGISTER_PUBLIC.csv`} target="_blank" rel="noreferrer">{zh ? '来源登记' : 'Source register'}<ArrowUpRight aria-hidden="true" /></a> · <a href={`${eventRoot}NASDAQ_DAILY_CLOSE_LAST_2026-11-06_TO_13.csv`} target="_blank" rel="noreferrer">{zh ? '行情表' : 'Price table'}<ArrowUpRight aria-hidden="true" /></a></p>

    <div className="el-nvda-event-columns">
      <div><span className="el-nvda-event-number">01</span><h3>{zh ? '治理与折现率' : 'Governance and discount rate'}</h3><p>{zh ? '董事会 8 日启动独立调查；11 日接受黄仁勋辞任，Kress 出任临时 CEO。调查尚无结论。投资者可能提高要求回报，但不能把任意风险溢价称为事件的实测影响。' : 'The board opened an independent inquiry on 8 November and accepted Huang’s resignation on 11 November; Kress became interim CEO. Findings remain pending. A higher required return is plausible, but an arbitrary premium is not a measured event effect.'} <Citation href={sources.board}>{zh ? '董事会声明' : 'Board'}</Citation> <Citation href={sources.filing}>8-K</Citation></p></div>
      <div><span className="el-nvda-event-number">02</span><h3>{zh ? '执行与长期现金流' : 'Execution and repeatable cash flow'}</h3><p>{zh ? '真正能重估长期价值的是产品路线、系统验收、客户采购与回款是否改变。创始人离任本身不等于当期已生产货物失去收入；若未来数年数据中心增长每年放缓，影响远大于单次小额支付。' : 'Roadmap delivery, accepted systems, customer procurement and collections determine whether the shock reaches long-run cash flow. A departure does not itself erase near-term shipments. Repeated Data Center growth shortfalls matter more in this model than one small net payment.'}</p></div>
      <div><span className="el-nvda-event-number">03</span><h3>{zh ? '信用与资本承诺' : 'Credit and capital commitments'}</h3><p>{zh ? '公司披露截至 7 月 26 日有 $279bn 供应及产能承诺；另有含 8 月签署安排的 $108.5bn 最高毛额担保敞口。应收账款 $63.1bn、DSO 从 45 天升至 60 天。三者性质不同，不能相加为债务或直接当作损失。' : 'The issuer disclosed $279bn of supply and capacity commitments as of 26 July, plus $108.5bn maximum gross guarantees including an August-signed arrangement. Receivables were $63.1bn and DSO rose from 45 to 60 days. These are distinct exposures, neither additive debt nor realized loss.'} <Citation href={sources.commentary}>{zh ? '公司 CFO 说明' : 'CFO commentary'}</Citation></p></div>
    </div>

    <p className="el-nvda-event-china">{zh ? '中国市场仍是有条件的增量期权。旧模型假设每年持续、真正净新增 $10bn 中国收入，估值敏感性约为 +$1.85／股，仅相当于 11 月 13 日 $162.85 报价的约 1.1%。这不是新订单；当前更大的估值变量仍是全球长期需求、交付与管理执行。' : 'China access remains a conditional incremental option. In the old model, a sustained $10bn a year of truly net-new China sales is worth about $1.85/share—roughly 1.1% of the 13 November $162.85 quote. This is an assumption, not a new order. Global demand duration, delivery and management execution remain the larger valuation variables.'}</p>

    <div className="el-nvda-event-table-wrap"><div className="el-nvda-event-table-heading"><h3>{zh ? '同一旧估值日的单因素检验' : 'One-factor tests at the frozen 6 November valuation date'}</h3><p>{zh ? '以 $157.63／股旧中央情景为起点，比较风险渠道的量级；六项不能相加解释股价。' : 'Starting from the old $157.63/share Central path, these probes compare the scale of risk channels. They cannot be added to explain the share move.'}</p></div><div className="el-nvda-matrix-scroll"><table><thead><tr><th>{zh ? '独立变动' : 'Isolated change'}</th><th>{zh ? '试算价值，美元／股' : 'Frozen DCF, USD/share'}</th><th>{zh ? '变化，美元／股' : 'Change, USD/share'}</th></tr></thead><tbody>{overlays.map((row) => <tr key={row.en}><th>{zh ? row.zh : row.en}</th><td>{row.value}</td><td>{row.delta}</td></tr>)}</tbody></table></div><p className="el-nvda-event-table-note">{zh ? '净担保支付是假设，不代表实际索赔、预期损失或最高担保上限；利率行值时点也未与 16:00 ET 收盘对齐。' : 'The net guarantee payment is hypothetical, not a claim, expected loss or the maximum gross cap. Treasury row timestamps were not aligned to the 4 p.m. ET equity close.'}</p></div>

    <div className="el-nvda-event-outlook"><div><h3>{zh ? '政策：两种提案，均未生效' : 'Policy: two proposals, neither in force'}</h3><p>{zh ? 'H.R. 9442 于 6 月 24 日、选举前提出并交付委员会；其建设暂停与出口管制条款只有在立法后才可能生效。11 月 9 日参院以 73–25 通过的是推进许可改革载体的程序动议，所述数据中心电网成本分摊也仍是提案。政策压力须落实到具体项目、供电、采购与 NVIDIA 收入确认的时间链。' : 'H.R. 9442 was introduced and referred to committees on 24 June, before the election. Its proposed construction moratorium and export controls would require enactment. On 9 November the Senate voted 73–25 for cloture on a motion to proceed to a permitting vehicle; its proposed data-center grid-cost allocation is not law. Any forecast effect needs a named project, power and procurement timeline through NVIDIA revenue recognition.'} <Citation href={sources.bill}>H.R. 9442</Citation> <Citation href={sources.senate}>{zh ? '参院程序' : 'Senate vote'}</Citation> <Citation href={sources.grid}>{zh ? '电网提案' : 'Grid proposal'}</Citation></p></div><div><h3>{zh ? '11 月 17 日：可证伪的下一次检验' : '17 November: the next falsifiable test'}</h3><p>{zh ? '将 FY2027 Q3 正式业绩与公司 $108bn ±2% 的事前收入指引对照；再检验 Q4 新指引与原模型 $105bn 的分析师估计、毛利率、应收回款和产品交付。该业绩在本更新截止日尚未披露。' : 'Compare FY2027 Q3 actuals with the pre-event issuer revenue guide of $108bn ±2%; then test the next Q4 guide against the old $105bn analyst estimate, margins, collections and delivery. Q3 results were not yet reported at this update’s cutoff.'} <Citation href={sources.guidance}>{zh ? '公司指引' : 'Issuer outlook'}</Citation></p></div></div>

    <div className="el-nvda-event-actions"><a className="el-nvda-event-primary" href={`${eventRoot}NVIDIA_Event_Update_2026-11-14.docx`} download><FileText aria-hidden="true" />{zh ? '下载 11 月 14 日英文事件研究 · DOCX' : 'Download the 14 November English event note · DOCX'}<Download aria-hidden="true" /></a><a href={`${eventRoot}EVENT_DCF_ONE_FACTOR_OVERLAYS.csv`} target="_blank" rel="noreferrer">{zh ? '查看单因素敏感性数据' : 'Inspect one-factor data'}<ArrowUpRight aria-hidden="true" /></a><a href="#original-study">{zh ? '阅读 11 月 7 日原研究快照' : 'Continue to the 7 November study'}<ArrowUpRight aria-hidden="true" /></a></div>
    <p className="el-nvda-event-disclaimer">{zh ? '数据口径与结论边界：Nasdaq 历史 Close/Last 尚未独立认证 NOCP、复权及常规时段成交价；旧模型敏感性是研究假设，并非新预测、订单或事件归因。本更新不发布 11 月 13 日新内在价值、12 个月目标价或正式评级；原模型的原生 Excel 重算及资本配置审定仍未完成。' : 'Data and conclusion limits: Nasdaq historical Close/Last is not independently certified as NOCP, adjusted or the exact regular-session print. Old-model sensitivities are research assumptions, not new forecasts, orders or event attribution. This update issues no 13 November intrinsic value, 12-month target or formal rating; native Excel recalculation and capital-allocation sign-off remain open.'}</p>
  </section>;
}
