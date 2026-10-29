import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { secFinancialsApi } from '../../api/secFinancials';
import { UiLanguageProvider } from '../../contexts/UiLanguageContext';
import type { SecFinancialResponse } from '../../types/secFinancials';
import CompanyResearchPage from '../CompanyResearchPage';

vi.mock('../../api/secFinancials', () => ({ secFinancialsApi: { getCompany: vi.fn() } }));
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null, XAxis: () => null, YAxis: () => null, Tooltip: () => null, Line: () => null,
}));

const source = {
  concept: 'us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax', unit: 'USD',
  period_start: '2024-01-29', period_end: '2025-01-26', form: '10-K', filed: '2025-02-21',
  accepted: '2025-02-21T12:00:00Z', accession: '0001045810-25-000010',
  url: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581025000010/filing.htm',
  retrieved_at: '2026-10-27T00:00:00Z',
};
const reported = { value: 2_000_000_000, unit: 'USD' as const, kind: 'reported' as const, definition: null, sources: [source] };
const productiveAssets = {
  ...reported, value: 6_042_000_000,
  definition: 'SEC productive-assets cash outflow includes property, plant and equipment, software, and other intangible assets.',
  sources: [{ ...source, concept: 'us-gaap:PaymentsToAcquireProductiveAssets' }],
};
const fixture: SecFinancialResponse = {
  ticker: 'NVDA', cik: 1045810, company_name: 'SYNTHETIC NVIDIA FIXTURE', currency: 'USD',
  retrieved_at: '2026-10-27T00:00:00Z',
  data_quality: { source: 'SEC EDGAR CompanyFacts and Submissions', note: 'Synthetic fixture', issues_count: 3 },
  periods: [{
    type: 'annual', period_start: '2024-01-29', period_end: '2025-01-26', fiscal_year: 2025,
    fiscal_quarter: null, filing_form: '10-K', filing_date: '2025-02-21',
    acceptance_date: '2025-02-21T12:00:00Z', accession: source.accession, filing_url: source.url,
    values: { revenue: reported, net_income: { ...reported, value: 500_000_000 }, assets: null,
      liabilities: null, operating_cash_flow: null, capital_expenditure: productiveAssets },
    metrics: { revenue_growth: null, net_profit_margin: {
      value: 25, unit: 'percent', kind: 'derived', definition: 'Net income / revenue × 100', sources: [source],
    }, operating_cash_flow_margin: null },
    quality_issues: ['missing_assets', 'missing_liabilities', 'missing_operating_cash_flow'],
  }],
};

function renderPage(language: 'en' | 'zh' = 'zh', path = '/research/NVDA') {
  window.localStorage.setItem('dsa.uiLanguage', language);
  return render(<MemoryRouter initialEntries={[path]}><UiLanguageProvider><Routes>
    <Route path="/research/:ticker" element={<CompanyResearchPage />} />
  </Routes></UiLanguageProvider></MemoryRouter>);
}

