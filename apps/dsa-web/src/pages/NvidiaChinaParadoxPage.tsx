import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useUiLanguage } from '../contexts/UiLanguageContext';
import './NvidiaChinaParadoxPage.css';

const root = `${import.meta.env.BASE_URL}research/nvidia-china-paradox/`;
const assets = {
  reportPdf: `${root}NVIDIA_Equity_Research_Report.pdf`,
  reportDocx: `${root}NVIDIA_Equity_Research_Report.docx`,
  pitchPdf: `${root}NVIDIA_One_Page_Stock_Pitch.pdf`,
  pitchDocx: `${root}NVIDIA_One_Page_Stock_Pitch.docx`,
  model: `${root}NVIDIA_Three_Path_Review_Model.xlsx`,
  sources: `${root}Source_and_Evidence_Register.csv`,
  qa: `${root}Model_QA_and_Limitations.md`,
  waccGrid: `${root}WACC_Terminal_Growth_Sensitivity.csv`,
  waccQa: `${root}WACC_Terminal_Growth_QA.json`,
  chineseSummary: `${root}Chinese_Research_Summary.md`,
  package: `${root}NVIDIA_China_Paradox_Research_Package.zip`,
  readme: `${root}README.md`,
  cv: `${root}Yuqi_Qiu_Equity_Research_Resume.pdf`,
};
const src = {
  tenK: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm',
  tenQ: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000075/nvda-20260726.htm',
  earnings: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000073/q2fy27pr.htm',
  call: 'https://investor.nvidia.com/files/content_files/TRANSCRIPT_-NVIDIA-Corp-NVDA-US-Q2-2027-Earnings-Call-26-August-2026-5_00-PM-ET.pdf',
  bis: 'https://www.govinfo.gov/content/pkg/FR-2026-01-15/pdf/2026-00789.pdf',
  reuters: 'https://www.channelnewsasia.com/east-asia/nvidia-chips-pile-hong-kong-china-withhold-import-approval-6527371',
  texas: 'https://gov.texas.gov/news/post/governor-abbott-directs-tceq-to-halt-data-center-permits',
  pa: 'https://www.pa.gov/content/dam/copapwp-pagov/en/governor/documents/eo2026_05_protecting%20pennsylvania%20consumers%20from%20data%20center%20impacts_final_executed.pdf',
  optical: 'https://static.cninfo.com.cn/finalpage/2026-03-31/1225056459.PDF',
  nasdaq: 'https://api.nasdaq.com/api/quote/NVDA/historical?assetclass=stocks&limit=10&fromdate=2026-11-06&todate=2026-11-07',
  schedule: 'https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Sets-Conference-Call-for-Third-Quarter-Financial-Results/default.aspx',
  treasury: 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/textview?type=daily_treasury_yield_curve&field_tdr_date_value=2026',
};

// USD billions; the three paths are analyst working calculations, not approved targets.
const revenue = [
  { fy: 'FY2027', stress: 390.837, moderate: 390.837, duration: 390.837 },
  { fy: 'FY2028', stress: 465.426, moderate: 605.797, duration: 605.797 },
  { fy: 'FY2029', stress: 519.345, moderate: 726.957, duration: 817.826 },
  { fy: 'FY2030', stress: 559.869, moderate: 821.461, duration: 1022.283 },
  { fy: 'FY2031', stress: 587.504, moderate: 895.393, duration: 1206.294 },
  { fy: 'FY2032', stress: 605.129, moderate: 949.116, duration: 1351.049 },
  { fy: 'FY2033', stress: 617.231, moderate: 987.081, duration: 1459.133 },
  { fy: 'FY2034', stress: 629.576, moderate: 1016.693, duration: 1532.090 },
  { fy: 'FY2035', stress: 642.167, moderate: 1042.110, duration: 1608.694 },
  { fy: 'FY2036', stress: 655.011, moderate: 1062.953, duration: 1689.129 },
];

const timing = {
  delay: { delta: -0.00844, en: 'A one-year delay keeps the hypothetical cash flow but discounts it for another year.', zh: '延迟一年：同一笔假设现金流晚一年实现，折现价值下降。' },
  relocate: { delta: 0, en: 'Relocation preserves the original delivery date in this simple test.', zh: '迁址：若交付日期不变，本例估值不变。' },
  cancel: { delta: -0.09143, en: 'Cancellation removes that one hypothetical year of cash flow.', zh: '取消：损失这一年假设现金流。' },
} as const;
type TimingKey = keyof typeof timing;

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight aria-hidden="true" /></a>;
}

