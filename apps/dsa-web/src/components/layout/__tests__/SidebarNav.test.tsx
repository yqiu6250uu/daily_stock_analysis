import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SidebarNav } from '../SidebarNav';

const mockLogout = vi.fn().mockResolvedValue(undefined);
const mockThemeToggle = vi.fn(({ collapsed }: { collapsed?: boolean }) => (
  <button type="button">{collapsed ? '切换主题(折叠)' : '切换主题'}</button>
));
const completionBadgeState = { value: true };
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ authEnabled: true, logout: mockLogout }),
}));
vi.mock('../../../stores/agentChatStore', () => ({
  useAgentChatStore: (selector: (state: { completionBadge: boolean }) => unknown) =>
    selector({ completionBadge: completionBadgeState.value }),
}));
vi.mock('../../theme/ThemeToggle', () => ({
  ThemeToggle: (props: { collapsed?: boolean }) => mockThemeToggle(props),
}));

describe('SidebarNav research hierarchy', () => {
  beforeEach(() => { window.sessionStorage.clear(); });
  it('shows the EquityLens brand and only real research routes in primary navigation', () => {
    render(<MemoryRouter initialEntries={['/']}><SidebarNav /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'EquityLens' })).toHaveAttribute('href', '/');
    const nav = screen.getByRole('navigation', { name: '主导航' });
    expect(nav.querySelectorAll('a').length).toBe(3);
    expect(screen.getByRole('link', { name: '研究首页' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: '公司研究' })).toHaveAttribute('href', '/research');
    expect(screen.getByRole('link', { name: '市场工具' })).toHaveAttribute('href', '/tools');
    expect(screen.queryByRole('link', { name: '选股' })).not.toBeInTheDocument();
  });

  it('expands legacy tool routes without moving them into primary navigation', () => {
    render(<MemoryRouter initialEntries={['/']}><SidebarNav /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: '展开市场工具' }));
    expect(screen.getByRole('link', { name: '每日分析' })).toHaveAttribute('href', '/tools/daily-analysis');
    expect(screen.getByRole('link', { name: '选股' })).toHaveAttribute('href', '/screening');
    expect(screen.getByRole('link', { name: '数据中心' })).toHaveAttribute('href', '/data');
    expect(screen.getByRole('link', { name: '告警' })).toHaveAttribute('href', '/alerts');
    fireEvent.click(screen.getByRole('button', { name: '收起市场工具' }));
    expect(screen.queryByRole('link', { name: '选股' })).not.toBeInTheDocument();
  });

  it('shows the completion badge inside the expanded Ask route only when pending', () => {
    completionBadgeState.value = true;
    const { rerender } = render(<MemoryRouter initialEntries={['/chat']}><SidebarNav /></MemoryRouter>);
    expect(screen.getByRole('button', { name: '收起市场工具' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('chat-completion-badge')).toBeInTheDocument();
    completionBadgeState.value = false;
    rerender(<MemoryRouter initialEntries={['/chat']}><SidebarNav /></MemoryRouter>);
    expect(screen.queryByTestId('chat-completion-badge')).not.toBeInTheDocument();
  });

  it('reveals an active deep-linked tool after refresh and allows manual collapse', () => {
    const view = render(<MemoryRouter initialEntries={['/screening']}><SidebarNav /></MemoryRouter>);
    expect(screen.getByRole('link', { name: '选股' })).toHaveClass('el-nav-link-active');
    fireEvent.click(screen.getByRole('button', { name: '收起市场工具' }));
    expect(screen.queryByRole('link', { name: '选股' })).not.toBeInTheDocument();
    view.unmount();
    render(<MemoryRouter initialEntries={['/screening']}><SidebarNav /></MemoryRouter>);
    expect(screen.getByRole('link', { name: '选股' })).toHaveClass('el-nav-link-active');
  });

  it('keeps collapsed labels accessible and the theme control usable', () => {
    render(<MemoryRouter initialEntries={['/']}><SidebarNav collapsed /></MemoryRouter>);
    expect(screen.getByRole('link', { name: '研究首页' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '市场工具' })).toBeInTheDocument();
    expect(mockThemeToggle).toHaveBeenCalledWith(expect.objectContaining({ variant: 'nav', collapsed: true }));
  });

  it('marks a company research route active and keeps settings separate', () => {
    render(<MemoryRouter initialEntries={['/research/NVDA']}><SidebarNav /></MemoryRouter>);
    expect(screen.getByRole('link', { name: '公司研究' })).toHaveClass('el-nav-link-active');
    expect(screen.getByRole('link', { name: '设置' })).toHaveAttribute('href', '/settings');
  });

  it('confirms logout before losing an unsaved settings draft', async () => {
    mockLogout.mockClear();
    render(<MemoryRouter initialEntries={['/settings']}><SidebarNav /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: '退出' }));
    expect(await screen.findByText(/退出会丢弃本页未保存的设置/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(mockLogout).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '退出' }));
    fireEvent.click(screen.getByRole('button', { name: '确认退出' }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
