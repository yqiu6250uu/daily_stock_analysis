import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IS_STATIC_DEMO } from '../demo/config';
import { getDemoUniverse, latestSnapshotDate } from '../demo/universeManifest';
import type { DemoUniverse } from '../demo/universeManifest';
import { useUiLanguage } from '../contexts/UiLanguageContext';
import { researchV02Text } from '../i18n/researchV02Text';

const SOURCE_URL = 'https://github.com/yqiu6250uu/daily_stock_analysis/tree/feature/equitylens-foundation';
const UPSTREAM_URL = 'https://github.com/ZhuLinsen/daily_stock_analysis';

export default function AboutEquityLensPage() {
  const { language } = useUiLanguage();
  const copy = researchV02Text[language];
  const [manifest, setManifest] = useState<DemoUniverse | null>(null);
  useEffect(() => { document.title = `${copy.about} · EquityLens`; }, [copy.about]);
  useEffect(() => {
    if (!IS_STATIC_DEMO) return;
    let active = true;
    getDemoUniverse().then((value) => { if (active) setManifest(value); }).catch(() => {});
    return () => { active = false; };
  }, []);
  return <div className="el-v02-page el-v021-about">
    <p className="el-eyebrow">EQUITYLENS / {copy.projectInfo}</p><h1>{copy.about}</h1>
    <p className="el-v02-lead">{copy.aboutLead}</p>
    <div className="el-v021-about-summary"><strong>EquityLens</strong><span>{copy.aboutStatus}</span>
      {manifest && <small>{copy.demoSnapshotDate} · {latestSnapshotDate(manifest, language)}</small>}
    </div>
    <section><p className="el-eyebrow">01 / {copy.aboutWorkflow}</p><h2>{copy.aboutWorkflow}</h2><p>{copy.aboutPurpose}</p><p>{copy.aboutWorkflowDetail}</p>
      <div className="el-v021-workflow">{copy.workflowSteps.map((step, index) => <span key={step} aria-current={index === 4 ? undefined : 'step'}>{step}</span>)}</div>
      <Link to="/questions">{copy.researchQuestions}<ArrowUpRight aria-hidden="true" /></Link></section>
    <section id="methodology"><p className="el-eyebrow">02 / SEC EDGAR</p><h2>{copy.methodology}</h2><p>{copy.aboutDataDetail}</p>
      <p>{copy.comparableBasis}</p><p>{copy.aboutValidation}</p>
      {manifest && <div className="el-v021-manifest"><strong>{copy.verifiedCompanies}</strong>
        {manifest.issuers.map((issuer) => <div key={issuer.ticker}><Link to={`/research/${issuer.ticker}`}>{issuer.ticker} · {issuer.company_name}</Link><span>{issuer.retrieved_at}</span></div>)}
      </div>}</section>
    <section><p className="el-eyebrow">03 / {copy.aboutTechnology}</p><h2>{copy.aboutTechnology}</h2><p>{copy.aboutTechnologyDetail}</p>
      <p>{copy.aboutAttribution} <a href={UPSTREAM_URL} target="_blank" rel="noreferrer">ZhuLinsen/daily_stock_analysis<ArrowUpRight aria-hidden="true" /></a></p>
      <a href={SOURCE_URL} target="_blank" rel="noreferrer">{copy.openSource}<ArrowUpRight aria-hidden="true" /></a></section>
    <section><p className="el-eyebrow">04 / {copy.limitations}</p><h2>{copy.limitations}</h2><p>{copy.aboutStatus}</p>
      <Link to="/tools">{copy.tools}<ArrowUpRight aria-hidden="true" /></Link></section>
  </div>;
}