describe('CompanyResearchPage', () => {
  beforeEach(() => { vi.clearAllMocks(); window.localStorage.clear(); });

  it('renders Chinese reported values, calculated values, missing indicators and SEC evidence', async () => {
    vi.mocked(secFinancialsApi.getCompany).mockResolvedValue(fixture);
    renderPage();
    expect(await screen.findByRole('heading', { name: '公司财务研究' })).toBeInTheDocument();
    expect(screen.getByText(/SYNTHETIC NVIDIA FIXTURE/)).toBeInTheDocument();
    expect(screen.getAllByText('2,000,000,000').length).toBeGreaterThan(0);
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    const evidence = screen.getAllByText(/申报值 · 展开证据/)[0].closest('details');
    expect(evidence).not.toBeNull();
    fireEvent.click(within(evidence!).getByText(/申报值 · 展开证据/));
    expect(within(evidence!).getByRole('link', { name: /查看 SEC 原始申报/ })).toHaveAttribute('href', source.url);
    const capexCard = within(screen.getByRole('region', { name: '财务概览' }))
      .getByText('资本开支 / 生产性资产购置').parentElement!;
    fireEvent.click(within(capexCard).getByText(/申报值 · 展开证据/));
    expect(within(capexCard).getByText(/SEC 生产性资产购置现金流包含/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('3 项缺失或存疑'));
    expect(screen.getByText('缺失: 总资产')).toBeInTheDocument();
    expect(screen.getByRole('table').parentElement).toHaveClass('el-research-table-scroll');
    expect(screen.getByRole('button', { name: '季度' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: '季度' }));
    expect(screen.getByText('暂无可核验的申报期间')).toBeInTheDocument();
  });

  it('renders English content and purposeful search', async () => {
    vi.mocked(secFinancialsApi.getCompany).mockResolvedValue(fixture);
    renderPage('en');
    expect(await screen.findByRole('heading', { name: 'Company financial research' })).toBeInTheDocument();
    expect(screen.getByText('Financial snapshot · FY2025')).toBeInTheDocument();
    expect(screen.getAllByText(/Reported · Show evidence/).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('Company ticker'), { target: { value: 'AAPL' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => expect(secFinancialsApi.getCompany).toHaveBeenCalledWith('AAPL'));
  });

  it('keeps section numbering sequential when the optional comparison opens', async () => {
    vi.mocked(secFinancialsApi.getCompany).mockResolvedValue(fixture);
    renderPage('en');
    expect(await screen.findByText('04 / Source and quality')).toBeInTheDocument();
    expect(screen.queryByText('05 / Source and quality')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Compare revenue and cash flow' }));
    expect(screen.getByText('04 / Financial comparison')).toBeInTheDocument();
    expect(screen.getByText('05 / Source and quality')).toBeInTheDocument();
    expect(screen.getByRole('table').parentElement).toHaveAttribute('tabindex', '0');
  });

  it('distinguishes configuration failure from loading and empty data', async () => {
    vi.mocked(secFinancialsApi.getCompany).mockRejectedValueOnce({ response: { data: { error: 'sec_not_configured' } } });
    renderPage('en');
    expect(await screen.findByText('SEC contact email required')).toBeInTheDocument();
    expect(screen.getByText(/SEC_CONTACT_EMAIL/)).toBeInTheDocument();
    vi.mocked(secFinancialsApi.getCompany).mockResolvedValueOnce({ ...fixture, periods: [] });
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('No verifiable filing periods')).toBeInTheDocument();
  });

  it('compares only matching SEC concepts across fiscal years and keeps source evidence nearby', async () => {
    const cashSource = { ...source, concept: 'us-gaap:NetCashProvidedByUsedInOperatingActivities' };
    const priorSource = { ...source, period_start: '2023-01-30', period_end: '2024-01-28', accession: '0001045810-24-000010' };
    const priorCashSource = { ...priorSource, concept: cashSource.concept };
    const current = fixture.periods[0];
    const comparison: SecFinancialResponse = { ...fixture, periods: [
      { ...current, values: { ...current.values, operating_cash_flow: { ...reported, value: 800_000_000, sources: [cashSource] } },
        metrics: { ...current.metrics, revenue_growth: { value: 100, unit: 'percent', kind: 'derived', definition: '(Current revenue − comparable prior-year revenue) / comparable prior-year revenue × 100', sources: [source, priorSource] },
          operating_cash_flow_margin: { value: 40, unit: 'percent', kind: 'derived', definition: 'Operating cash flow / revenue × 100', sources: [cashSource, source] } } },
      { ...current, period_start: '2023-01-30', period_end: '2024-01-28', fiscal_year: 2024, accession: priorSource.accession, filing_url: priorSource.url,
        values: { ...current.values, revenue: { ...reported, value: 1_000_000_000, sources: [priorSource] }, operating_cash_flow: { ...reported, value: 400_000_000, sources: [priorCashSource] } }, metrics: {} },
    ] };
    vi.mocked(secFinancialsApi.getCompany).mockResolvedValue(comparison);
    renderPage('en', '/research/NVDA#cash-flow');
    const section = await screen.findByRole('region', { name: 'Revenue and operating cash flow' });
    expect(within(section).getByText(/FY2025 ↔ FY2024/)).toBeInTheDocument();
    expect(within(section).getAllByText('800,000,000 USD').length).toBeGreaterThan(0);
    expect(within(section).getByText('100%')).toBeInTheDocument();
    expect(within(section).getByText('40%')).toBeInTheDocument();
    fireEvent.click(within(section).getAllByText(/Reported · Show evidence/)[0]);
    expect(within(section).getAllByRole('link', { name: /Open original SEC filing/ })[0]).toHaveAttribute('href', source.url);
  });

  it('does not imply a comparable change when the source concept differs', async () => {
    const current = fixture.periods[0];
    const comparison: SecFinancialResponse = { ...fixture, periods: [current, {
      ...current, period_start: '2023-01-30', period_end: '2024-01-28', fiscal_year: 2024,
      values: { ...current.values, revenue: { ...reported, value: 1_000_000_000, sources: [{ ...source, concept: 'us-gaap:OtherRevenueConcept' }] } }, metrics: {},
    }] };
    vi.mocked(secFinancialsApi.getCompany).mockResolvedValue(comparison);
    renderPage('en');
    fireEvent.click(await screen.findByRole('button', { name: 'Compare revenue and cash flow' }));
    const section = screen.getByRole('region', { name: 'Revenue and operating cash flow' });
    expect(within(section).getAllByText(/No comparable reported value/).length).toBeGreaterThan(0);
    expect(within(section).queryByText('Revenue growth YoY:')).not.toBeInTheDocument();
  });
});
