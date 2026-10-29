import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Landmark, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { secFinancialsApi } from '../api/secFinancials';
import { useUiLanguage } from '../contexts/UiLanguageContext';
import { equitylensText } from '../i18n/equitylensText';
import type { FinancialPeriod, FinancialValue, SecFinancialResponse } from '../types/secFinancials';

const FEATURED_TICKER = 'NVDA';
const CACHE_MS = 10 * 60 * 1000;
let featuredCache: { value: SecFinancialResponse; at: number } | null = null;
let featuredRequest: Promise<SecFinancialResponse> | null = null;

function getFeatured(force = false): Promise<SecFinancialResponse> {
  if (!force && featuredCache && Date.now() - featuredCache.at < CACHE_MS) return Promise.resolve(featuredCache.value);
  if (featuredRequest) return featuredRequest;
  featuredRequest = secFinancialsApi.getCompany(FEATURED_TICKER).then((value) => {
    featuredCache = { value, at: Date.now() };
    return value;
  }).finally(() => { featuredRequest = null; });
  return featuredRequest;
}

function periodLabel(period: FinancialPeriod): string {
  return period.fiscal_year ? `FY${period.fiscal_year}` : period.period_end;
}

function exactValue(value: FinancialValue | null | undefined, language: 'en' | 'zh'): string {
  if (!value) return '—';
  return `${new Intl.NumberFormat(language === 'zh' ? 'zh-CN' : 'en-US', { maximumFractionDigits: 0 }).format(value.value)} ${value.unit}`;
}

function compactValue(value: FinancialValue | null | undefined, language: 'en' | 'zh'): string {
  if (!value) return '—';
  return new Intl.NumberFormat(language === 'zh' ? 'zh-CN' : 'en-US', { maximumFractionDigits: 2 }).format(value.value / 1_000_000_000);
}

