import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Download, Save } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { researchQuestionsApi } from '../api/researchQuestions';
import { secFinancialsApi } from '../api/secFinancials';
import { IS_STATIC_DEMO } from '../demo/config';
import { useUiLanguage } from '../contexts/UiLanguageContext';
import { researchV02Text } from '../i18n/researchV02Text';
import { Evidence } from './CompanyResearchPage';
import { saveResearch } from '../demo/researchStore';
import type { RevenueCashFlowReport, ResearchCalculation } from '../types/researchQuestions';
import type { FinancialPeriod } from '../types/secFinancials';

const FACT_LABELS = { revenue: 'revenue', operating_cash_flow: 'cash', net_income: 'income' } as const;
const CALC_LABELS = {
  'revenue.change': 'revenueChange', 'revenue.growth': 'revenueGrowth',
  'operating_cash_flow.change': 'cashChange', 'operating_cash_flow.growth': 'cashGrowth',
  'net_income.change': 'incomeChange', 'net_income.growth': 'incomeGrowth',
  'current.operating_cash_flow_margin': 'currentMargin', 'prior.operating_cash_flow_margin': 'priorMargin',
} as const;

function presentValue(value: string | number | null | undefined, unit: string, language: 'en' | 'zh'): string {
  if (value == null) return '—';
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  if (unit === 'percent') return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }).format(Number(value))}%`;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Number(value))} USD`;
}

