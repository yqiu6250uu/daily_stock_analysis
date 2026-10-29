import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, BarChart3, FileSearch, Filter, GitCompareArrows } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { secFinancialsApi } from '../api/secFinancials';
import { IS_STATIC_DEMO, VERIFIED_DEMO_TICKERS } from '../demo/config';
import { useUiLanguage } from '../contexts/UiLanguageContext';
import { researchV02Text } from '../i18n/researchV02Text';
import type { FinancialPeriod, SecFinancialResponse } from '../types/secFinancials';

type Mode = 'index' | 'metrics' | 'compare' | 'screener';
const LEGACY = [
  { en: 'Daily Stock Analysis and Market Review', zh: '每日分析与大盘复盘', path: '/tools/daily-analysis' },
  { en: 'Screening and Backtesting', zh: '选股与回测', path: '/screening' },
  { en: 'Portfolio and Alerts', zh: '持仓与告警', path: '/portfolio' },
  { en: 'AI Signals and Ask', zh: 'AI 建议与问股', path: '/decision-signals' },
  { en: 'Data Center', zh: '数据中心', path: '/data' },
];
let companyRequest: Promise<SecFinancialResponse[]> | null = null;
function loadUniverse(): Promise<SecFinancialResponse[]> {
  if (!IS_STATIC_DEMO) return Promise.all(VERIFIED_DEMO_TICKERS.map((ticker) => secFinancialsApi.getCompany(ticker)));
  companyRequest ??= Promise.all(VERIFIED_DEMO_TICKERS.map((ticker) => secFinancialsApi.getCompany(ticker)))
    .catch((error: unknown) => { companyRequest = null; throw error; });
  return companyRequest;
}
function latestAnnual(company: SecFinancialResponse): FinancialPeriod | undefined {
  return company.periods.find((period) => period.type === 'annual');
}
function amount(value: number | undefined | null, language: 'en' | 'zh'): string {
  return value == null ? '—' : new Intl.NumberFormat(language === 'zh' ? 'zh-CN' : 'en-US', { maximumFractionDigits: 0 }).format(value);
}

