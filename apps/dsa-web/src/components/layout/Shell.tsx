import type React from 'react';
import { useEffect, useState } from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { Drawer } from '../common/Drawer';
import { EquityLensMark } from '../brand/EquityLensMark';
import { SidebarNav } from './SidebarNav';
import { DesktopUpdateIndicator } from './DesktopUpdateIndicator';
import { ThemeToggle } from '../theme/ThemeToggle';
import { UiLanguageToggle } from '../i18n/UiLanguageToggle';
import { useUiLanguage } from '../../contexts/UiLanguageContext';
import { equitylensText } from '../../i18n/equitylensText';
import './equitylens.css';

type ShellProps = { children?: React.ReactNode };

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { language } = useUiLanguage();
  const copy = equitylensText[language];

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const handleResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  return (
    <div className="el-app-shell">
      <header className="el-mobile-header">
        <button type="button" className="el-mobile-menu" aria-label={copy.openNavigation} onClick={() => setMobileOpen(true)}><Menu aria-hidden="true" /></button>
        <Link to="/" className="el-mobile-brand"><EquityLensMark /> <strong>EquityLens</strong></Link>
        <div className="el-mobile-controls"><UiLanguageToggle /><ThemeToggle /></div>
      </header>
      <aside className={`el-sidebar ${collapsed ? 'is-collapsed' : ''}`} aria-label={copy.brandDescriptor}>
        <SidebarNav collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
        <button type="button" className="el-sidebar-collapse" aria-label={collapsed ? copy.expandSidebar : copy.collapseSidebar}
          onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
        </button>
      </aside>
      <div className="el-workspace">
        <div className="el-desktop-update"><DesktopUpdateIndicator /></div>
        <main id="main-content" className="el-workspace-main">{children ?? <Outlet />}</main>
      </div>
      <Drawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} width="max-w-xs" zIndex={90} side="left">
        <div className="el-mobile-drawer"><SidebarNav onNavigate={() => setMobileOpen(false)} /></div>
      </Drawer>
    </div>
  );
};
