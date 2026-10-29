import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, FileSearch, RefreshCw, Search } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { secFinancialsApi } from '../api/secFinancials';
import { IS_STATIC_DEMO, isVerifiedDemoTicker } from '../demo/config';
import { researchV02Text } from '../i18n/researchV02Text';
import { saveResearch } from '../demo/researchStore';
import { Link } from 'react-router-dom';
import { AppPage, Button, EmptyState, InlineAlert } from '../components/common';
import { useUiLanguage } from '../contexts/UiLanguageContext';
import { equitylensText } from '../i18n/equitylensText';
import type { UiTextKey } from '../i18n/uiText';
import type { FinancialPeriod, FinancialValue, SecFinancialResponse } from '../types/secFinancials';

const FIELDS = ['revenue', 'net_income', 'operating_cash_flow', 'assets', 'liabilities', 'capital_expenditure'] as const;
const PRIMARY_FIELDS = ['revenue', 'net_income', 'operating_cash_flow'] as const;
const SECONDARY_FIELDS = ['assets', 'liabilities', 'capital_expenditure'] as const;
const METRICS = ['revenue_growth', 'net_profit_margin', 'operating_cash_flow_margin'] as const;
type ChartMetric = 'revenue' | 'net_income' | 'operating_cash_flow';
const CHART_METRICS: ChartMetric[] = ['revenue', 'net_income', 'operating_cash_flow'];
const DEFINITION_KEYS: Record<string, UiTextKey> = {
  'SEC productive-assets cash outflow includes property, plant and equipment, software, and other intangible assets.': 'research.productiveAssetsScope',
  'Current fiscal YTD minus prior fiscal YTD': 'research.ytdDifference',
  'Full fiscal year minus first nine months': 'research.q4Difference',
  '(Current revenue − comparable prior-year revenue) / comparable prior-year revenue × 100': 'research.revenueGrowthFormula',
  'Net income / revenue × 100': 'research.profitMarginFormula',
  'Operating cash flow / revenue × 100': 'research.ocfMarginFormula',
};

function fiscalLabel(period: FinancialPeriod): string {
  const year = period.fiscal_year ? `FY${period.fiscal_year}` : period.period_end;
  return period.fiscal_quarter ? `${year} Q${period.fiscal_quarter}` : year;
}