export default function ResearchToolsPage({ mode }: { mode: Mode }) {
  const { language } = useUiLanguage();
  const copy = researchV02Text[language];
  const [companies, setCompanies] = useState<SecFinancialResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [ticker, setTicker] = useState<string>('NVDA');
  const [metric, setMetric] = useState<'revenue' | 'net_income' | 'operating_cash_flow'>('revenue');
  const [basis, setBasis] = useState<'annual' | 'quarterly'>('annual');
  const [minRevenue, setMinRevenue] = useState('0');
  const [positiveCash, setPositiveCash] = useState(false);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([...VERIFIED_DEMO_TICKERS]);
  const [sortBy, setSortBy] = useState<'ticker' | 'revenue'>('ticker');
  useEffect(() => { document.title = `${copy.tools} · EquityLens`; }, [copy.tools]);
  useEffect(() => {
    let active = true;
    loadUniverse().then((value) => { if (active) { setCompanies(value); setError(false); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  const selected = companies.find((company) => company.ticker === ticker);
  const chartData = useMemo(() => (selected?.periods ?? []).filter((period) => period.type === basis)
    .slice(0, basis === 'annual' ? 6 : 10).reverse().map((period) => ({
      label: period.fiscal_year ? `FY${period.fiscal_year}${period.fiscal_quarter ? ` Q${period.fiscal_quarter}` : ''}` : period.period_end,
      value: period.values[metric]?.value ?? null, end: period.period_end,
    })), [selected, basis, metric]);
  const minimum = Number(minRevenue);
  const invalidMinimum = !Number.isFinite(minimum) || minimum < 0;
  const screened = companies.filter((company) => {
    const period = latestAnnual(company);
    const revenue = period?.values.revenue?.value;
    const cash = period?.values.operating_cash_flow?.value;
    return !invalidMinimum && revenue != null && revenue >= minimum * 1_000_000_000 && (!positiveCash || (cash != null && cash > 0));
  }).sort((a, b) => sortBy === 'ticker' ? a.ticker.localeCompare(b.ticker) :
    (latestAnnual(b)?.values.revenue?.value ?? -Infinity) - (latestAnnual(a)?.values.revenue?.value ?? -Infinity));
  const compared = companies.filter((company) => selectedTickers.includes(company.ticker));

  return <div className="el-v02-page el-v02-tools">
    <p className="el-eyebrow">EQUITYLENS / SEC EDGAR</p>
    <h1>{mode === 'index' ? copy.tools : mode === 'metrics' ? copy.metrics : mode === 'compare' ? copy.compare : copy.screener}</h1>
    <p className="el-v02-lead">{copy.toolsIntro} {copy.toolsScope}</p>
    <nav className="el-v02-tool-tabs" aria-label={copy.tools}>
      {([['/tools', copy.tools], ['/tools/metrics', copy.metrics], ['/tools/compare', copy.compare], ['/tools/screener', copy.screener]] as const)
        .map(([path, title]) => <Link key={path} to={path} aria-current={(mode === 'index' ? path === '/tools' : path.endsWith(mode)) ? 'page' : undefined}>{title}</Link>)}
    </nav>
    {loading && <div className="el-v02-state" role="status">{copy.loading}</div>}
    {error && <div className="el-v02-state" role="alert">{copy.noData} <button type="button" onClick={() => { setLoading(true); setRetry((value) => value + 1); }}>{copy.retry}</button></div>}
    {!loading && !error && <>
      {mode === 'index' && <><div className="el-v02-tool-grid">
        <Link to="/tools/metrics"><BarChart3 aria-hidden="true" /><span>{copy.publicReady}</span><h2>{copy.metrics}</h2><p>{copy.toolsScope}</p><ArrowUpRight aria-hidden="true" /></Link>
        <Link to="/tools/compare"><GitCompareArrows aria-hidden="true" /><span>{copy.publicReady}</span><h2>{copy.compare}</h2><p>{copy.fiscalCaution}</p><ArrowUpRight aria-hidden="true" /></Link>
        <Link to="/tools/screener"><Filter aria-hidden="true" /><span>{copy.publicReady}</span><h2>{copy.screener}</h2><p>{copy.toolsScope}</p><ArrowUpRight aria-hidden="true" /></Link>
      </div><h2>{copy.unavailableTools}</h2><p>{copy.unavailableHint}</p><div className="el-v02-legacy-list">
        {LEGACY.map((item) => <div key={item.path}><span>{language === 'zh' ? item.zh : item.en}</span>
          {IS_STATIC_DEMO ? <small>{copy.localOnly}</small> : <Link to={item.path}>{copy.openTool}<ArrowUpRight aria-hidden="true" /></Link>}</div>)}
      </div></>}
      {mode === 'metrics' && <><div className="el-v02-filters">
        <label>{copy.viewCompany}<select value={ticker} onChange={(event) => setTicker(event.target.value)}>{companies.map((company) => <option key={company.ticker} value={company.ticker}>{company.company_name} · {company.ticker}</option>)}</select></label>
        <label>{copy.selectMetric}<select value={metric} onChange={(event) => setMetric(event.target.value as typeof metric)}><option value="revenue">{copy.revenue}</option><option value="net_income">{copy.income}</option><option value="operating_cash_flow">{copy.cash}</option></select></label>
        <div role="group" aria-label={copy.choosePeriod}><button type="button" aria-pressed={basis === 'annual'} onClick={() => setBasis('annual')}>{copy.annual}</button><button type="button" aria-pressed={basis === 'quarterly'} onClick={() => setBasis('quarterly')}>{copy.quarterly}</button></div>
      </div><p className="el-v02-caution">{copy.fiscalCaution}</p>
        <p className="el-v02-caution">{copy.usdBillions} · {copy.retrieved} {selected?.retrieved_at ?? '—'}</p>
        <div className="el-v02-tool-chart" role="img" aria-label={`${ticker} ${metric}: ${chartData.map((item) => `${item.label} ${item.value ?? '—'} USD`).join(', ')}`}>
          <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><CartesianGrid vertical={false} stroke="var(--el-line)" /><XAxis dataKey="label" /><YAxis tickFormatter={(value: number) => `${Math.round(value / 1_000_000_000)}`} /><Tooltip formatter={(value) => `${amount(Number(value), language)} USD`} /><Line dataKey="value" stroke="var(--el-action)" strokeWidth={2.5} isAnimationActive={false} connectNulls={false} /></LineChart></ResponsiveContainer>
        </div><div className="el-v02-table-wrap" tabIndex={0} role="region" aria-label={copy.metrics}><table><thead><tr><th>{copy.choosePeriod}</th><th>{copy[metric === 'net_income' ? 'income' : metric === 'operating_cash_flow' ? 'cash' : 'revenue']}</th><th>{copy.originalFiling}</th></tr></thead><tbody>{selected?.periods.filter((item) => item.type === basis).map((item) => <tr key={item.period_end}><td>{item.period_start} → {item.period_end}</td><td>{amount(item.values[metric]?.value, language)} USD</td><td><a href={item.filing_url} target="_blank" rel="noreferrer">{item.filing_form}<ArrowUpRight aria-hidden="true" /></a></td></tr>)}</tbody></table></div></>}
      {(mode === 'compare' || mode === 'screener') && <>
        {mode === 'screener' && <><div className="el-v02-filters"><label>{copy.minRevenue}<input type="number" min="0" step="1" value={minRevenue} aria-invalid={invalidMinimum} onChange={(event) => setMinRevenue(event.target.value)} /></label><label className="el-v02-check"><input type="checkbox" checked={positiveCash} onChange={(event) => setPositiveCash(event.target.checked)} />{copy.positiveCash}</label><label>{copy.sortBy}<select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}><option value="ticker">{copy.sortTicker}</option><option value="revenue">{copy.sortRevenue}</option></select></label></div>{invalidMinimum && <p role="alert" className="el-search-error">{copy.invalidMinimum}</p>}</>}
        {mode === 'compare' && <fieldset className="el-v021-compare-select"><legend>{copy.selectCompare}</legend>{companies.map((company) => <label key={company.ticker}><input type="checkbox" checked={selectedTickers.includes(company.ticker)} onChange={(event) => setSelectedTickers((current) => event.target.checked ? [...current, company.ticker] : current.filter((item) => item !== company.ticker))} />{company.ticker}</label>)}</fieldset>}
        <p className="el-v02-caution">{copy.fiscalCaution} {copy.missingData}</p><p className="el-v02-caution">{copy.screenedCount}: {companies.length}</p><h2>{mode === 'screener' ? copy.results : copy.compare} · {mode === 'screener' ? screened.length : compared.length}</h2>
        {(mode === 'screener' ? screened : compared).length === 0 ? <p>{copy.noMatches}</p> : <div className="el-v02-table-wrap" tabIndex={0} role="region" aria-label={copy.compare}><table><thead><tr><th>{copy.viewCompany}</th><th>{copy.choosePeriod}</th><th>{copy.revenue}</th><th>{copy.income}</th><th>{copy.cash}</th><th>{copy.retrieved}</th><th>{copy.originalFiling}</th></tr></thead><tbody>{(mode === 'screener' ? screened : compared).map((company) => { const period = latestAnnual(company); return <tr key={company.ticker}><th><Link to={`/research/${company.ticker}`}>{company.company_name} · {company.ticker}</Link><details><summary>{copy.evidence}</summary><small>{(['revenue', 'net_income', 'operating_cash_flow'] as const).map((field) => `${period?.values[field]?.sources[0]?.concept ?? '—'} (${period?.values[field]?.sources[0]?.unit ?? '—'})`).join(' · ')}</small></details></th><td>{period ? `FY${period.fiscal_year} · ${period.period_start} → ${period.period_end}` : '—'}</td><td>{amount(period?.values.revenue?.value, language)} USD</td><td>{amount(period?.values.net_income?.value, language)} USD</td><td>{amount(period?.values.operating_cash_flow?.value, language)} USD</td><td>{company.retrieved_at}</td><td>{period && <a href={period.filing_url} target="_blank" rel="noreferrer">{period.filing_form}<ArrowUpRight aria-hidden="true" /></a>}</td></tr>; })}</tbody></table></div>}
      </>}
      <div className="el-v02-tools-foot"><FileSearch aria-hidden="true" /><Link to="/research/NVDA">{copy.investigate}<ArrowUpRight aria-hidden="true" /></Link></div>
    </>}
  </div>;
}
