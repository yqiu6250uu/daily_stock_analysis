import type React from 'react';
import { useId, useState } from 'react';
import { Activity, BarChart3, Bell, Bookmark, BriefcaseBusiness, ChevronDown, Database, FileSearch, Filter, Gauge, GitCompareArrows, Home, LogOut, MessageSquareQuote, Search, Settings2 } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { EquityLensMark } from '../brand/EquityLensMark';
import { useAuth } from '../../contexts/AuthContext';
import { useAgentChatStore } from '../../stores/agentChatStore';
import { useUiLanguage } from '../../contexts/UiLanguageContext';
import { equitylensText } from '../../i18n/equitylensText';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { StatusDot } from '../common/StatusDot';
import { UiLanguageToggle } from '../i18n/UiLanguageToggle';
import { ThemeToggle } from '../theme/ThemeToggle';
import { IS_STATIC_DEMO } from '../../demo/config';
import { researchV02Text } from '../../i18n/researchV02Text';

type SidebarNavProps = { collapsed?: boolean; onNavigate?: () => void; variant?: 'default' | 'rail' };
type ToolKey = 'daily' | 'ask' | 'screening' | 'portfolio' | 'signals' | 'backtest' | 'alerts' | 'data' | 'usage';
const TOOLS_PREFERENCE_KEY = 'equitylens.marketToolsExpanded';
const TOOL_LINKS: Array<{ key: ToolKey; to: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'daily', to: '/tools/daily-analysis', icon: BarChart3 },
  { key: 'ask', to: '/chat', icon: MessageSquareQuote },
  { key: 'screening', to: '/screening', icon: Search },
  { key: 'portfolio', to: '/portfolio', icon: BriefcaseBusiness },
  { key: 'signals', to: '/decision-signals', icon: Activity },
  { key: 'backtest', to: '/backtest', icon: BarChart3 },
  { key: 'alerts', to: '/alerts', icon: Bell },
  { key: 'data', to: '/data', icon: Database },
  { key: 'usage', to: '/usage', icon: Gauge },
];
const TOOL_GROUPS = [
  { label: 'toolsGroupAnalysis', keys: ['daily', 'ask', 'screening', 'signals', 'backtest'] },
  { label: 'toolsGroupMonitoring', keys: ['portfolio', 'alerts', 'data', 'usage'] },
] as const;

