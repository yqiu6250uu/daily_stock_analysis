import { useCallback, useEffect, useRef, useState } from 'react';
import { IS_STATIC_DEMO } from './config';

type Quote = {
  ticker: string; close: number; trade_date: string; retrieved_at: string;
  field: string; source_url: string; market_timezone: string; adjustment_basis: string;
};

const url = `${import.meta.env.BASE_URL}demo/v02/market-closes.json`;

export default function MarketCloseBadge({ ticker, language }: { ticker: string; language: 'en' | 'zh' }) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [stale, setStale] = useState(false);
  const requestGeneration = useRef(0);

  const recheck = useCallback(async () => {
    const generation = ++requestGeneration.current;
    setQuote(null);
    setState('loading');
    try {
      const response = await fetch(url, { cache: 'no-store', credentials: 'omit' });
      if (!response.ok) throw new Error('Snapshot unavailable');
      const data = await response.json() as { quotes?: Quote[] };
      const row = data.quotes?.find((item) => item.ticker === ticker);
      if (!row || !Number.isFinite(row.close) || row.close <= 0 || row.field !== 'Close/Last' ||
        row.market_timezone !== 'America/New_York' || !row.source_url.startsWith(`https://api.nasdaq.com/api/quote/${ticker}/historical`) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(row.trade_date) || Number.isNaN(Date.parse(row.retrieved_at))) throw new Error('Invalid snapshot');
      if (generation !== requestGeneration.current) return;
      setQuote(row);
      setStale(Date.now() - Date.parse(`${row.trade_date}T21:00:00Z`) > 96 * 60 * 60 * 1000);
      setState('ready');
    } catch { if (generation === requestGeneration.current) { setQuote(null); setState('unavailable'); } }
  }, [ticker]);

  useEffect(() => {
    if (IS_STATIC_DEMO) queueMicrotask(() => void recheck());
    return () => { requestGeneration.current += 1; };
  }, [recheck]);
  if (!IS_STATIC_DEMO) return null;
  return <div className="el-market-close" role="status">
    <span>{language === 'zh' ? '最近归档常规时段收盘' : 'Last archived regular-session close'}</span>
    {quote && <strong>{quote.trade_date} · ${quote.close.toFixed(ticker === 'AMAT' ? 3 : 2)} · {quote.field}</strong>}
    <small>{state === 'loading' ? (language === 'zh' ? '检查站点快照…' : 'Checking published snapshot…') :
      state === 'unavailable' ? (language === 'zh' ? '已发布快照不可用；不显示未核验价格。' : 'Published snapshot unavailable; price withheld.') :
      `${stale ? (language === 'zh' ? '快照已陈旧。' : 'Snapshot is stale. ') : ''}${language === 'zh' ? '非实时；NOCP 与复权口径未核定。' : 'Not live; NOCP and adjustment basis unverified.'}`}</small>
    {quote && <small>{language === 'zh' ? '原始记录抓取' : 'Source retrieved'} {quote.retrieved_at} · America/New_York {language === 'zh' ? '交易日' : 'trade date'}</small>}
    {quote && <a href={quote.source_url} target="_blank" rel="noreferrer">Nasdaq · {language === 'zh' ? '原始记录' : 'source record'}</a>}
    <button type="button" onClick={() => void recheck()}>{language === 'zh' ? '重新检查已发布快照' : 'Recheck published snapshot'}</button>
  </div>;
}
