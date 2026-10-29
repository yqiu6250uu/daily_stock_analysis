import type React from 'react';
import { Activity, ArrowUpRight, BarChart3, Bell, BriefcaseBusiness, Database, Filter, Gauge, GitCompareArrows, MessageSquareQuote, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUiLanguage } from '../contexts/UiLanguageContext';
import { equitylensText } from '../i18n/equitylensText';
import { researchV02Text } from '../i18n/researchV02Text';

const groups = [
  [{ key: 'daily', to: '/tools/daily-analysis', icon: BarChart3 }, { key: 'ask', to: '/chat', icon: MessageSquareQuote }, { key: 'screening', to: '/screening', icon: Search }, { key: 'signals', to: '/decision-signals', icon: Activity }, { key: 'backtest', to: '/backtest', icon: BarChart3 }],
  [{ key: 'portfolio', to: '/portfolio', icon: BriefcaseBusiness }, { key: 'alerts', to: '/alerts', icon: Bell }, { key: 'data', to: '/data', icon: Database }, { key: 'usage', to: '/usage', icon: Gauge }],
] as const;

const ToolsIndexPage: React.FC = () => {
  const { language } = useUiLanguage();
  const copy = equitylensText[language];
  const v02 = researchV02Text[language];
  return <div className="el-tools-page">
    <p className="el-eyebrow">{copy.toolsEyebrow}</p>
    <h1>{copy.tools}</h1><p className="el-tools-page-intro">{copy.toolsIntro}</p>
    <section className="el-tools-group"><h2>{v02.publicReady}</h2><p>{v02.toolsScope}</p><div>
      <Link to="/tools/metrics" className="el-tool-item"><BarChart3 aria-hidden="true" /><span>{v02.metrics}</span><ArrowUpRight aria-hidden="true" /></Link>
      <Link to="/tools/compare" className="el-tool-item"><GitCompareArrows aria-hidden="true" /><span>{v02.compare}</span><ArrowUpRight aria-hidden="true" /></Link>
      <Link to="/tools/screener" className="el-tool-item"><Filter aria-hidden="true" /><span>{v02.screener}</span><ArrowUpRight aria-hidden="true" /></Link>
    </div></section>
    {groups.map((group, index) => <section key={index} className="el-tools-group">
      <h2>{index === 0 ? copy.toolsGroupAnalysis : copy.toolsGroupMonitoring}</h2>
      <div>{group.map(({ key, to, icon: Icon }) => <Link key={to} to={to} className="el-tool-item"><Icon aria-hidden="true" /><span>{copy[key]}</span><ArrowUpRight aria-hidden="true" /></Link>)}</div>
    </section>)}
  </div>;
};

export default ToolsIndexPage;