export const SidebarNav: React.FC<SidebarNavProps> = ({ collapsed = false, onNavigate }) => {
  const { authEnabled, logout } = useAuth();
  const location = useLocation();
  const { language, t } = useUiLanguage();
  const copy = equitylensText[language];
  const v02 = researchV02Text[language];
  const completionBadge = useAgentChatStore((state) => state.completionBadge);
  const toolsId = useId();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [savedExpansion, setSavedExpansion] = useState(() => {
    try { return window.sessionStorage.getItem(TOOLS_PREFERENCE_KEY) === 'true'; }
    catch { return false; }
  });
  const [routeOverride, setRouteOverride] = useState<{ path: string; expanded: boolean } | null>(null);
  const isToolRoute = location.pathname.startsWith('/tools') || TOOL_LINKS.some(({ to }) => location.pathname === to);
  const toolsExpanded = routeOverride?.path === location.pathname ? routeOverride.expanded : isToolRoute || savedExpansion;
  const showToolLinks = !collapsed && toolsExpanded;
  const toggleTools = () => {
    const expanded = !toolsExpanded;
    setRouteOverride({ path: location.pathname, expanded });
    setSavedExpansion(expanded);
    try { window.sessionStorage.setItem(TOOLS_PREFERENCE_KEY, String(expanded)); }
    catch { /* Storage may be disabled; route-local disclosure still works. */ }
  };

  const navLink = (to: string, label: string, Icon: React.ComponentType<{ className?: string }>, exact = false) => (
    <NavLink key={to} to={to} end={exact} onClick={onNavigate} aria-label={label}
      className={({ isActive }) => `el-nav-link ${isActive ? 'el-nav-link-active' : ''} ${collapsed ? 'el-nav-link-compact' : ''}`}>
      <Icon className="el-nav-icon" aria-hidden="true" />
      {!collapsed && <span>{label}</span>}
      {to === '/chat' && completionBadge && <StatusDot tone="info" data-testid="chat-completion-badge" aria-label={t('layout.newChatMessage')} className="el-nav-badge" />}
    </NavLink>
  );

  return (
    <div className={`el-sidebar-content ${collapsed ? 'is-collapsed' : ''}`}>
      <NavLink to="/" onClick={onNavigate} className="el-brand" aria-label="EquityLens">
        <span className="el-brand-mark"><EquityLensMark /></span>
        {!collapsed && <span className="el-brand-word"><strong>EquityLens</strong><small>{copy.brandDescriptor}</small></span>}
      </NavLink>
      <div className="el-nav-scroll">
        <nav aria-label={t('layout.mainNav')} className="el-nav-primary">
          {!collapsed && <p className="el-nav-caption">{copy.primary}</p>}
          {navLink('/', copy.home, Home, true)}
          {navLink('/research', copy.company, FileSearch)}
          {navLink('/my-research', v02.myResearch, Bookmark)}
          <><div className="el-nav-divider" />
          {!collapsed && <p className="el-nav-caption">{copy.secondary}</p>}
          <div className="el-nav-tool-row">
            <NavLink to="/tools" end onClick={onNavigate} aria-label={copy.tools}
              className={({ isActive }) => `el-nav-link ${isActive || isToolRoute ? 'el-nav-link-active' : ''} ${collapsed ? 'el-nav-link-compact' : ''}`}>
              <BarChart3 className="el-nav-icon" aria-hidden="true" />
              {!collapsed && <span>{copy.tools}</span>}
            </NavLink>
            {!collapsed && <button type="button" className="el-nav-expand" aria-label={toolsExpanded ? copy.collapseTools : copy.expandTools}
              aria-expanded={toolsExpanded} aria-controls={toolsId} onClick={toggleTools}>
              <ChevronDown aria-hidden="true" className={toolsExpanded ? 'is-open' : ''} />
            </button>}
          </div>
          {showToolLinks && <div id={toolsId} className="el-nav-tools" aria-label={copy.tools}>
            {IS_STATIC_DEMO ? <div className="el-nav-tools-group" role="group" aria-label={copy.toolsGroupAnalysis}>
              <span className="el-nav-tools-caption" aria-hidden="true">{copy.toolsGroupAnalysis}</span>
              {navLink('/tools/metrics', v02.metrics, BarChart3)}
              {navLink('/tools/compare', v02.compare, GitCompareArrows)}
              {navLink('/tools/screener', v02.screenerShort, Filter)}
            </div> : TOOL_GROUPS.map((group) => <div key={group.label} className="el-nav-tools-group" role="group" aria-label={copy[group.label]}>
              <span className="el-nav-tools-caption" aria-hidden="true">{copy[group.label]}</span>
              {group.keys.map((key) => { const item = TOOL_LINKS.find((link) => link.key === key)!; return navLink(item.to, copy[item.key], item.icon); })}
            </div>)}
          </div>}</>
        </nav>
        {!collapsed && <div className="el-sidebar-note"><span className="el-sidebar-note-line" />{IS_STATIC_DEMO ? copy.demoSidebarNote : copy.searchHint}</div>}
      </div>
      <div className="el-nav-bottom">
        {!IS_STATIC_DEMO && <NavLink to="/settings" onClick={onNavigate} aria-label={copy.settings}
          className={({ isActive }) => `el-nav-link ${isActive ? 'el-nav-link-active' : ''} ${collapsed ? 'el-nav-link-compact' : ''}`}>
          <Settings2 className="el-nav-icon" aria-hidden="true" />{!collapsed && <span>{copy.settings}</span>}
        </NavLink>}
        <div className="el-sidebar-controls">
          <UiLanguageToggle variant="nav" collapsed={collapsed} triggerClassName={`el-nav-link ${collapsed ? 'el-nav-link-compact' : ''}`} iconClassName="el-nav-icon" labelClassName="el-control-label" />
          <ThemeToggle variant="nav" collapsed={collapsed} triggerClassName={`el-nav-link ${collapsed ? 'el-nav-link-compact' : ''}`} iconClassName="el-nav-icon" labelClassName="el-control-label" />
        </div>
        {authEnabled && <button type="button" className={`el-nav-link ${collapsed ? 'el-nav-link-compact' : ''}`} onClick={() => setShowLogoutConfirm(true)}>
          <LogOut className="el-nav-icon" aria-hidden="true" />{!collapsed && <span>{t('layout.logout')}</span>}
        </button>}
      </div>
      <ConfirmDialog isOpen={showLogoutConfirm} title={t('layout.logoutTitle')}
        message={t(/^\/settings\/?$/.test(location.pathname) ? 'layout.logoutSettingsMessage' : 'layout.logoutMessage')}
        confirmText={t('layout.logoutConfirm')} cancelText={t('common.cancel')} isDanger
        onConfirm={() => { setShowLogoutConfirm(false); onNavigate?.(); void logout(); }}
        onCancel={() => setShowLogoutConfirm(false)} />
    </div>
  );
};