function exportMarkdown(report: RevenueCashFlowReport, language: 'en' | 'zh') {
  const copy = researchV02Text[language];
  const lines = [
    `# ${report.company_name} (${report.ticker}) — ${copy.researchQuestion}`,
    '', `${copy.retrieved}: ${report.retrieved_at}`, `${copy.method}: ${report.method_version}`,
    `${copy.current}: ${report.current_period?.period_start ?? '—'} → ${report.current_period?.period_end ?? '—'}`,
    `${copy.prior}: ${report.prior_period?.period_start ?? '—'} → ${report.prior_period?.period_end ?? '—'}`, '',
    `## ${copy.facts}`,
    ...report.facts.map((fact) => `- ${fact.id}: ${presentValue(fact.value?.value, fact.value?.unit ?? 'USD', language)} | ${fact.value?.sources.map((source) => source.url).join(', ') ?? '—'}`),
    '', `## ${copy.calculations}`,
    ...report.calculations.map((calc) => `- ${calc.id}: ${presentValue(calc.value, calc.unit, language)} | ${calc.definition} | ${calc.input_fact_ids.join(', ')}${calc.reason ? ` | ${calc.reason}` : ''}`),
    '', `## ${copy.observations}`, ...report.observations.map((item) => `- ${item.template_id}: ${item.calculation_ids.join(', ')}`),
    '', copy.noCausality, '', copy.storageNotice,
  ];
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `equitylens-${report.ticker}-${report.basis}-${report.current_period?.period_end ?? 'research'}.md`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function RevenueCashFlowResearchPage() {
  const { ticker = 'NVDA' } = useParams();
  const normalized = ticker.toUpperCase();
  const { language } = useUiLanguage();
  const copy = researchV02Text[language];
  const [params, setParams] = useSearchParams();
  const basis = params.get('basis') === 'quarterly' ? 'quarterly' : 'annual';
  const periodEnd = params.get('period') ?? undefined;
  const [report, setReport] = useState<RevenueCashFlowReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState<'none' | 'saved' | 'error'>('none');
  const [retry, setRetry] = useState(0);
  const [ai, setAi] = useState<{ status: string; content?: { interpretations: Array<{ text: string; citation_ids: string[] }> } } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [periodOptions, setPeriodOptions] = useState<FinancialPeriod[]>([]);

  useEffect(() => { document.title = `${normalized} · ${copy.investigation} · EquityLens`; }, [normalized, copy.investigation]);
  useEffect(() => {
    let active = true;
    secFinancialsApi.getCompany(normalized).then((result) => { if (active) setPeriodOptions(result.periods); }).catch(() => { if (active) setPeriodOptions([]); });
    return () => { active = false; };
  }, [normalized]);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) { setLoading(true); setError(false); } });
    researchQuestionsApi.getRevenueCashFlow(normalized, basis, periodEnd)
      .then((result) => { if (active) setReport(result); })
      .catch(() => { if (active) { setError(true); setReport(null); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [normalized, basis, periodEnd, retry]);

  function changeBasis(next: 'annual' | 'quarterly') { setParams({ basis: next }); setSaved('none'); }
  function save() {
    if (!report?.current_period) return;
    try {
      saveResearch({ kind: 'question', ticker: normalized, question_id: report.question_id,
        basis, period_end: report.current_period.period_end, fact_hash: report.fact_hash, retrieved_at: report.retrieved_at });
      setSaved('saved');
    } catch { setSaved('error'); }
  }
  async function requestAi() {
    if (!report?.current_period) return;
    setAiLoading(true);
    try { setAi(await researchQuestionsApi.interpret(normalized, basis, report.current_period.period_end, language)); }
    catch { setAi({ status: 'failed' }); }
    finally { setAiLoading(false); }
  }
  function calculationRow(item: ResearchCalculation) {
    const label = CALC_LABELS[item.id as keyof typeof CALC_LABELS] ?? item.id;
    return <div className="el-v02-calculation" key={item.id}>
      <div><span className="el-v02-status">{item.value === null ? copy.insufficient : copy.calculated}</span><h3>{label in copy ? copy[label as keyof typeof copy] : label}</h3></div>
      <strong>{presentValue(item.value, item.unit, language)}</strong>
      <details><summary>{copy.formula} · {copy.inputs}</summary><p>{item.definition}</p>
        <p>{item.input_fact_ids.map((id) => <a key={id} href={`#fact-${id}`}>{id} </a>)}</p>
        {item.reason && <p>{copy.reason} {copy[item.reason as keyof typeof copy] ?? item.reason}.</p>}
      </details>
    </div>;
  }

  return <div className="el-v02-page el-v02-report">
    <nav className="el-v02-breadcrumb" aria-label="Breadcrumb"><Link to="/">{copy.returnHome}</Link><span>/</span><Link to={`/research/${normalized}`}>{normalized}</Link><span>/</span><span>{copy.investigation}</span></nav>
    <header className="el-v02-report-head"><p className="el-eyebrow">{copy.investigation} / SEC EDGAR</p>
      <h1>{copy.researchQuestion}</h1><p>{copy.questionScope}</p></header>
    <div className="el-v02-toolbar"><div role="group" aria-label={copy.choosePeriod}>
      {(['annual', 'quarterly'] as const).map((item) => <button type="button" key={item} aria-pressed={basis === item} onClick={() => changeBasis(item)}>{copy[item]}</button>)}
    </div><label className="el-v02-period-select">{copy.choosePeriod}<select value={periodEnd ?? report?.current_period?.period_end ?? ''} onChange={(event) => setParams({ basis, period: event.target.value })}>
      {periodOptions.filter((item) => item.type === basis).map((item) => <option key={`${item.type}-${item.period_end}`} value={item.period_end}>{item.fiscal_year ? `FY${item.fiscal_year}` : item.period_end}{item.fiscal_quarter ? ` Q${item.fiscal_quarter}` : ''} · {item.period_end}</option>)}
    </select></label><Link to={`/research/${normalized}`}><ArrowLeft aria-hidden="true" />{copy.backCompany}</Link></div>
    {loading && <div className="el-v02-state" role="status">{copy.loading}</div>}
    {error && <div className="el-v02-state" role="alert">{copy.error} <button type="button" onClick={() => setRetry((value) => value + 1)}>{copy.retry}</button></div>}
    {!loading && report && <>
      <section className="el-v02-context"><div><span>{report.company_name} · {report.ticker} · CIK {String(report.cik).padStart(10, '0')}</span>
        <strong>{report.current_period?.period_start ?? '—'} → {report.current_period?.period_end ?? '—'}</strong>
        <small>{report.current_period?.filing_form} · {copy.retrieved} {report.retrieved_at}</small></div>
        {report.current_period && <a href={report.current_period.filing_url} target="_blank" rel="noreferrer">{copy.originalFiling}<ArrowUpRight aria-hidden="true" /></a>}
      </section>
      <section className="el-v02-section" aria-labelledby="v02-observations"><p className="el-eyebrow">01 / {copy.calculated}</p><h2 id="v02-observations">{copy.observations}</h2>
        {report.observations.map((item) => <div className="el-v02-observation" key={item.id}><span>{item.status === 'insufficient_evidence' ? copy.insufficient : copy.calculated}</span>
          <p>{item.template_id === 'both_increased' ? copy.bothIncreased : item.template_id === 'revenue_up_cash_not_up' ? copy.revenueUpCashNotUp : item.template_id === 'mixed_movement' ? copy.mixedMovement : copy.insufficientGrowth}</p>
          <small>{item.calculation_ids.map((id) => <a key={id} href={`#calc-${id}`}>{id} </a>)}</small></div>)}
        <p className="el-v02-caution">{copy.noCausality}</p>
      </section>
      <section className="el-v02-section" aria-labelledby="v02-facts"><p className="el-eyebrow">02 / {copy.evidence}</p><h2 id="v02-facts">{copy.facts}</h2>
        <div className="el-v02-fact-grid">{report.facts.map((fact) => <article id={`fact-${fact.id}`} key={fact.id}>
          <span>{fact.role === 'current' ? copy.current : copy.prior} · {fact.period_end ?? '—'}</span>
          <h3>{copy[FACT_LABELS[fact.field as keyof typeof FACT_LABELS] ?? 'revenue']}</h3>
          <strong>{presentValue(fact.value?.value, fact.value?.unit ?? 'USD', language)}</strong>
          <small>{fact.value ? fact.value.kind === 'reported' ? copy.sourceConfirmed : copy.calculated : copy.insufficient}</small>
          <Evidence value={fact.value} />
        </article>)}</div>
        {!report.prior_period && <p className="el-v02-caution">{copy.noPrior}</p>}
      </section>
      <section className="el-v02-section" aria-labelledby="v02-calculations"><p className="el-eyebrow">03 / {copy.calculated}</p><h2 id="v02-calculations">{copy.calculations}</h2>
        <div className="el-v02-calculation-grid">{report.calculations.map((item) => <div id={`calc-${item.id}`} key={item.id}>{calculationRow(item)}</div>)}</div>
      </section>
      <section className="el-v02-section el-v02-method" aria-labelledby="v02-questions"><p className="el-eyebrow">04 / {copy.needsReview}</p><h2 id="v02-questions">{copy.alternatives}</h2>
        <ul><li>{copy.workingCapital}</li><li>{copy.taxNonCash}</li><li>{copy.customerTiming}</li></ul>
        <h3>{copy.needsReview}</h3><p>{copy.inspectNotes}</p>
        <p>{copy.interpretation}: {IS_STATIC_DEMO ? copy.aiUnavailable : copy.aiLocalHint}</p>
        {!IS_STATIC_DEMO && <><button type="button" onClick={() => void requestAi()} disabled={aiLoading}>{copy.requestAi}</button>
          {ai && <div role="status">{ai.status === 'generated' && ai.content ? ai.content.interpretations.map((item, index) =>
            <p key={index}>{item.text} <small>{item.citation_ids.map((id) => <a href={id.startsWith('current.') || id.startsWith('prior.') ? `#fact-${id}` : `#calc-${id}`} key={id}>{id} </a>)}</small></p>) : ai.status === 'not_configured' ? copy.aiNotConfigured : copy.aiFailed}</div>}</>}
        <small>{copy.snapshot}: {report.fact_hash.slice(0, 16)} · {copy.method}: {report.method_version} · {copy.calculatedAt}: {report.calculated_at}</small>
      </section>
      <div className="el-v02-actions"><button type="button" onClick={save}><Save aria-hidden="true" />{copy.save}</button>
        <button type="button" onClick={() => exportMarkdown(report, language)}><Download aria-hidden="true" />{copy.export}</button>
        <Link to="/my-research">{copy.myResearch}<ArrowUpRight aria-hidden="true" /></Link></div>
      {saved !== 'none' && <p role="status" className="el-v02-save-status">{saved === 'saved' ? copy.saved : copy.saveError}</p>}
      <p className="el-v02-storage-note">{copy.storageNotice}</p>
    </>}
  </div>;
}
