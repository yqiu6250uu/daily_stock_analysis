import { expect, test } from '@playwright/test';

// Deliberately synthetic. This fixture checks browser behavior, not SEC facts.
const source = {
  concept: 'us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax', unit: 'USD',
  period_start: '2024-01-29', period_end: '2025-01-26', form: '10-K',
  filed: '2025-02-21', accepted: '2025-02-21T12:00:00Z',
  accession: '0001045810-25-000010',
  url: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581025000010/filing.htm',
  retrieved_at: '2026-10-27T00:00:00Z',
};
const reported = (value: number) => ({ value, unit: 'USD', kind: 'reported', definition: null, sources: [source] });
const annual = (year: number, end: string, revenue: number, income: number) => ({
  type: 'annual', period_start: year === 2025 ? '2024-01-29' : '2023-01-30', period_end: end,
  fiscal_year: year, fiscal_quarter: null, filing_form: '10-K', filing_date: '2025-02-21',
  acceptance_date: '2025-02-21T12:00:00Z', accession: source.accession, filing_url: source.url,
  values: { revenue: reported(revenue), net_income: reported(income), assets: null, liabilities: null,
    operating_cash_flow: null, capital_expenditure: null },
  metrics: { revenue_growth: null, net_profit_margin: {
    value: (income / revenue) * 100, unit: 'percent', kind: 'derived',
    definition: 'Net income / revenue × 100', sources: [source],
  }, operating_cash_flow_margin: null },
  quality_issues: ['missing_assets', 'missing_liabilities', 'missing_operating_cash_flow', 'missing_capital_expenditure'],
});
const company = {
  ticker: 'NVDA', cik: 1045810, company_name: 'SYNTHETIC TEST DATA — NOT SEC REPORTED',
  currency: 'USD', retrieved_at: '2026-10-27T00:00:00Z',
  data_quality: { source: 'TEST FIXTURE ONLY', note: 'No live SEC request', issues_count: 8 },
  periods: [annual(2025, '2025-01-26', 2_000_000_000, 500_000_000),
    annual(2024, '2024-01-28', 1_000_000_000, 200_000_000)],
};

test('synthetic company research stays usable on desktop and mobile in both languages', async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('dsa.uiLanguage', 'zh'));
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (!path.startsWith('/api/')) return route.continue();
    if (path.endsWith('/auth/status')) return route.fulfill({ json: { authEnabled: false, loggedIn: true, setupState: 'no_password' } });
    if (path === '/api/v1/financials/company/NVDA') return route.fulfill({ json: company });
    return route.fulfill({ json: { items: [], total: 0 } });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/research/NVDA');
  await expect(page.getByRole('heading', { name: '公司财务研究' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('SYNTHETIC TEST DATA — NOT SEC REPORTED')).toBeVisible();
  await expect(page.getByText('2,000,000,000').first()).toBeVisible();
  await page.getByText('申报值 · 展开证据').first().click();
  await expect(page.getByRole('link', { name: /查看 SEC 原始申报/ }).first()).toBeVisible();
  await page.getByRole('button', { name: '净利润', exact: true }).click();
  await expect(page.getByRole('img', { name: '净利润 历史趋势' })).toBeVisible();
  const desktop = testInfo.outputPath('company-research-synthetic-1440.png');
  await page.screenshot({ path: desktop, fullPage: true, animations: 'disabled' });
  await testInfo.attach('synthetic-desktop', { path: desktop, contentType: 'image/png' });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const tableScroller = page.getByRole('table').locator('..');
  await expect.poll(() => tableScroller.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  const mobile = testInfo.outputPath('company-research-synthetic-390.png');
  await page.screenshot({ path: mobile, fullPage: true, animations: 'disabled' });
  await testInfo.attach('synthetic-mobile', { path: mobile, contentType: 'image/png' });

  await page.getByRole('button', { name: '切换界面语言' }).first().click();
  await expect(page.getByRole('heading', { name: 'Company financial research' })).toBeVisible();
  await expect(page.getByText('SYNTHETIC TEST DATA — NOT SEC REPORTED')).toBeVisible();
  await expect(page.getByText('Reported · Show evidence').first()).toBeVisible();
  await page.getByRole('button', { name: 'Quarterly' }).click();
  await expect(page.getByText('No verifiable filing periods')).toBeVisible();
});