const ResearchHomePage: React.FC = () => {
  const { language } = useUiLanguage();
  const copy = equitylensText[language];
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tab, setTab] = useState<'fundamentals' | 'trends' | 'evidence'>('fundamentals');
  const [data, setData] = useState<SecFinancialResponse | null>(featuredCache?.value ?? null);
  const [loading, setLoading] = useState(!featuredCache);
  const [error, setError] = useState(false);

  useEffect(() => { document.title = `${copy.home} · EquityLens`; }, [copy.home]);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (focused || query || reducedMotion) return undefined;
    const id = window.setInterval(() => setExampleIndex((index) => (index + 1) % copy.searchExamples.length), 3200);
    return () => window.clearInterval(id);
  }, [focused, query, reducedMotion, copy.searchExamples.length]);
  useEffect(() => {
    let active = true;
    getFeatured().then((value) => { if (active) { setData(value); setError(false); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const annual = useMemo(() => data?.periods.filter((period) => period.type === 'annual') ?? [], [data]);
  const latest = annual[0];
  const trend = useMemo(() => [...annual].reverse().filter((period) => period.values.revenue?.value != null).slice(-5).map((period) => ({
    period: periodLabel(period), value: period.values.revenue!.value / 1_000_000_000,
  })), [annual]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ticker = query.trim().toUpperCase();
    if (!ticker) { setSearchError(copy.searchEmpty); return; }
    if (!/^[A-Z][A-Z0-9.-]{0,9}$/.test(ticker)) { setSearchError(copy.searchInvalid); return; }
    navigate(`/research/${encodeURIComponent(ticker)}`);
  }

  async function retryFeatured() {
    setLoading(true);
    setError(false);
    try { setData(await getFeatured(true)); }
    catch { setError(true); }
    finally { setLoading(false); }
  }

  return (
    <div className="el-home">
      <div className="el-home-topline"><span className="el-topline-dot" />{copy.workspace}<span className="el-topline-rule" /><span>SEC EDGAR</span></div>
      <section className="el-hero" aria-labelledby="el-home-title">
        <div className="el-hero-copy">
          <p className="el-eyebrow">{copy.introEyebrow}</p>
          <h1 id="el-home-title">{copy.headline}</h1>
          <p className="el-hero-description">{copy.intro}</p>
        </div>
        <form className="el-search-form" onSubmit={submitSearch} noValidate>
          <label htmlFor="el-ticker-search">{copy.searchLabel}</label>
          <div className={`el-search-field ${focused ? 'is-focused' : ''}`}>
            <Search aria-hidden="true" className="el-search-icon" />
            <div className="el-search-input-wrap">
              {!query && !focused && <span key={exampleIndex} aria-hidden="true" className={`el-search-example ${reducedMotion ? 'no-motion' : ''}`}>{copy.searchExamples[exampleIndex]}</span>}
              <input id="el-ticker-search" type="text" value={query} autoComplete="off" spellCheck={false}
                aria-describedby={searchError ? 'el-search-error' : 'el-search-hint'} aria-invalid={Boolean(searchError)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                onChange={(event) => { setQuery(event.target.value); setSearchError(''); }} />
            </div>
            <button type="submit" className="el-search-submit"><span>{copy.searchButton}</span><ArrowRight aria-hidden="true" /></button>
          </div>
          {searchError ? <p id="el-search-error" role="alert" className="el-search-error">{searchError}</p> : <p id="el-search-hint" className="el-search-hint">{copy.searchHint}</p>}
        </form>
      </section>

      <section className="el-feature" aria-labelledby="el-feature-title">
        <header className="el-feature-head">
          <div><p className="el-eyebrow">{copy.featuredEyebrow}</p><h2 id="el-feature-title">{copy.featuredTitle}</h2><p>{copy.featuredDescription}</p></div>
          <Link to="/research/NVDA" className="el-feature-link">{copy.featuredAction}<ArrowUpRight aria-hidden="true" /></Link>
        </header>
        <div className="el-feature-company">
          <div className="el-company-identity"><span className="el-company-initial">N</span><div><strong>{data?.company_name ?? 'NVIDIA'}</strong><span>NVDA · SEC EDGAR</span></div></div>
          <div className="el-company-context">{latest ? <><strong>{periodLabel(latest)}</strong><span>{latest.period_start} — {latest.period_end} · {latest.filing_form}</span></> : <span>{loading ? copy.dataLoading : copy.period}</span>}</div>
        </div>
        <div className="el-feature-tabs" role="tablist" aria-label={copy.explore}>
          {(['fundamentals', 'trends', 'evidence'] as const).map((key, index, keys) => <button key={key} type="button" role="tab" aria-selected={tab === key}
            tabIndex={tab === key ? 0 : -1} aria-controls="el-feature-panel"
            onClick={() => setTab(key)} onKeyDown={(event) => {
              const next = event.key === 'ArrowRight' ? (index + 1) % keys.length
                : event.key === 'ArrowLeft' ? (index - 1 + keys.length) % keys.length
                  : event.key === 'Home' ? 0 : event.key === 'End' ? keys.length - 1 : -1;
              if (next < 0) return;
              event.preventDefault();
              setTab(keys[next]);
              (event.currentTarget.parentElement?.querySelectorAll('[role="tab"]')[next] as HTMLButtonElement | undefined)?.focus();
            }} className={tab === key ? 'is-active' : ''}>{copy[key]}</button>)}
        </div>
        <div className="el-feature-body" id="el-feature-panel" role="tabpanel">
          {loading && !data ? <div className="el-feature-skeleton" aria-label={copy.dataLoading}><div /><div /><div /></div> : null}
          {error && !data ? <div className="el-feature-state"><p>{copy.dataUnavailable}</p><button type="button" onClick={() => void retryFeatured()}>{copy.retry}<ArrowRight aria-hidden="true" /></button></div> : null}
          {error && data ? <div className="el-feature-stale" role="status">{copy.staleData} <button type="button" onClick={() => void retryFeatured()}>{copy.retry}</button></div> : null}
          {!loading && !error && data && !latest ? <p className="el-feature-state">{copy.dataEmpty}</p> : null}
          {latest && tab === 'fundamentals' && <div className="el-facts-view">
            {(['revenue', 'net_income'] as const).map((field) => <div className="el-fact" key={field}>
              <p>{field === 'revenue' ? copy.revenue : copy.netIncome}<span>{copy.reported}</span></p>
              <strong>{compactValue(latest.values[field], language)} <small>{latest.values[field] ? copy.trendUnit : ''}</small></strong>
              <span className="el-fact-exact">{exactValue(latest.values[field], language)}</span>
            </div>)}
            <div className="el-fact-context"><span>{copy.period}</span><strong>{latest.period_start} — {latest.period_end}</strong><a href={latest.filing_url} target="_blank" rel="noreferrer">{copy.filing}<ArrowUpRight aria-hidden="true" /></a></div>
          </div>}
          {latest && tab === 'trends' && <div className="el-trends-view">
            <div><p className="el-trend-label">{copy.annualTrend}</p><strong>{trend.length} FY</strong><span>{copy.trendUnit}</span></div>
            <div className="el-chart-wrap" role="img" aria-label={`${copy.annualTrend}: ${trend.map((point) => `${point.period} ${point.value.toFixed(2)}`).join(', ')}`}>
              <ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 12, right: 10, bottom: 0, left: -16 }}>
                <CartesianGrid vertical={false} stroke="var(--el-line)" strokeDasharray="4 4" />
                <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: 'var(--el-muted)', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--el-muted)', fontSize: 11 }} width={52} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} USD bn`, copy.revenue]} />
                <Area type="monotone" dataKey="value" stroke="var(--el-navy)" strokeWidth={2.5} fill="var(--el-chart-fill)" dot={{ r: 3, fill: 'var(--el-navy)' }} activeDot={{ r: 5 }} />
              </AreaChart></ResponsiveContainer>
            </div>
          </div>}
          {latest && tab === 'evidence' && <div className="el-evidence-view">
            {(['revenue', 'net_income'] as const).map((field) => <div key={field}><span>{field === 'revenue' ? copy.revenue : copy.netIncome}</span><strong>{latest.values[field]?.sources[0]?.concept ?? '—'}</strong><small>{latest.values[field]?.sources[0]?.unit ?? '—'} · {latest.accession}</small></div>)}
            <a href={latest.filing_url} target="_blank" rel="noreferrer">{copy.filing}<ArrowUpRight aria-hidden="true" /></a>
          </div>}
        </div>
        <footer className="el-feature-foot"><span>{data ? `${copy.retrieved} ${data.retrieved_at}` : copy.dataLoading}</span><span className="el-feature-actions">{latest && <Link to="/research/NVDA#cash-flow">{copy.compareCashFlow}<ArrowRight aria-hidden="true" /></Link>}<Link to="/research/NVDA">{copy.goToCompany}<ArrowRight aria-hidden="true" /></Link></span></footer>
      </section>

      <section className="el-home-bottom"><div className="el-home-bottom-intro"><p className="el-eyebrow">{copy.toolsEyebrow}</p><h2>{copy.toolsTitle}</h2><p>{copy.toolsBody}</p></div><Link to="/tools" className="el-tools-link"><Landmark aria-hidden="true" /><span>{copy.toolsAction}</span><ArrowUpRight aria-hidden="true" /></Link></section>
    </div>
  );
};

export default ResearchHomePage;