function amount(value: FinancialValue | null | undefined, language: 'zh' | 'en'): string {
  if (!value) return '—';
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  if (value.unit === 'percent') return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value.value)}%`;
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value.value);
}

function readableTime(value: string, language: 'zh' | 'en'): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  }).format(date);
}

function qualityIssueLabel(issue: string, t: ReturnType<typeof useUiLanguage>['t']): string {
  const match = /^(missing|ambiguous|inconsistent)_(.+)$/.exec(issue);
  if (!match || !FIELDS.some((field) => field === match[2])) return issue;
  return `${t(`research.quality.${match[1]}` as UiTextKey)}: ${t(`research.${match[2]}` as UiTextKey)}`;
}

function comparablePrior(current: FinancialPeriod, periods: FinancialPeriod[]): FinancialPeriod | undefined {
  if (current.fiscal_year == null || !current.period_start) return undefined;
  const currentDays = (Date.parse(current.period_end) - Date.parse(current.period_start)) / 86_400_000;
  if (!Number.isFinite(currentDays)) return undefined;
  return periods.find((period) => period.type === current.type &&
    period.fiscal_year === current.fiscal_year! - 1 && period.fiscal_quarter === current.fiscal_quarter &&
    period.period_start && Math.abs((Date.parse(period.period_end) - Date.parse(period.period_start)) / 86_400_000 - currentDays) <= 10);
}

function comparableFacts(current: FinancialValue | null | undefined, prior: FinancialValue | null | undefined): boolean {
  if (!current || !prior || current.unit !== 'USD' || prior.unit !== 'USD') return false;
  const currentConcepts = new Set(current.sources.map((source) => source.concept));
  const priorConcepts = new Set(prior.sources.map((source) => source.concept));
  return currentConcepts.size === 1 && priorConcepts.size === 1 &&
    [...currentConcepts][0] === [...priorConcepts][0];
}

export function Evidence({ value }: { value: FinancialValue | null | undefined }) {
  const { t } = useUiLanguage();
  if (!value) return null;
  const definition = value.definition && (DEFINITION_KEYS[value.definition] ? t(DEFINITION_KEYS[value.definition]) : value.definition);
  return <details className="el-research-evidence">
    <summary>{value.kind === 'reported' ? t('research.reported') : t('research.derived')} · {t('research.evidence')}</summary>
    <div className="el-research-evidence-body">
      {definition && <p><strong>{t(value.kind === 'reported' ? 'research.scope' : 'research.formula')}:</strong> {definition}</p>}
      {value.sources.map((source) => <div className="el-research-source" key={`${source.accession}-${source.concept}-${source.period_start ?? ''}`}>
        <p className="el-research-concept">{source.concept} · {source.unit}</p>
        <p>{source.period_start ? `${source.period_start} → ` : ''}{source.period_end} · {source.form} · {t('research.filed')} {source.filed}{source.accepted ? ` · ${t('research.accepted')} ${source.accepted}` : ''}</p>
        <p>{t('research.accession')} {source.accession} · {t('research.retrieved')} {source.retrieved_at}</p>
        <a href={source.url} target="_blank" rel="noreferrer">{t('research.openFiling')} <ArrowUpRight aria-hidden="true" /></a>
      </div>)}
    </div>
  </details>;
}

function Fact({ field, value, language }: { field: typeof FIELDS[number]; value: FinancialValue | null | undefined; language: 'zh' | 'en' }) {
  const { t } = useUiLanguage();
  return <div className="el-research-fact">
    <dt>{t(`research.${field}` as UiTextKey)}</dt>
    <dd><strong>{amount(value, language)}</strong> {value && <span>{value.unit}</span>}</dd>
    {value ? <Evidence value={value} /> : <p className="el-research-missing">{t('research.missingValue')}</p>}
  </div>;
}

const CompanyResearchContent: React.FC<{ ticker: string }> = ({ ticker }) => {
  const { t, language } = useUiLanguage();
  const copy = equitylensText[language];
  const v02 = researchV02Text[language];
  const navigate = useNavigate();
  const location = useLocation();
  const savedContext = new URLSearchParams(location.search);
  const comparisonRef = useRef<HTMLElement>(null);
  const comparisonHeadingRef = useRef<HTMLHeadingElement>(null);
  const requestGeneration = useRef(0);
  const [search, setSearch] = useState(ticker);
  const [searchError, setSearchError] = useState('');
  const [periodType, setPeriodType] = useState<'annual' | 'quarterly'>(() => savedContext.get('basis') === 'quarterly' ? 'quarterly' : 'annual');
  const [selectedEnd, setSelectedEnd] = useState<string | null>(() => savedContext.get('period'));
  const [chartMetric, setChartMetric] = useState<ChartMetric>(location.hash === '#cash-flow' ? 'operating_cash_flow' : 'revenue');
  const [comparisonOpen, setComparisonOpen] = useState(location.hash === '#cash-flow');
  const showComparison = comparisonOpen || location.hash === '#cash-flow';
  const [data, setData] = useState<SecFinancialResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState('');
  const [saveStatus, setSaveStatus] = useState<'none' | 'saved' | 'error'>('none');

  useEffect(() => { document.title = `${ticker} · EquityLens`; }, [ticker]);

  const load = useCallback(async () => {
    const generation = ++requestGeneration.current;
    setLoading(true);
    setErrorCode('');
    try {
      const next = await secFinancialsApi.getCompany(ticker);
      if (generation === requestGeneration.current) setData(next);
    } catch (error) {
      if (generation !== requestGeneration.current) return;
      setData(null);
      const response = error as { response?: { data?: { error?: string; detail?: { error?: string } } } };
      setErrorCode(response.response?.data?.error || response.response?.data?.detail?.error || 'sec_unavailable');
    } finally {
      if (generation === requestGeneration.current) setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) void load(); });
    return () => { active = false; requestGeneration.current += 1; };
  }, [load]);

  useEffect(() => {
    if (!data || location.hash !== '#cash-flow') return undefined;
    const frame = requestAnimationFrame(() => comparisonHeadingRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [data, location.hash]);

  const periods = useMemo(() => data?.periods.filter((period) => period.type === periodType) ?? [], [data, periodType]);
  const selected = periods.find((period) => period.period_end === selectedEnd) ?? periods[0];
  const prior = selected ? comparablePrior(selected, periods) : undefined;
  const chartPeriods = periods.slice(0, periodType === 'annual' ? 6 : 8).reverse();
  const chartData = chartPeriods.map((period) => ({
    name: fiscalLabel(period), end: period.period_end, value: period.values[chartMetric]?.value ?? null,
  }));
  const comparableRevenue = Boolean(selected && prior && comparableFacts(selected.values.revenue, prior.values.revenue));
  const comparableCash = Boolean(selected && prior && comparableFacts(selected.values.operating_cash_flow, prior.values.operating_cash_flow));

  function openComparison() {
    setComparisonOpen(true);
    setChartMetric('operating_cash_flow');
    navigate(`${location.pathname}${location.search}#cash-flow`, { replace: true });
    requestAnimationFrame(() => comparisonHeadingRef.current?.focus());
  }

  return <AppPage className="el-research-page">
    <div className="el-research-topline"><span className="el-topline-dot" />{copy.workspace}<span className="el-topline-rule" />SEC EDGAR</div>
    <header className="el-research-intro">
      <div><p className="el-eyebrow">{t('research.eyebrow')}</p><h1>{t('research.title')}</h1><p>{t('research.description')}</p></div>
      <form className="el-research-search" onSubmit={(event) => {
        event.preventDefault();
        const next = search.trim().toUpperCase();
        if (!next) { setSearchError(copy.searchEmpty); return; }
        if (!/^[A-Z][A-Z0-9.-]{0,9}$/.test(next)) { setSearchError(copy.searchInvalid); return; }
        if (IS_STATIC_DEMO && !isVerifiedDemoTicker(next)) { setSearchError(copy.demoUnsupported); return; }
        setSearchError('');
        navigate(`/research/${encodeURIComponent(next)}`);
      }} noValidate>
        <label htmlFor="el-company-ticker">{t('research.companySearch')}</label>
        <div><input id="el-company-ticker" value={search} onChange={(event) => { setSearch(event.target.value); setSearchError(''); }} placeholder="NVDA" autoComplete="off" spellCheck={false} aria-invalid={Boolean(searchError)} aria-describedby={searchError ? 'el-company-search-error' : undefined} />
          <Button type="submit" size="sm" variant="secondary"><Search aria-hidden="true" />{t('research.search')}</Button></div>
        {searchError && <p id="el-company-search-error" role="alert" className="el-research-form-error">{searchError}</p>}
        {IS_STATIC_DEMO && !searchError && <p className="el-research-form-hint">{copy.demoSearchHint}</p>}
      </form>
    </header>

    {loading && !data && <div className="el-research-loading" role="status" aria-label={t('research.loading')}><span /><span /><span /></div>}
    {errorCode && <InlineAlert variant="warning" title={t(errorCode === 'demo_unsupported' ? 'research.demoUnsupportedTitle' : errorCode === 'sec_not_configured' ? 'research.setupTitle' : 'research.errorTitle')}
      message={t(errorCode === 'demo_unsupported' ? 'research.demoUnsupported' : errorCode === 'sec_not_configured' ? 'research.setupMessage' : errorCode === 'ticker_not_found' ? 'research.notFound' : 'research.errorMessage')}
      action={<Button size="sm" variant="secondary" onClick={() => void load()}>{t('common.retry')}</Button>} />}

    {data && <>
      <section className="el-research-company" aria-label={t('research.companyContext')}>
        <div className="el-research-company-main"><p className="el-eyebrow">{t('research.companyContext')}</p><h2>{data.company_name} <span>{data.ticker}</span></h2>
          <p>CIK {String(data.cik).padStart(10, '0')} <span aria-hidden="true">·</span> {data.data_quality.source}</p></div>
        <div className="el-research-company-meta"><span>{t('research.retrieved')} {readableTime(data.retrieved_at, language)}</span>{!IS_STATIC_DEMO && <Button type="button" size="sm" variant="secondary" onClick={() => void load()} disabled={loading}><RefreshCw aria-hidden="true" />{t('research.refresh')}</Button>}</div>
      </section>

      <div className="el-research-periodbar">
        <div className="el-research-period-switch" role="group" aria-label={t('research.period')}>
          {(['annual', 'quarterly'] as const).map((type) => <button key={type} type="button" aria-pressed={periodType === type} onClick={() => { setPeriodType(type); setSelectedEnd(null); }}>{t(`research.${type}` as UiTextKey)}</button>)}
        </div>
        {selected && <p><strong>{fiscalLabel(selected)}</strong> · {selected.period_start ? `${selected.period_start} → ` : ''}{selected.period_end} · {selected.filing_form} · {t('research.filed')} {selected.filing_date}
          <a href={selected.filing_url} target="_blank" rel="noreferrer">{t('research.openFiling')} <ArrowUpRight aria-hidden="true" /></a></p>}
      </div>

      {periods.length === 0 || !selected ? <EmptyState icon={<FileSearch className="h-6 w-6" />} title={t('research.emptyTitle')} description={t('research.emptyMessage')} /> : <>
        <section className="el-research-section" aria-label={t('research.snapshot')}>
          <div className="el-research-section-head"><div><p className="el-eyebrow">01 / {t('research.reported')}</p><h3>{t('research.snapshot')} · {fiscalLabel(selected)}</h3></div><p>{t('research.reportedHint')}</p></div>
          <dl className="el-research-primary-facts">{PRIMARY_FIELDS.map((field) => <Fact key={field} field={field} value={selected.values[field]} language={language} />)}</dl>
          <details className="el-research-secondary"><summary>{t('research.moreStatements')} <ArrowDown aria-hidden="true" /></summary>
            <dl>{SECONDARY_FIELDS.map((field) => <Fact key={field} field={field} value={selected.values[field]} language={language} />)}</dl>
          </details>
          <div className="el-research-metrics"><p className="el-eyebrow">{t('research.calculated')}</p><dl>{METRICS.map((metric) => <div key={metric}><dt>{t(`research.${metric}` as UiTextKey)}</dt><dd>{amount(selected.metrics[metric], language)}</dd>{selected.metrics[metric] ? <Evidence value={selected.metrics[metric]} /> : <p className="el-research-missing">{t('research.missingValue')}</p>}</div>)}</dl></div>
        </section>

        <section className="el-research-section" aria-label={t('research.history')}>
          <div className="el-research-section-head"><div><p className="el-eyebrow">02 / {t('research.chartUnitShort')}</p><h3>{t('research.history')}</h3></div><p>{t('research.trendHint')}</p></div>
          <div className="el-research-chart-toolbar" role="group" aria-label={t('research.chartMetric')}>
            {CHART_METRICS.map((metric) => <button key={metric} type="button" aria-pressed={chartMetric === metric} onClick={() => setChartMetric(metric)}>{t(`research.${metric}` as UiTextKey)}</button>)}
          </div>
          <div className="el-research-chart" role="img" aria-label={`${t(`research.${chartMetric}` as UiTextKey)} ${t('research.history')}: ${chartData.map((point) => `${point.name} ${point.value ?? '—'} USD`).join(', ')}`}>
            <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 14, right: 20, bottom: 4, left: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--el-line)" strokeDasharray="4 4" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--el-muted)', fontSize: 11 }} />
              <YAxis width={54} tickLine={false} axisLine={false} tick={{ fill: 'var(--el-muted)', fontSize: 11 }} tickFormatter={(value: number) => `${Math.round(value / 1_000_000_000)}`} />
              <Tooltip formatter={(value) => [`${new Intl.NumberFormat(language === 'zh' ? 'zh-CN' : 'en-US').format(Number(value))} USD`, t(`research.${chartMetric}` as UiTextKey)]} />
              <Line type="linear" dataKey="value" stroke="var(--el-action)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--el-paper)' }} activeDot={{ r: 5 }} connectNulls={false} isAnimationActive={false} />
            </LineChart></ResponsiveContainer>
          </div>
          <p className="el-research-chart-unit">{t('research.chartUnitShort')} · {t('research.chartSelectionHint')}</p>
          <div className="el-research-period-choices" role="group" aria-label={t('research.selectPeriod')}>
            {chartPeriods.map((period) => <button key={period.period_end} type="button" aria-pressed={selected.period_end === period.period_end} onClick={() => setSelectedEnd(period.period_end)}><span>{fiscalLabel(period)}</span><strong>{amount(period.values[chartMetric], language)}</strong></button>)}
          </div>
        </section>

        <section className="el-research-question" aria-labelledby="el-research-question-title">
          <div><p className="el-eyebrow">03 / {t('research.questionEyebrow')}</p><h3 id="el-research-question-title">{t('research.cashFlowQuestion')}</h3><p>{t('research.questionDescription')}</p></div>
          <div className="el-v02-question-actions"><button type="button" onClick={openComparison}>{t('research.compareAction')} <ArrowRight aria-hidden="true" /></button>
            <Link to={`/research/${ticker}/questions/revenue-cash-flow?basis=${periodType}&period=${selected.period_end}`}>{v02.investigate}<ArrowUpRight aria-hidden="true" /></Link></div>
        </section>

        <div className="el-v02-company-save"><button type="button" onClick={() => {
          try { saveResearch({ kind: 'company', ticker, question_id: null, basis: periodType,
            period_end: selected.period_end, fact_hash: null, retrieved_at: data.retrieved_at }); setSaveStatus('saved'); }
          catch { setSaveStatus('error'); }
        }}>{v02.saveCompany}</button><Link to="/my-research">{v02.myResearch}</Link>
          {saveStatus !== 'none' && <span role="status">{saveStatus === 'saved' ? v02.saved : v02.saveError}</span>}</div>

        {showComparison && <section id="cash-flow" ref={comparisonRef} className="el-research-section el-research-comparison" aria-labelledby="el-cash-flow-title">
          <div className="el-research-section-head"><div><p className="el-eyebrow">04 / {t('research.investigationEyebrow')}</p><h3 id="el-cash-flow-title" ref={comparisonHeadingRef} tabIndex={-1}>{t('research.comparisonTitle')}</h3></div><p>{t('research.comparisonCaution')}</p></div>
          <p className="el-research-comparison-period">{fiscalLabel(selected)} {prior ? `↔ ${fiscalLabel(prior)}` : ''} · {t('research.sameFiscalBasis')}</p>
          {!prior && <p className="el-research-insufficient" role="status">{t('research.noComparablePeriod')}</p>}
          <div className="el-research-comparison-grid">
            {(['revenue', 'operating_cash_flow'] as const).map((field) => {
              const comparable = field === 'revenue' ? comparableRevenue : comparableCash;
              return <div key={field} className="el-research-comparison-column">
                <h4>{t(`research.${field}` as UiTextKey)}</h4>
                <div><span>{fiscalLabel(selected)} · {selected.period_start} → {selected.period_end}</span><strong>{amount(selected.values[field], language)} {selected.values[field]?.unit ?? ''}</strong><Evidence value={selected.values[field]} /></div>
                {prior && <div><span>{fiscalLabel(prior)} · {prior.period_start} → {prior.period_end}</span><strong>{amount(prior.values[field], language)} {prior.values[field]?.unit ?? ''}</strong><Evidence value={prior.values[field]} /></div>}
                {prior && !comparable && <p className="el-research-insufficient">{t('research.notComparable')}</p>}
                {field === 'revenue' && comparable && selected.metrics.revenue_growth && <div className="el-research-comparison-metric">{t('research.revenue_growth')}: <strong>{amount(selected.metrics.revenue_growth, language)}</strong><Evidence value={selected.metrics.revenue_growth} /></div>}
                {field === 'operating_cash_flow' && <div className="el-research-comparison-metric"><span>{t('research.operating_cash_flow_margin')}</span><strong>{amount(selected.metrics.operating_cash_flow_margin, language)}</strong><Evidence value={selected.metrics.operating_cash_flow_margin} /></div>}
              </div>;
            })}
          </div>
          <p className="el-research-method">{t('research.comparisonMethod')}</p>
        </section>}

        <section className="el-research-section el-research-record" aria-label={t('research.periodTable')}>
          <div className="el-research-section-head"><div><p className="el-eyebrow">{showComparison ? '05' : '04'} / {t('research.source')}</p><h3>{t('research.periodTable')}</h3></div><p>{t('research.tableHint')}</p></div>
          <div className="el-research-table-scroll" tabIndex={0} role="region" aria-label={t('research.periodTable')}><table>
            <thead><tr><th scope="col">{t('research.period')}</th>{FIELDS.map((field) => <th scope="col" key={field}>{t(`research.${field}` as UiTextKey)}</th>)}<th scope="col">{t('research.source')}</th></tr></thead>
            <tbody>{periods.map((period) => <tr key={`${period.type}-${period.period_end}`} className={period.period_end === selected.period_end ? 'is-selected' : ''}>
              <th scope="row">{fiscalLabel(period)}<small>{period.period_end}</small></th>
              {FIELDS.map((field) => <td key={field}>{amount(period.values[field], language)}<Evidence value={period.values[field]} /></td>)}
              <td><a href={period.filing_url} target="_blank" rel="noreferrer">{period.filing_form} <ArrowUpRight aria-hidden="true" /></a>
                {period.quality_issues.length > 0 && <details className="el-research-quality"><summary>{t('research.missingCount', { count: period.quality_issues.length })}</summary><ul>{period.quality_issues.map((issue) => <li key={issue}>{qualityIssueLabel(issue, t)}</li>)}</ul></details>}
              </td>
            </tr>)}</tbody>
          </table></div>
          <p className="el-research-method">{t('research.qualityNote')}</p>
        </section>
      </>}
    </>}
  </AppPage>;
};

const CompanyResearchPage: React.FC = () => {
  const params = useParams();
  const ticker = (params.ticker || 'NVDA').toUpperCase();
  return <CompanyResearchContent key={ticker} ticker={ticker} />;
};

export default CompanyResearchPage;
