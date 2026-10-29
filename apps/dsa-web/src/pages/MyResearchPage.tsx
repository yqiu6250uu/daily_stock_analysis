import { useEffect, useState } from 'react';
import { ArrowUpRight, Download, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUiLanguage } from '../contexts/UiLanguageContext';
import { researchV02Text } from '../i18n/researchV02Text';
import { clearSavedResearch, hasInvalidSavedResearch, listSavedResearch, removeSavedResearch, savedResearchUrl } from '../demo/researchStore';
import type { SavedResearch } from '../demo/researchStore';

export default function MyResearchPage() {
  const { language } = useUiLanguage();
  const copy = researchV02Text[language];
  const [items, setItems] = useState<SavedResearch[]>(() => listSavedResearch());
  const [invalidRecords, setInvalidRecords] = useState(() => hasInvalidSavedResearch());
  useEffect(() => { document.title = `${copy.myResearch} · EquityLens`; }, [copy.myResearch]);
  function remove(id: string) { removeSavedResearch(id); setItems(listSavedResearch()); }
  function clear() { if (window.confirm(copy.confirmClear)) { clearSavedResearch(); setItems([]); setInvalidRecords(false); } }
  function exportContext(item: SavedResearch) {
    const lines = [`# EquityLens — ${item.ticker}`, '', `${copy.savedAt}: ${item.saved_at}`, `${copy.retrieved}: ${item.retrieved_at}`,
      `${copy.snapshot}: ${item.fact_hash ?? item.retrieved_at}`, `${copy.choosePeriod}: ${item.basis === 'annual' ? copy.annual : copy.quarterly} · ${item.period_end}`,
      `${copy.researchQuestions}: ${item.kind === 'question' ? copy.researchQuestion : copy.viewCompany}`,
      '', copy.storageNotice, copy.staleSaved, '', `${copy.reopen}: ${window.location.origin}${savedResearchUrl(item)}`];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url;
    anchor.download = `equitylens-saved-${item.ticker}-${item.period_end}.md`; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="el-v02-page">
    <p className="el-eyebrow">EQUITYLENS / {copy.myResearch}</p><h1>{copy.myResearch}</h1>
    <p className="el-v02-lead">{copy.storageNotice}</p>
    {invalidRecords && <p className="el-v02-caution" role="status">{copy.invalidSaved}</p>}
    {items.length === 0 ? <div className="el-v02-state"><p>{copy.emptySaved}</p><Link to="/">{copy.returnHome}<ArrowUpRight aria-hidden="true" /></Link></div> : <>
      <div className="el-v02-save-list">{items.map((item) => <article key={item.id}>
        <div><span className="el-v02-status">{item.kind === 'question' ? copy.investigation : copy.viewCompany}</span>
          <h2>{item.ticker}{item.kind === 'question' ? ` · ${copy.researchQuestion}` : ''}</h2>
          <p>{item.basis === 'annual' ? copy.annual : copy.quarterly} · {item.period_end} · {copy.savedAt} {new Date(item.saved_at).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')}</p>
          <small>{copy.retrieved} {item.retrieved_at} · {copy.snapshot} {item.fact_hash?.slice(0, 16) ?? item.retrieved_at}</small><p>{copy.staleSaved}</p></div>
        <div className="el-v02-save-actions"><Link to={savedResearchUrl(item)}>{copy.reopen}<ArrowUpRight aria-hidden="true" /></Link>
          <button type="button" onClick={() => exportContext(item)}><Download aria-hidden="true" />{copy.exportContext}</button>
          <button type="button" onClick={() => remove(item.id)} aria-label={`${copy.remove} ${item.ticker}`}><Trash2 aria-hidden="true" />{copy.remove}</button></div>
      </article>)}</div>
      <button type="button" className="el-v02-clear" onClick={clear}>{copy.clearAll}</button>
    </>}
  </div>;
}
