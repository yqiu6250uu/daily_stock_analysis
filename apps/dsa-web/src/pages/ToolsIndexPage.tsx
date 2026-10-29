import type React from 'react';
import { Activity, ArrowUpRight, BarChart3, Bell, BriefcaseBusiness, Database, Gauge, MessageSquareQuote, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUiLanguage } from '../contexts/UiLanguageContext';
import { equitylensText } from '../i18n/equitylensText';

const groups = [
  [{ key: 'daily', to: '/tools/daily-analysis', icon: BarChart3 }, { key: 'ask', to: '/chat', icon: MessageSquareQuote }, { key: 'screening', to: '/screening', icon: Search }, { key: 'signals', to: '/decision-signals', icon: Activity }, { key: 'backtest', to: '/backtest', icon: BarChart3 }],
  [{ key: 'portfolio', to: '/portfolio', icon: BriefcaseBusiness }, { key: 'alerts', to: '/alerts', icon: Bell }, { key: 'data', to: '/data', icon: Database }, { key: 'usage', to: '/usage', icon: Gauge }],
] as const;

const ToolsIndexPage: React.FC = () => {
  const { language } = useUiLanguage();
  const copy = equitylensText[language];
  return <div className="el-tools-page">
    <p className="el-eyebrow">{copy.toolsEyebrow}</p>
    <h1>{copy.tools}</h1><p className="el-tools-page-intro">{copy.toolsIntro}</p>
    {groups.map((group, index) => <section key={index} className="el-tools-group">
      <h2>{index === 0 ? copy.toolsGroupAnalysis : copy.toolsGroupMonitoring}</h2>
      <div>{group.map(({ key, to, icon: Icon }) => <Link key={to} to={to} className="el-tool-item"><Icon aria-hidden="true" /><span>{copy[key]}</span><ArrowUpRight aria-hidden="true" /></Link>)}</div>
    </section>)}
  </div>;
};

export default ToolsIndexPage;