export default function NvidiaChinaParadoxPage() {
  const { language } = useUiLanguage();
  const zh = language === 'zh';
  const [chinaBn, setChinaBn] = useState(10);
  const [timingKey, setTimingKey] = useState<TimingKey>('delay');
  const chinaValue = chinaBn * 1.8529198845964039 / 10;
  useEffect(() => { document.title = `${zh ? '英伟达中国悖论' : 'The NVIDIA China Paradox'} · EquityLens`; }, [zh]);

  return <main className="el-showcase el-nvda-research">
    <Link to="/" className="el-showcase-back"><ArrowLeft aria-hidden="true" />{zh ? '返回研究首页' : 'Research home'}</Link>
    <header className="el-showcase-hero">
      <p className="el-eyebrow">{zh ? '英伟达中国悖论 · 独立股票研究' : 'The NVIDIA China Paradox · Independent research'}</p>
      <h1>{zh ? '英伟达：中国是期权，估值取决于增长持续期。' : 'NVIDIA: China is the option; duration is the valuation.'}</h1>
      <p className="el-showcase-deck">{zh ? '美国许可与中国进口批准决定市场重开的上限；估值真正依赖 FY2028 之后系统销售、利润率和回款能持续多久。' : 'US licensing and Chinese import approval govern the reopening option. Valuation turns on how long system sales, margins and collections endure after FY2028.'}</p>
      <p className="el-nvda-scope">{zh ? '信息截止 2026-11-07 北京时间 · 估值参考 2026-11-06 Nasdaq Close/Last $186.64 · 仅估值 NVIDIA · 下列 DCF 为未审定研究情景，并非正式目标价或评级' : 'Cutoff 2026-11-07 Beijing · 2026-11-06 Nasdaq Close/Last $186.64 · NVIDIA only · DCF paths are unsigned research scenarios, not issued targets or ratings'}</p>
      <div className="el-nvda-hero-links"><Link className="el-nvda-summary-teaser" to="/research/nvidia-china-paradox/zh-summary" aria-label={zh ? '阅读独立中文摘要' : 'Read the Chinese executive summary'}><span><strong>{zh ? '中文研究摘要' : 'Chinese research summary'}</strong><small>{zh ? '独立判断、关键反证与下次财报检验' : 'The judgment, counterevidence and next earnings test'}</small></span><ArrowUpRight aria-hidden="true" /></Link><a className="el-nvda-report-link" href={assets.reportPdf} download>{zh ? '下载完整英文报告 · PDF' : 'Download full English report · PDF'}<ArrowUpRight aria-hidden="true" /></a></div>
      <div className="el-showcase-status"><strong>{zh ? '条件性审慎判断' : 'Conditional cautious stance'}</strong><span>{zh ? 'Central 当前 DCF $157.63，比 $186.64 参考价低约 15.5%；主要反证是客户供电、验收与回款若持续超预期。' : 'Central current DCF $157.63 is ~15.5% below the $186.64 reference; sustained powered delivery and collections would challenge this cautious view.'}</span></div>
      <div className="el-nvda-first-screen">
        <div className="el-nvda-path-panel">
          <div className="el-nvda-panel-heading"><span>01 / {zh ? '最重要的估值变量' : 'The valuation variable'}</span><h2>{zh ? '增长能持续到哪一年？' : 'How long does growth last?'}</h2></div>
          <div className="el-showcase-chart" role="img" aria-label={zh ? '三种未获批准的 NVIDIA 收入路径，FY2027 至 FY2036，十亿美元' : 'Three unapproved NVIDIA revenue paths, FY2027 to FY2036, USD billions'}>
            <ResponsiveContainer width="100%" height={278}><LineChart data={revenue} margin={{ top: 10, right: 22, bottom: 6, left: 5 }}>
              <CartesianGrid stroke="var(--el-line)" strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="fy" interval={1} tickLine={false} axisLine={false} tick={{ fill: 'var(--el-muted)', fontSize: 10 }} />
              <YAxis domain={[0, 1800]} tickLine={false} axisLine={false} width={48} tick={{ fill: 'var(--el-muted)', fontSize: 10 }} tickFormatter={(v) => `${v}`} />
              <Tooltip formatter={(v, name) => [`$${Number(v).toFixed(1)}bn`, name === 'stress' ? (zh ? '保守' : 'Conservative') : name === 'moderate' ? (zh ? '中心' : 'Central') : (zh ? '长期高增长' : 'Long duration')]} />
              <Line dataKey="stress" type="monotone" stroke="#8b9aa9" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line dataKey="moderate" type="monotone" stroke="var(--el-action)" strokeWidth={3} dot={false} isAnimationActive={false} />
              <Line dataKey="duration" type="monotone" stroke="var(--el-navy)" strokeWidth={2} dot={false} strokeDasharray="5 4" isAnimationActive={false} />
              <ReferenceDot x="FY2028" y={664.423} r={5} fill="#bd8738" stroke="white" strokeWidth={2} />
              <ReferenceDot x="FY2036" y={1343.321} r={5} fill="#bd8738" stroke="white" strokeWidth={2} />
            </LineChart></ResponsiveContainer>
          </div>
          <div className="el-nvda-legend"><span><i className="stress" />{zh ? '保守' : 'Conservative'}</span><span><i className="moderate" />{zh ? '中心' : 'Central'}</span><span><i className="duration" />{zh ? '长期高增长' : 'Long duration'}</span><span><i className="evidence" />{zh ? '公司初步展望／市场反推' : 'Issuer outlook / market hurdle'}</span></div>
          <p className="el-nvda-endpoints">FY2028 {zh ? '公司初步展望' : 'preliminary issuer outlook'} <b>$664bn</b> · FY2036 {zh ? '市场条件反推' : 'conditional market hurdle'} <b>$1.343tn</b><br />FY2036 {zh ? '保守' : 'Conservative'} <b>$655bn</b> · {zh ? '中心' : 'Central'} <b>$1.063tn</b> · {zh ? '长期高增长' : 'Long duration'} <b>$1.689tn</b></p>
          <p className="el-showcase-citation">{zh ? 'FY2027 起点为已披露 H1、Q3 公司指引及 Q4 研究估计；之后均为分析师假设。' : 'FY2027 starts with filed H1, company Q3 guidance and an analyst Q4 estimate; later points are analyst assumptions.'} <SourceLink href={src.earnings}>{zh ? '公司 Q3 指引' : 'Company Q3 outlook'}</SourceLink> <SourceLink href={src.call}>{zh ? 'FY2028 初步展望' : 'Preliminary FY2028 outlook'}</SourceLink></p>
        </div>
        <aside className="el-nvda-reverse-panel">
          <span className="el-eyebrow">02 / {zh ? '市场要求' : 'Market hurdle'}</span>
          <h2>{zh ? '单靠 FY2028 不够' : 'One strong year is not enough'}</h2>
          <strong className="el-nvda-hero-number">$1.343<span>tn</span></strong>
          <p>{zh ? '在先采用管理层 FY2028 约 70% 收入增长和 72.5% 毛利率、后续保留保守利润与再投资假设的条件下，186.64 美元参考价反推 FY2036 收入约 1.343 万亿美元。相当于 FY2028 条件收入 6,644 亿美元的约两倍。' : 'At the $186.64 market reference, first allowing management’s preliminary ~70% FY2028 growth and 72.5% gross margin but retaining conservative later economics, reverse DCF requires about $1.343tn of FY2036 revenue—roughly twice the conditional $664bn in FY2028.'}</p>
          <div className="el-nvda-reverse-metric"><strong>+4.6 pp</strong><span>{zh ? 'FY2029–FY2036 每年需额外增加的收入增速；只在该固定后续利润路径下成立' : 'Additional annual FY2029–FY2036 growth under that fixed later margin and reinvestment path'}</span></div>
          <small>{zh ? '这是反向求解，不是公司指引或市场一致预期。' : 'A conditional reverse solve, not issuer guidance or market consensus.'} <SourceLink href={src.nasdaq}>Nasdaq Close/Last</SourceLink></small>
        </aside>
      </div>
      <div className="el-nvda-gw-equivalent">
        <div><strong>{zh ? '规模标尺：每 GW ≠ 每年收入' : 'A scale ruler, not annual GW demand'}</strong><span>{zh ? '将公司总收入机械除以管理层每 GW 约 $40bn 的一代 Vera Rubin 内容机会，只得到名义 IT 负荷等值。' : 'Total company sales divided by management’s ~$40bn per-GW, per-generation Vera Rubin content opportunity gives only a notional IT-load equivalent.'}</span></div>
        <div className="el-nvda-matrix-scroll"><table><thead><tr><th>{zh ? '条件收入' : 'Conditional sales'}</th><th>{zh ? '收入，十亿美元' : 'USD bn'}</th><th>{zh ? '名义 GW 等值' : 'Notional GW equivalent'}</th><th>{zh ? '相当于 PORTS 4.25 GW' : 'PORTS 4.25 GW multiples'}</th></tr></thead><tbody>
          <tr><th>FY2028 {zh ? '公司初步展望' : 'issuer outlook'}</th><td>$664</td><td>16.6</td><td>3.9×</td></tr>
          <tr><th>FY2033 {zh ? '中心路径' : 'Central path'}</th><td>$987</td><td>24.7</td><td>5.8×</td></tr>
          <tr><th>FY2036 {zh ? '市场反推门槛' : 'market hurdle'}</th><td>$1,343</td><td>33.6</td><td>7.9×</td></tr>
        </tbody></table></div>
        <small>{zh ? '跨财年的公司总收入与一代设备内容不是同一时间口径；这些数字不是每年新建园区、订单或确认的 PORTS 收入。产品组合、替换周期、供电利用率和交付时点会改变换算。' : 'Multi-year company revenue and one generation of equipment content have different time bases. These figures are not annual new campuses, orders or recognized PORTS sales. Product mix, refresh, powered utilization and delivery timing change the conversion.'} <SourceLink href={src.call}>{zh ? '管理层每 GW 表述' : 'Management per-GW statement'}</SourceLink> <SourceLink href={src.tenQ}>PORTS 4.25 GW</SourceLink></small>
      </div>
    </header>

    <section className="el-showcase-section" aria-labelledby="nvda-path-judgment">
      <div className="el-showcase-section-head"><p className="el-eyebrow">03 / {zh ? '研究判断' : 'Research judgment'}</p><h2 id="nvda-path-judgment">{zh ? '温和增长也不能自动证明股价' : 'Even moderated growth needs proof'}</h2></div>
      <div className="el-nvda-takeaways"><h3>{zh ? '核心判断' : 'Key takeaways'}</h3><ol><li>{zh ? '中国准入增加期权价值，但市场价主要依赖长期收入与利润持续期。' : 'China access adds option value; the quote mainly rests on revenue and margin duration.'}</li><li>{zh ? 'FY2028 增长的上游信号是供给与客户预算，最终证据是验收、回款和现金转化。' : 'Capacity and budgets are leading signals; accepted delivery, collections and cash conversion are the proof.'}</li><li>{zh ? '中心路径并非“低增长”：至 FY2033 仍需近 1 万亿美元收入；折现率和后续衰减同样重要。' : 'The Central path still approaches $1tn of FY2033 revenue; discount rate and later fade matter as much as FY2028.'}</li></ol></div>
      <p className="el-showcase-analysis">{zh ? '管理层在 2026-08-26 预计 FY2028 收入同比增长约 70%，但表示供给仍受约束。中心路径先把该增速下调至 55%，再于 FY2029–FY2033 降至 20%／13%／9%／6%／4%。它需要 FY2033 约 9,871 亿美元收入、约 49% 营业利润率和持续回款。客户预算只有经过供电、设备采购、交付验收和付款，才支持这一路径。' : 'On 2026-08-26 management preliminarily expected ~70% FY2028 revenue growth while describing supply constraints. Our Central path cuts FY2028 to 55%, then fades to 20%/13%/9%/6%/4% through FY2033. It still needs about $987bn of FY2033 revenue, a roughly 49% operating margin and reliable collections. Customer budgets support that path only after power, procurement, accepted delivery and payment.'}</p>
      <div className="el-nvda-value-row">
        <div><span>{zh ? '保守 · 当前 DCF' : 'Conservative · current DCF'}</span><strong>$103.42</strong></div>
        <div><span>{zh ? '中心 · 当前 DCF' : 'Central · current DCF'}</span><strong>$157.63</strong></div>
        <div><span>{zh ? '长期高增长 · 当前 DCF' : 'Long duration · current DCF'}</span><strong>$215.87</strong></div>
        <div><span>{zh ? '市场参考价' : 'Market reference'}</span><strong>$186.64</strong></div>
      </div>
      <div className="el-nvda-matrix"><h3>{zh ? 'FY2028 增长 × 后续增长持续期' : 'FY2028 growth × later duration'}</h3><p>{zh ? '同一 2026-11-06 估值日、约 10.2% WACC、FY2028 72% 毛利率下的当前 DCF 敏感性，美元／股。列为 FY2028 总收入增长，行为 FY2029–FY2036 的增长及利润率路径。' : 'Current DCF sensitivity, USD/share, at the same 2026-11-06 valuation date, ~10.2% WACC and 72% FY2028 gross margin. Columns change FY2028 total revenue growth; rows change FY2029–FY2036 growth and margin paths.'}</p><div className="el-nvda-matrix-scroll"><table><thead><tr><th>{zh ? '后续路径' : 'Later path'}</th><th>FY2028 +40%</th><th>FY2028 +55%</th><th>FY2028 +70%</th></tr></thead><tbody><tr><th>{zh ? '保守' : 'Conservative'}</th><td>$120.80</td><td>$133.05</td><td>$145.31</td></tr><tr><th>{zh ? '中心' : 'Central'}</th><td>$142.87</td><td className="highlight">$157.63</td><td>$172.39</td></tr><tr><th>{zh ? '长期高增长' : 'Long duration'}</th><td>$195.15</td><td>$215.87</td><td>$236.58</td></tr></tbody></table></div><small>{zh ? '与上方保守主情景 $103.42 不同，本表保守行采用 FY2028 至少 40% 增速与统一 72% 毛利率，用于隔离两个敏感性轴。' : 'Unlike the $103.42 Conservative headline case, every matrix cell assumes at least 40% FY2028 growth and a common 72% gross margin to isolate the two axes.'}</small></div>
      <p className="el-nvda-weight-insight">{zh ? '价格等值代数：若只在 $157.63 中心与 $215.87 长期高增长路径间线性插值，$186.64 需要长期高增长路径占 49.8%；若另给 $103.42 保守路径 10%／20% 的示例权重，该比例升至 59.1%／68.4%。这些是说明股价要求的算术权重，不是情景发生概率。' : 'Price-equivalent algebra: a linear blend of $157.63 Central and $215.87 Long duration reaches $186.64 only with 49.8% weight on Long duration. Assigning an illustrative 10% / 20% weight to the $103.42 Conservative case raises that required weight to 59.1% / 68.4%. These are arithmetic weights explaining the quote, not scenario probabilities.'}</p>
      <div className="el-nvda-assumptions"><h3>{zh ? '中心路径：最少但决定性的输入' : 'Central path: the inputs that drive the result'}</h3><div className="el-nvda-matrix-scroll"><table><thead><tr><th>{zh ? '期间／项目' : 'Period / item'}</th><th>{zh ? '中心输入' : 'Central input'}</th><th>{zh ? '证据类别与约束' : 'Class and boundary'}</th></tr></thead><tbody>
        <tr><th>FY2027 Q4</th><td>$105bn {zh ? '收入' : 'revenue'}</td><td>{zh ? '分析师估计；截至截止日没有 Q4 正式指引' : 'Analyst estimate; no formal Q4 guidance by cutoff'}</td></tr>
        <tr><th>FY2028</th><td>+55% {zh ? '收入；72% 毛利率' : 'sales; 72% GM'}</td><td>{zh ? '分析师估计；管理层初步展望为约 +70%、72–73% 毛利率' : 'Analyst estimate; management preliminary outlook was ~+70% and 72–73% GM'}</td></tr>
        <tr><th>FY2029–FY2033</th><td>+20 / 13 / 9 / 6 / 4%</td><td>{zh ? '分析师总收入增速衰减；非公司指引' : 'Analyst total-sales fade; not issuer guidance'}</td></tr>
        <tr><th>FY2033</th><td>~49% {zh ? '营业利润率' : 'EBIT margin'}</td><td>{zh ? '分析师利润率路径；需由价格与成本数据验证' : 'Analyst margin path; needs pricing and cost evidence'}</td></tr>
        <tr><th>WACC</th><td>~10.2%</td><td>{zh ? '美国 10 年国债 4.86% 行值；ERP 4.5%、β 1.2、债务成本 5.5%、权益权重 99% 和 18% 税盾为研究输入' : '4.86% US 10-year row; ERP 4.5%, beta 1.2, debt cost 5.5%, 99% equity weight and 18% tax shield are research inputs'}</td></tr>
        <tr><th>{zh ? '终值' : 'Terminal'}</th><td>g 2%; ROIC 25%</td><td>{zh ? '分析师假设；长期再投资按 g／ROIC 计' : 'Analyst assumptions; reinvestment equals g / ROIC'}</td></tr>
        <tr><th>{zh ? '估值日股数／净资产' : 'As-of shares / net assets'}</th><td>24.256bn / ~$71.6bn</td><td>{zh ? '2026-11-06 摊薄股数和非股权净资产滚动估计，非财报实际' : 'Estimated 2026-11-06 diluted shares and ex-equity net assets; not filed actuals'}</td></tr>
      </tbody></table></div><small>{zh ? 'FY2028 管理层表述见电话会；国债 4.86% 为 11 月 6 日公布行值，其同日公开时间仍待核。其余点值未经研究负责人批准。' : 'Issuer FY2028 language is in the call transcript. The Treasury 4.86% row is dated 6 Nov; same-day public-release timing remains unresolved. Other point inputs are unsigned.'} <SourceLink href={src.call}>{zh ? '管理层电话会' : 'Management call'}</SourceLink> <SourceLink href={src.treasury}>US Treasury</SourceLink></small></div>
      <div className="el-nvda-wacc-grid"><h3>{zh ? 'WACC × 终值增长：美元／股' : 'WACC × terminal growth: USD/share'}</h3><div className="el-nvda-matrix-scroll"><table><thead><tr><th>WACC</th><th>g 1.5%</th><th>g 2.0%</th><th>g 2.5%</th></tr></thead><tbody><tr><th>9.0%</th><td>$179.24</td><td>$183.82</td><td>$189.12</td></tr><tr><th>~10.2%</th><td>$154.83</td><td className="highlight">$157.63</td><td>$160.81</td></tr><tr><th>11.4%</th><td>$136.40</td><td>$138.16</td><td>$140.14</td></tr></tbody></table></div><p>{zh ? '中心格与模型 $157.63 完全对账，终值现值占企业价值 47.7%；所有格均满足 WACC＞g。在约 10.2% WACC 下，仅上调 g 不能填平与 $186.64 报价的差额。' : 'The center reproduces the model’s $157.63; terminal PV is 47.7% of operating EV, and WACC exceeds g in every cell. At ~10.2% WACC, a modest g increase does not close the gap to the $186.64 quote.'}</p><small>{zh ? '中心格精确输入 WACC 为 10.2025%。此表由独立公式按每期现金流、2034–36 年再投资 g／ROIC 过渡与终值逐格复算；LibreOffice 文件转换没有刷新隔离文件的公式缓存，原生 Excel 仍 OPEN。' : 'The center uses an exact 10.2025% WACC. Independent formulas recompute every dated FCFF, FY2034–36 reinvestment transition at g/ROIC and terminal value. LibreOffice file conversion retained stale caches for the isolated variants; native Excel remains OPEN.'} <a href={assets.waccGrid} download>CSV</a> · <a href={assets.waccQa} download>QA JSON</a></small></div>
      <p className="el-showcase-citation">{zh ? '三条路径共用约 10.2% 试算 WACC、11 月 6 日估计净资产与股数。终值占企业价值约 45%–51%；微软 Excel 原生重算与预测审定仍待完成。' : 'The three paths share a ~10.2% working WACC and estimated 2026-11-06 net assets and shares. Terminal value is about 45%–51% of EV. Native Microsoft Excel rebuild and forecast sign-off remain open.'} <a href={assets.model} download>{zh ? '含 3×3 敏感性的审阅模型' : 'Review model with 3×3 sensitivity'}</a></p>
    </section>

    <section className="el-showcase-section" aria-labelledby="nvda-gates">
      <div className="el-showcase-section-head"><p className="el-eyebrow">04 / {zh ? '中国准入' : 'China access'}</p><h2 id="nvda-gates">{zh ? '两道监管门之后，还要有需求与交付' : 'Two regulatory gates, then buyers and delivery'}</h2></div>
      <div className="el-nvda-gates">
        <article><b>1</b><h3>{zh ? '美国许可 · 已有个案' : 'US licence · specific cases'}</h3><p>{zh ? '1 月 15 日规则只改为个案审查。10-Q 说明美国已许可少量指定中国客户的 H200 出货；并非全面授权。' : 'The 15 January rule changed eligible applications to case-by-case review. The 10-Q says US licences covered small H200 shipments to specified China customers, not broad authorization.'}</p><SourceLink href={src.bis}>Federal Register</SourceLink> <SourceLink href={src.tenQ}>NVIDIA 10-Q</SourceLink></article>
        <article><b>2</b><h3>{zh ? '中国限制 · 法律口径待核' : 'PRC restrictions · legal scope open'}</h3><p>{zh ? '10-Q 说明中国方面的限制使公司未能售出全部已获美国许可的产品；截至截止日，未找到公开的 H200 全国全面进口禁令原文。审批、客户采购、融资与价格仍须逐项证实。' : 'The 10-Q says PRC restrictions prevented sale of all US-licensed product. No published blanket nationwide H200 import-ban text was identified by the cutoff. Actual administrative acceptance, buyer procurement, financing and price remain to be evidenced.'}</p><SourceLink href={src.tenQ}>{zh ? '10-Q：准入事实' : '10-Q: access facts'}</SourceLink></article>
        <article><b>3</b><h3>{zh ? '供给、验收、净新增收入' : 'Supply, acceptance, net-new sales'}</h3><p>{zh ? 'Q2 对华 H200 销售不足数据中心收入 1%；Q3 公司指引没有纳入中国数据中心计算收入。后续收入还需可交付系统、验收、回款，并扣除全球其他订单挤占。' : 'Q2 China H200 sales were under 1% of Data Center revenue; Q3 company outlook included no China Data Center compute sales. Later revenue requires deliverable systems, acceptance and collections, net of displaced global sales.'}</p><SourceLink href={src.tenQ}>NVIDIA 10-Q</SourceLink> <SourceLink href={src.earnings}>Q3 outlook</SourceLink></article>
      </div>
      <p className="el-showcase-citation">{zh ? '10-Q 还披露美国检查及 25% 进口关税，公司称无法向客户转嫁。因而客户支付价格与关税后贡献决定净增量；滑块采用的 50% 增量营业利润率是研究假设，并非 H200 已实现产品利润率。国产替代也可能限制长期客户份额，当前金额不可量化。' : 'The 10-Q also describes US inspection and a 25% import tariff that NVIDIA said it could not pass through. Buyer price and post-tariff contribution therefore govern incremental economics. The slider’s 50% incremental EBIT margin is an analyst assumption, not observed H200 product profitability; domestic alternatives may cap long-run share, without a quantified current loss.'} <SourceLink href={src.tenQ}>NVIDIA 10-Q</SourceLink></p>
      <p className="el-nvda-source-warning">{zh ? '媒体待核：路透社 2026-11-05 援引两名匿名知情人士，称约 60 万颗芯片在香港待发往内地。数量及审批状态没有官方库存或海关记录证实，不能作为 NVIDIA 已确认收入、可获得订单或中心预测输入。' : 'Unverified media report: Reuters on 2026-11-05 cited two anonymous sources for roughly 600,000 chips in Hong Kong awaiting mainland shipment. No official inventory or customs record confirms the count or approval status. This is not NVIDIA recognized revenue, obtainable orders or a Central forecast input.'} <SourceLink href={src.reuters}>{zh ? '路透社报道转载' : 'Reuters report via CNA'}</SourceLink></p>
      <div className="el-nvda-china-scale"><span>{zh ? '中国要填补保守后续路径下的条件性估值差额，需要多大规模？' : 'China scale needed to close the conservative-later-path gap'}</span><strong>$223bn<span> / year</span></strong><p>{zh ? '以 $145.41 的 FY2028 公司展望＋保守后续路径敏感性与 $186.64 报价计算，即便假设长期许可、50% 增量营业利润率、18% 税率、25% 终值 ROIC 和 2% 长期增长，线性倒推也需每年约 $223bn 净新增中国收入。中心路径 $157.63 的差额用同一粗略尺度约需 $157bn。两者都不是预测；$223bn 已超过 FY2026 全公司收入 $215.9bn，规模外推不可靠。' : 'The $145.41 joint FY2028 issuer-outlook / conservative-later-path test is $41.23 below the $186.64 quote. With durable permission, 50% incremental operating margin, 18% tax, 25% terminal ROIC and 2% long-run growth, a linear extrapolation needs ~$223bn of net-new China revenue each year. Applying the same crude scale to the $157.63 Central gap gives ~$157bn. Neither is a forecast. The $223bn exceeds FY2026 company revenue of $215.9bn, so extrapolation at that size is unreliable.'}</p></div>
      <label className="el-showcase-slider">{zh ? '假设每年净新增中国收入' : 'Hypothetical annual net-new China sales'} <strong>${chinaBn}bn</strong><input type="range" min="0" max="20" step="1" value={chinaBn} onChange={(e) => setChinaBn(Number(e.target.value))} /></label>
      <p className="el-nvda-slider-output"><strong>+${chinaValue.toFixed(2)} / {zh ? '股' : 'share'}</strong><span>{zh ? '25% 终值 ROIC 的永久增量敏感性。0–200 亿美元滑块仅做局部比例运算；要扣除被挤占的其他地区销售和基础情景已包含的中国销售。' : 'Perpetual incremental sensitivity at 25% terminal ROIC. The $0–20bn slider is local proportional arithmetic; subtract displaced sales elsewhere and China sales already in the global base.'}</span></p>
    </section>

    <section className="el-showcase-section" aria-labelledby="nvda-cash">
      <div className="el-showcase-section-head"><p className="el-eyebrow">05 / {zh ? '现金与信用' : 'Cash and credit'}</p><h2 id="nvda-cash">{zh ? '交付增长必须变成回款' : 'Delivery growth must become collections'}</h2></div>
      <div className="el-nvda-cash-strip"><div><span>H1 FY2027 {zh ? '净利润' : 'GAAP net income'}</span><strong>$118.010bn</strong><small>{zh ? '含 237.07 亿美元证券收益' : 'Includes $23.707bn equity-security gains'}</small></div><div><span>H1 FY2027 {zh ? '经营现金流' : 'Operating cash flow'}</span><strong>$74.421bn</strong><small>{zh ? '为公司非 GAAP 净利润的 74.8%' : '74.8% of company non-GAAP net income'}</small></div><div><span>{zh ? '应收账款增加' : 'Receivables increase'}</span><strong>$24.593bn</strong><small>{zh ? '截至 2026-07-26 上半年' : 'H1 to 2026-07-26'}</small></div></div>
      <p className="el-showcase-analysis">{zh ? '公司同期正式披露的非 GAAP 净利润为 995.02 亿美元，且从 FY2027 Q1 起的非 GAAP 指标不再剔除股权薪酬。营运资金增加与证券收益解释了净利润和经营现金流差异的一部分，后续仍须检验应收账款收现及库存周转。' : 'The company’s reported H1 non-GAAP net income was $99.502bn, and from FY2027 Q1 its non-GAAP measures no longer exclude share-based compensation. Working-capital growth and the securities gain help explain the NI-to-CFO gap; subsequent receivable collection and inventory turns remain the test.'} <SourceLink href={src.earnings}>{zh ? '公司非 GAAP 调节表' : 'Company non-GAAP reconciliation'}</SourceLink></p>
      <div className="el-nvda-exposure"><h3>{zh ? '规模比较，不等于损失' : 'Scale, not expected loss'}</h3><div className="el-nvda-matrix-scroll"><table><thead><tr><th>{zh ? '披露项目' : 'Disclosure'}</th><th>{zh ? '金额' : 'Amount'}</th><th>{zh ? '摊薄每股等值' : 'Diluted per-share scale'}</th><th>{zh ? '估计市值占比' : 'Share of estimated market cap'}</th></tr></thead><tbody><tr><th><SourceLink href={src.tenQ}>{zh ? '供应及产能承诺' : 'Supply and capacity commitments'}</SourceLink></th><td>$279bn</td><td>$11.50</td><td>6.2%</td></tr><tr><th><SourceLink href={src.tenQ}>{zh ? '担保最大毛额合计' : 'Maximum gross guarantees'}</SourceLink></th><td>$108.5bn</td><td>$4.47</td><td>2.4%</td></tr><tr><th><SourceLink href={src.tenQ}>{zh ? '其中：PORTS 担保' : 'Of which: PORTS guarantee'}</SourceLink></th><td>$105bn</td><td>$4.33</td><td>2.3%</td></tr></tbody></table></div><small>{zh ? '每股以估计 24.256bn 摊薄股数、市值占比以估计 24.071bn 基本股数 × Nasdaq 2026-11-06 Close/Last $186.64 ≈ $4.493tn 计算。比率仅为规模比较，不能从股权价值直接扣除；PORTS 已包含于总担保，不得重复相加。' : 'Per-share uses estimated 24.256bn diluted shares; market-cap share uses estimated 24.071bn basic shares × Nasdaq 2026-11-06 Close/Last $186.64 ≈ $4.493tn. These are scale comparisons, not direct equity-value deductions. PORTS is included in the total guarantee line.'}</small></div>
      <div className="el-nvda-joint-stress"><h3>{zh ? '把订单、回款与或有付款联动测试' : 'Stress orders, collections and a contingent payment together'}</h3><strong>$119.45 / {zh ? '股' : 'share'}</strong><p>{zh ? '仅作条件压力测试：FY2028 增速降至 40%，之后采用保守路径，FY2028–FY2033 应收天数增加 15 天，经营 DCF 从 $120.80 降至 $119.75；再假设 FY2030-01-27 发生净额 $10bn 的担保现金赔付，其现值影响约 $0.30／股。$10bn 不是已披露索赔或预期损失；增加的应收占款已进入现金流，不再从股权价值重复扣除。' : 'Conditional stress only: FY2028 growth falls to 40%, later economics follow Conservative, and receivable days rise by 15 in FY2028–FY2033. Operating DCF moves from $120.80 to $119.75. An additional hypothetical $10bn net guarantee cash settlement on 2030-01-27 has a ~$0.30/share present-value impact. The $10bn is not a disclosed claim or expected loss; extra receivables already flow through FCFF and are not deducted twice.'}</p></div>
      <p className="el-showcase-analysis">{zh ? '供给、回款与担保受同一客户经济性影响，但相互之间不是简单加总。PORTS 约 4.25 GW IT 负荷的首期预计 NVIDIA FY2029 投运。管理层的 Vera Rubin 每 GW 约 $40bn “收入机会”描述一代部署的计算内容价值；以 $35–45bn/GW 的纯分析师区间，4.25GW 仅对应约 $150–200bn 的一代内容等值，其中 $40bn/GW 的中点约为 $170bn。它绝非每年新增收入、园区订单或已实现销售。产品组合、机架密度、实际供电利用率、替换周期、交付验收与客户资金均未知。' : 'Supply, collections and guarantees depend on customer economics but cannot be summed. PORTS has ~4.25 GW of IT load, with its first phase expected in NVIDIA FY2029. Management’s ~$40bn Vera Rubin “revenue opportunity” per GW describes content in one generation of installed IT capacity. An analyst-only $35–45bn/GW range yields roughly $150–200bn of per-generation content equivalent; the $40bn/GW midpoint is ~$170bn. This is not annual revenue, new-campus additions, a PORTS order or realized sales. Product mix, rack density, powered utilization, refresh cycle, acceptance and funding remain unknown.'} <SourceLink href={src.tenQ}>{zh ? '10-Q：承诺与附注 10' : '10-Q: commitments and Note 10'}</SourceLink> <SourceLink href={src.call}>{zh ? '管理层每 GW 表述' : 'Management per-GW statement'}</SourceLink></p>
    </section>

    <section className="el-showcase-section" aria-labelledby="nvda-policy">
      <div className="el-showcase-section-head"><p className="el-eyebrow">06 / {zh ? '美国项目政策' : 'US project policy'}</p><h2 id="nvda-policy">{zh ? '审批延误与永久需求损失不同' : 'Delay and lost demand are different'}</h2></div>
      <p className="el-showcase-analysis">{zh ? '州级措施可能影响审批、供电、建设、采购、验收、收入确认的时间链。宾州行政命令和得州许可指令不构成已生效的全国数据中心建设禁令。以下仅用假设 $10bn NVIDIA 单年收入、25% FCFF 转化率测试方向，没有具名受影响订单。' : 'State actions can affect the sequence from approval and power to construction, procurement, acceptance and NVIDIA revenue recognition. Pennsylvania’s order and Texas’s permit directive are not an enacted national construction ban. The selector below uses a hypothetical $10bn one-year NVIDIA revenue flow at 25% FCFF conversion; no named affected order is identified.'} <SourceLink href={src.pa}>Pennsylvania</SourceLink> <SourceLink href={src.texas}>Texas</SourceLink></p>
      <div className="el-nvda-selector" role="group" aria-label={zh ? '项目受影响方式' : 'Project outcome'}>{(['delay','relocate','cancel'] as const).map((k) => <button key={k} type="button" aria-pressed={timingKey===k} onClick={() => setTimingKey(k)}>{zh ? { delay:'延迟一年',relocate:'迁址且按时交付',cancel:'取消单年需求' }[k] : { delay:'One-year delay',relocate:'Relocate on time',cancel:'Cancel one year' }[k]}</button>)}</div>
      <div className="el-nvda-policy-result"><strong>{timing[timingKey].delta === 0 ? '$0.00' : `${timing[timingKey].delta < 0 ? '−' : '+'}$${Math.abs(timing[timingKey].delta).toFixed(3)}`} / {zh ? '股' : 'share'}</strong><p>{zh ? timing[timingKey].zh : timing[timingKey].en}</p></div>
    </section>

    <section className="el-showcase-section" aria-labelledby="nvda-optical">
      <div className="el-showcase-section-head"><p className="el-eyebrow">07 / {zh ? '产业传导' : 'Industry transmission'}</p><h2 id="nvda-optical">{zh ? '光模块受全球网络需求影响，并非 NVIDIA 收入代理' : 'Optics follow global network demand, not just NVIDIA'}</h2></div>
      <p className="el-showcase-analysis">{zh ? '更大规模的跨机架、跨园区连接可以增加高速光端口需求，但紧耦合互联和共封装光学也可能改变可插拔模块的价值分配。中际旭创 FY2025 海外收入约 346.4 亿元，占总收入 90.58%，说明国际需求敞口；不能据此确认某个美国云客户或 NVIDIA 的订单。中国本土加速器集群可能提供另一需求来源，须单独核验。' : 'Larger rack-to-rack and campus fabrics can raise high-speed optical-port demand, while scale-up links and co-packaged optics can shift value away from pluggable modules. InnoLight reported about RMB 34.64bn of FY2025 overseas revenue, 90.58% of total. That establishes international exposure, not a named US-cloud or NVIDIA order. Domestic Chinese accelerator clusters form a separate potential demand pool that needs its own verification.'} <SourceLink href={src.optical}>{zh ? '中际旭创 FY2025 年报' : 'InnoLight FY2025 annual report'}</SourceLink></p>
    </section>

    <section className="el-showcase-section" aria-labelledby="nvda-watch">
      <div className="el-showcase-section-head"><p className="el-eyebrow">08 / {zh ? '可证伪指标' : 'Falsifiers'}</p><h2 id="nvda-watch">{zh ? '下一批披露应该回答什么' : 'What the next disclosures must show'}</h2></div>
      <p className="el-nvda-monitor-date"><strong>2026-11-17</strong> · {zh ? 'NVIDIA 已安排 FY2027 Q3 业绩讨论；以下是事前核验阈值，不是 Q3 实际业绩。' : 'NVIDIA scheduled its FY2027 Q3 results discussion; the following are pre-event review thresholds, not Q3 actuals.'} <SourceLink href={src.schedule}>{zh ? '公司日程' : 'Company schedule'}</SourceLink></p>
      <div className="el-nvda-matrix-scroll"><table className="el-nvda-thresholds"><thead><tr><th>{zh ? '信号' : 'Signal'}</th><th>{zh ? '事前分析师阈值' : 'Pre-event analyst threshold'}</th><th>{zh ? '若失守或超出，如何改模型' : 'Model implication'}</th></tr></thead><tbody>
        <tr><th>{zh ? 'FY2027 Q3 收入／毛利' : 'FY2027 Q3 sales / margin'}</th><td>{zh ? '$105.84–110.16bn 公司指引区间；毛利 73.5–74.5%' : 'Company revenue range $105.84–110.16bn; gross margin 73.5–74.5%'}</td><td>{zh ? '低于下沿：下调 FY2027 桥接；高于上沿：核对交付时点与供给，不机械外推' : 'Below floor: cut FY2027 bridge. Above ceiling: reconcile shipment timing and supply before extrapolating.'}</td></tr>
        <tr><th>{zh ? 'FY2027 Q4 指引' : 'FY2027 Q4 outlook'}</th><td>{zh ? '对照本研究 $105bn 收入估计；管理层先前预期 71–72% 毛利' : 'Compare with analyst $105bn sales estimate; management prior 71–72% GM expectation'}</td><td>{zh ? '收入低于 $105bn 或毛利低于 71%：下调下一财年起点；高于 72% 须确认价格可持续' : 'Below $105bn or GM <71%: reduce next-year base; GM >72% calls for pricing durability check.'}</td></tr>
        <tr><th>{zh ? 'FY2028 公司预期' : 'FY2028 issuer outlook'}</th><td>{zh ? '是否重申约 70% 初步增长；本研究中心路径 55%' : 'Reaffirm preliminary ~70% growth? Central path assumes 55%'}</td><td>{zh ? '若供应／订单证据支持不足 55%，应重新计算中心 DCF；若 70% 获订单与产能支持，检验上行情景' : 'Evidence below 55% requires Central DCF revision; 70% backed by orders and capacity strengthens the high case.'}</td></tr>
        <tr><th>{zh ? '应收回款' : 'Receivables'}</th><td>{zh ? 'FY2028 模型应收约 60 天；超过 65 天且无后续回款改善' : 'Modeled FY2028 receivables ~60 days; >65 without collections improvement'}</td><td>{zh ? '提高营运资本占用，检查坏账／客户融资与保证金风险；不得再单独扣一次应收账款' : 'Raise working-capital use and test credit/funding risk; do not deduct the receivable twice.'}</td></tr>
        <tr><th>{zh ? '中国两道门' : 'Two China gates'}</th><td>{zh ? '美国具体许可＋中国进口批准＋可验收净新增订单' : 'Specific US licence + China import approval + accepted net-new orders'}</td><td>{zh ? '缺任一项：中国增量保持零；也须与全球订单去重' : 'Without all three, retain zero incremental China line and remove baseline overlap.'}</td></tr>
      </tbody></table></div>
      <p className="el-showcase-citation">{zh ? '拟议 Hugging Face 交易仍待交割；当前现金流模型未计入其协同效应。' : 'The proposed Hugging Face transaction was pending and no synergy cash flow is added to this model.'} <SourceLink href="https://www.sec.gov/Archives/edgar/data/1045810/000104581026000078/nvda-20260902.htm">SEC 8-K</SourceLink></p>
    </section>

    <section className="el-showcase-section el-nvda-appendix" aria-labelledby="nvda-files">
      <div className="el-showcase-section-head"><p className="el-eyebrow">09 / {zh ? '资料与历史' : 'Sources and history'}</p><h2 id="nvda-files">{zh ? '阅读完整论证与复核数据' : 'Read the argument and inspect the data'}</h2></div>
      <p className="el-nvda-model-caveat">{zh ? '审阅模型已用 LibreOffice 隔离重算，缓存的中心 DCF $157.63 与本页一致；微软 Excel 原生完整重算仍为 OPEN。预测、股价口径和正式结论尚待签署。' : 'The review model was recalculated in isolated LibreOffice runs; its cached Central DCF of $157.63 matches this page. Native Microsoft Excel full recalculation remains OPEN. Forecasts, price convention and formal conclusions await sign-off.'}</p>
      <div className="el-showcase-downloads">
        <a href={assets.reportPdf} download><FileText aria-hidden="true" />{zh ? '英文报告 · PDF' : 'English report · PDF'}<Download aria-hidden="true" /></a>
        <a href={assets.reportDocx} download><FileText aria-hidden="true" />{zh ? '英文报告 · 可编辑' : 'English report · editable'}<Download aria-hidden="true" /></a>
        <a href={assets.pitchPdf} download><FileText aria-hidden="true" />{zh ? '一页股票研究论点 · PDF' : 'One-page stock pitch · PDF'}<Download aria-hidden="true" /></a>
        <a href={assets.pitchDocx} download><FileText aria-hidden="true" />{zh ? '一页股票研究论点 · 可编辑' : 'One-page stock pitch · editable'}<Download aria-hidden="true" /></a>
        <a href={assets.model} download><FileSpreadsheet aria-hidden="true" />{zh ? '三路径审阅模型' : 'Three-path review model'}<Download aria-hidden="true" /></a>
        <a href={assets.sources} download><FileSpreadsheet aria-hidden="true" />{zh ? '来源与证据登记' : 'Source and evidence register'}<Download aria-hidden="true" /></a>
        <a href={assets.qa} download><FileText aria-hidden="true" />{zh ? '模型核验与限制' : 'Model QA and limits'}<Download aria-hidden="true" /></a>
        <a href={assets.package} download><FileText aria-hidden="true" />{zh ? '完整研究包 · ZIP' : 'Complete research package · ZIP'}<Download aria-hidden="true" /></a>
        <a href={assets.chineseSummary} download><FileText aria-hidden="true" />{zh ? '中文摘要 · Markdown' : 'Chinese summary · Markdown'}<Download aria-hidden="true" /></a>
      </div>
      <p className="el-showcase-citation">{zh ? '文件版本、审阅边界和清单：' : 'File versions, review scope and contents:'} <a href={assets.readme} target="_blank" rel="noreferrer">README</a></p>
      <details className="el-nvda-history"><summary>{zh ? '展开 FY2024–FY2026 历史财务' : 'Show FY2024–FY2026 filed history'}</summary><table><thead><tr><th>{zh ? 'NVIDIA 财年' : 'NVIDIA fiscal year'}</th><th>{zh ? '收入，十亿美元' : 'Revenue, USD bn'}</th><th>{zh ? '经营现金流，十亿美元' : 'CFO, USD bn'}</th></tr></thead><tbody><tr><td>FY2024 Actual</td><td>60.922</td><td>28.090</td></tr><tr><td>FY2025 Actual</td><td>130.497</td><td>64.089</td></tr><tr><td>FY2026 Actual</td><td>215.938</td><td>102.718</td></tr></tbody></table><p><SourceLink href={src.tenK}>NVIDIA FY2026 Form 10-K</SourceLink></p></details>
    </section>

    <footer className="el-showcase-footer el-nvda-author"><div><strong>Yuqi Qiu</strong><span>{zh ? 'LSE 政治经济学（后发发展）理学硕士在读，预计 2026-12 毕业 · EquityLens 独立研究项目' : 'LSE MSc Political Economy of Late Development candidate, expected 2026-12 · Independent EquityLens research project'}</span><p>{zh ? '作者聚焦政策、公司现金流与估值之间可核验的传导路径。本研究与 NVIDIA 或中国相关企业没有委托关系。' : 'The author studies the verifiable path from policy to company cash flow and valuation. This independent work was not commissioned by NVIDIA or the Chinese firms discussed.'}</p></div><nav aria-label={zh ? '作者链接' : 'Author links'}><a href="https://www.linkedin.com/in/yuqiqiu0625" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://github.com/yqiu6250uu" target="_blank" rel="noreferrer">GitHub</a><a href={assets.cv} target="_blank" rel="noreferrer">{zh ? '股票研究简历 · PDF' : 'Equity research résumé · PDF'}</a></nav></footer>
  </main>;
}
