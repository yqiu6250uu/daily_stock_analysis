import { expect, test } from '@playwright/test';

// Synthetic browser fixture: validates interaction and layout, never SEC accuracy.
const filing = 'https://www.sec.gov/Archives/edgar/data/1045810/000104581025000010/filing.htm';
const source = (concept: string, start: string, end: string) => ({
  concept, unit: 'USD', period_start: start, period_end: end, form: '10-K', filed: '2025-02-21',
  accepted: '2025-02-21T12:00:00Z', accession: '0001045810-25-000010', url: filing,
  retrieved_at: '2026-10-27T00:00:00Z',
});
const fact = (value: number, concept: string, start: string, end: string) => ({
  value, unit: 'USD', kind: 'reported', definition: null, sources: [source(concept, start, end)],
});
const year = (fiscalYear: number, start: string, end: string, revenue: number, cash: number) => ({
  type: 'annual', period_start: start, period_end: end, fiscal_year: fiscalYear, fiscal_quarter: null,
  filing_form: '10-K', filing_date: '2025-02-21', acceptance_date: '2025-02-21T12:00:00Z',
  accession: '0001045810-25-000010', filing_url: filing,
  values: {
    revenue: fact(revenue, 'us-gaap:Revenues', start, end),
    net_income: fact(revenue / 4, 'us-gaap:NetIncomeLoss', start, end),
    operating_cash_flow: fact(cash, 'us-gaap:NetCashProvidedByUsedInOperatingActivities', start, end),
    assets: null, liabilities: null, capital_expenditure: null,
  },
  metrics: {
    revenue_growth: fiscalYear === 2025 ? { value: 100, unit: 'percent', kind: 'derived',
      definition: '(Current revenue − comparable prior-year revenue) / comparable prior-year revenue × 100',
      sources: [source('us-gaap:Revenues', start, end)] } : null,
    operating_cash_flow_margin: { value: (cash / revenue) * 100, unit: 'percent', kind: 'derived',
      definition: 'Operating cash flow / revenue × 100', sources: [source('us-gaap:NetCashProvidedByUsedInOperatingActivities', start, end)] },
    net_profit_margin: null,
  },
  quality_issues: ['missing_assets', 'missing_liabilities', 'missing_capital_expenditure'],
});
const company = {
  ticker: 'NVDA', cik: 1045810, company_name: 'SYNTHETIC NVIDIA FIXTURE', currency: 'USD',
  retrieved_at: '2026-10-27T00:00:00Z',
  data_quality: { source: 'TEST FIXTURE ONLY', note: 'No live SEC request', issues_count: 6 },
  periods: [year(2025, '2024-01-29', '2025-01-26', 2_000_000_000, 800_000_000),
    year(2024, '2023-01-30', '2024-01-28', 1_000_000_000, 400_000_000)],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { if (!localStorage.getItem('dsa.uiLanguage')) localStorage.setItem('dsa.uiLanguage', 'en'); });
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (!path.startsWith('/api/')) return route.continue();
    if (path.endsWith('/auth/status')) return route.fulfill({ json: { authEnabled: false, loggedIn: true, setupState: 'no_password' } });
    if (path === '/api/v1/financials/company/NVDA') return route.fulfill({ json: company });
    return route.fulfill({ json: { items: [], total: 0 } });
  });
});

test('comparison follows selected periods and preserves evidence at narrow widths', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/research/NVDA');
  await expect(page.getByRole('heading', { name: 'SYNTHETIC NVIDIA FIXTURE NVDA' })).toBeVisible();
  await page.evaluate(() => { window.location.hash = '#cash-flow'; });
  await expect(page.getByRole('region', { name: 'Revenue and operating cash flow' })).toBeVisible();
  await page.getByRole('button', { name: 'Compare revenue and cash flow' }).click();
  const comparison = page.getByRole('region', { name: 'Revenue and operating cash flow' });
  await expect(comparison.getByText(/FY2025 ↔ FY2024/)).toBeVisible();
  await expect(comparison.getByText('100%')).toBeVisible();
  await comparison.getByText('Reported · Show evidence').first().click();
  await expect(comparison.getByRole('link', { name: /Open original SEC filing/ }).first()).toHaveAttribute('href', filing);
  await page.getByRole('button', { name: 'Operating cash flow', exact: true }).click();
  await expect(page.getByRole('img', { name: /Operating cash flow Historical trend/ })).toBeVisible();
  for (const width of [1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.getByRole('button', { name: 'Switch UI language' }).click();
  await expect(page.getByRole('heading', { name: '收入与经营现金流' })).toBeVisible();
  await page.getByRole('button', { name: '切换主题' }).click();
  await page.getByRole('menuitemradio', { name: '深色' }).click();
  await expect.poll(() => page.locator('html').getAttribute('class')).toContain('dark');
  await page.reload();
  await expect(page.getByRole('region', { name: '收入与经营现金流' })).toBeVisible();
});

test('legacy tool deep links reveal their active navigation item after reload', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/screening');
  await expect(page.getByRole('button', { name: 'Hide market tools' })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('link', { name: 'Screening' })).toBeVisible();
  await page.getByRole('button', { name: 'Hide market tools' }).focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('link', { name: 'Screening' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('link', { name: 'Screening' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('dialog').getByRole('link', { name: 'Screening' })).toBeVisible();
});
