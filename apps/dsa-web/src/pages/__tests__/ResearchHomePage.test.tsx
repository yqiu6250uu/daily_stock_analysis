import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { secFinancialsApi } from '../../api/secFinancials';
import { UiLanguageProvider } from '../../contexts/UiLanguageContext';
import type { SecFinancialResponse } from '../../types/secFinancials';
import ResearchHomePage from '../ResearchHomePage';

vi.mock('../../api/secFinancials', () => ({ secFinancialsApi: { getCompany: vi.fn() } }));
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null, XAxis: () => null, YAxis: () => null, Tooltip: () => null, Area: () => null,
}));

const source = {
  concept: 'us-gaap:Revenues', unit: 'USD', period_start: '2024-01-29', period_end: '2025-01-26',
  form: '10-K', filed: '2025-02-21', accepted: '2025-02-21T12:00:00Z',
  accession: '0001045810-25-000010', url: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581025000010/filing.htm',
  retrieved_at: '2026-10-27T00:00:00Z',
};
const reported = { value: 2_000_000_000, unit: 'USD' as const, kind: 'reported' as const, definition: null, sources: [source] };
const fixture: SecFinancialResponse = {
  ticker: 'NVDA', cik: 1045810, company_name: 'SYNTHETIC NVIDIA FIXTURE', currency: 'USD',
  retrieved_at: '2026-10-27T00:00:00Z', data_quality: { source: 'Fixture', note: 'Synthetic fixture', issues_count: 0 },
  periods: [{
    type: 'annual', period_start: '2024-01-29', period_end: '2025-01-26', fiscal_year: 2025,
    fiscal_quarter: null, filing_form: '10-K', filing_date: '2025-02-21',
    acceptance_date: source.accepted, accession: source.accession, filing_url: source.url,
    values: { revenue: reported, net_income: { ...reported, value: 500_000_000 } },
    metrics: {}, quality_issues: [],
  }],
};

function renderHome(language: 'en' | 'zh') {
  localStorage.setItem('dsa.uiLanguage', language);
  return render(<MemoryRouter initialEntries={['/']}><UiLanguageProvider><Routes>
    <Route path="/" element={<ResearchHomePage />} />
    <Route path="/research/:ticker" element={<div data-testid="company-route" />} />
  </Routes></UiLanguageProvider></MemoryRouter>);
}

describe('ResearchHomePage', () => {
  it('shows verified-source preview, functional tabs, validation, and bilingual ticker navigation', async () => {
    vi.mocked(secFinancialsApi.getCompany).mockResolvedValue(fixture);
    const view = renderHome('en');
    expect(await screen.findByText('SYNTHETIC NVIDIA FIXTURE')).toBeInTheDocument();
    expect(screen.getByText('2,000,000,000 USD')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Original SEC filing' })).toHaveAttribute('href', source.url);
    expect(screen.getByText('FY2025')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Compare revenue & cash flow' })).toHaveAttribute('href', '/research/NVDA#cash-flow');
    fireEvent.click(screen.getByRole('tab', { name: 'Source evidence' }));
    expect(screen.getAllByText('us-gaap:Revenues')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Research company' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a ticker');
    fireEvent.change(screen.getByRole('textbox', { name: 'Search by ticker' }), { target: { value: '%%%bad' } });
    fireEvent.click(screen.getByRole('button', { name: 'Research company' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Use a US ticker');
    fireEvent.change(screen.getByRole('textbox', { name: 'Search by ticker' }), { target: { value: 'nvda' } });
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search by ticker' }), { key: 'Enter' });
    fireEvent.submit(screen.getByRole('button', { name: 'Research company' }).closest('form')!);
    expect(await screen.findByTestId('company-route')).toBeInTheDocument();
    view.unmount();

    renderHome('zh');
    expect(await screen.findByRole('heading', { name: '让研究随证据深入。' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '研究公司' })).toBeInTheDocument();
    await waitFor(() => expect(secFinancialsApi.getCompany).toHaveBeenCalledTimes(1));
  });
});
