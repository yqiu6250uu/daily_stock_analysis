import { expect, test } from '@playwright/test';

// Deliberately synthetic: this verifies production React behavior, not SEC values.
const sourceUrl = 'https://www.sec.gov/Archives/edgar/data/1045810/000104581025000010/filing.htm';
const source = {
  concept: 'us-gaap:Revenues', unit: 'USD', period_start: '2024-01-29', period_end: '2025-01-26',
  form: '10-K', filed: '2025-02-21', accepted: '2025-02-21T12:00:00Z',
  accession: '0001045810-25-000010', url: sourceUrl, retrieved_at: '2026-10-27T00:00:00Z',
};
const reported = (value: number) => ({ value, unit: 'USD', kind: 'reported', definition: null, sources: [source] });
const company = {
  ticker: 'NVDA', cik: 1045810, company_name: 'SYNTHETIC TEST DATA — NOT SEC REPORTED', currency: 'USD',
  retrieved_at: '2026-10-27T00:00:00Z',
  data_quality: { source: 'TEST FIXTURE ONLY', note: 'No live SEC request', issues_count: 0 },
  periods: [{
    type: 'annual', period_start: '2024-01-29', period_end: '2025-01-26', fiscal_year: 2025,
    fiscal_quarter: null, filing_form: '10-K', filing_date: '2025-02-21',
    acceptance_date: source.accepted, accession: source.accession, filing_url: sourceUrl,
    values: { revenue: reported(2_000_000_000), net_income: reported(500_000_000) },
    metrics: {}, quality_issues: [],
  }],
};

test('research home supports real navigation, data preview, bilingual search and responsive layout', async ({ page }) => {
  let financialRequests = 0;
  await page.addInitScript(() => {
    localStorage.setItem('dsa.uiLanguage', 'en');
    localStorage.setItem('theme', 'light');
  });
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (!path.startsWith('/api/')) return route.continue();
    if (path.endsWith('/auth/status')) return route.fulfill({ json: { authEnabled: false, loggedIn: true, setupState: 'no_password' } });
    if (path === '/api/v1/financials/company/NVDA') {
      financialRequests += 1;
      return route.fulfill({ json: company });
    }
    return route.fulfill({ json: { items: [], total: 0 } });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Research that evolves with the evidence.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'EquityLens' })).toBeVisible();
  await expect(page.getByText('2,000,000,000 USD')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Original SEC filing' })).toHaveAttribute('href', sourceUrl);
  await page.getByRole('tab', { name: 'Financial trends' }).click();
  await expect(page.getByRole('img', { name: /Annual revenue trend/ })).toBeVisible();
  await page.getByRole('tab', { name: 'Source evidence' }).click();
  await expect(page.getByText('us-gaap:Revenues').first()).toBeVisible();
  expect(financialRequests).toBe(1);
  await page.getByRole('button', { name: 'Research company' }).click();
  await expect(page.getByRole('alert')).toContainText('Enter a ticker');
  await page.getByRole('textbox', { name: 'Search by ticker' }).fill('wrong ticker');
  await page.getByRole('button', { name: 'Research company' }).click();
  await expect(page.getByRole('alert')).toContainText('Use a US ticker');
  await page.getByRole('textbox', { name: 'Search by ticker' }).fill('nvda');
  await page.getByRole('textbox', { name: 'Search by ticker' }).press('Enter');
  await expect(page).toHaveURL(/\/research\/NVDA$/);
  await expect(page.getByRole('heading', { name: 'Company financial research' })).toBeVisible();
  await page.getByRole('link', { name: 'EquityLens' }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(financialRequests).toBe(2); // company view fetches once; returning home reuses its session preview.

  for (const width of [1024, 768, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('link', { name: 'Market Tools' }).last()).toBeVisible();
  await page.getByRole('link', { name: 'Market Tools' }).last().click();
  await expect(page).toHaveURL(/\/tools$/);
  await expect(page.getByRole('link', { name: 'Daily analysis' })).toBeVisible();
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch UI language' }).first().click();
  await expect(page.getByRole('heading', { name: '让研究随证据深入。' })).toBeVisible();
  await page.getByRole('button', { name: '切换主题' }).first().click();
  await page.getByRole('menuitemradio', { name: '深色' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('featured SEC failure is recoverable and unsupported tickers show a clear company error', async ({ page }) => {
  let failFeatured = true;
  await page.addInitScript(() => localStorage.setItem('dsa.uiLanguage', 'en'));
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (!path.startsWith('/api/')) return route.continue();
    if (path.endsWith('/auth/status')) return route.fulfill({ json: { authEnabled: false, loggedIn: true, setupState: 'no_password' } });
    if (path === '/api/v1/financials/company/NVDA') {
      if (failFeatured) { failFeatured = false; return route.fulfill({ status: 503, json: { error: 'sec_unavailable' } }); }
      return route.fulfill({ json: company });
    }
    if (path === '/api/v1/financials/company/ZZZZ') return route.fulfill({ status: 404, json: { error: 'ticker_not_found' } });
    return route.fulfill({ json: { items: [], total: 0 } });
  });
  await page.goto('/');
  await expect(page.getByText('Featured financials are unavailable right now. Company research remains accessible.')).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('2,000,000,000 USD')).toBeVisible();
  await page.getByRole('textbox', { name: 'Search by ticker' }).fill('ZZZZ');
  await page.getByRole('textbox', { name: 'Search by ticker' }).press('Enter');
  await expect(page).toHaveURL(/\/research\/ZZZZ$/);
  await expect(page.getByText('This company was not found in the official SEC ticker mapping.')).toBeVisible();
});

test('search examples respect reduced motion and never replace typed ticker input', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('dsa.uiLanguage', 'en'));
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (!path.startsWith('/api/')) return route.continue();
    if (path.endsWith('/auth/status')) return route.fulfill({ json: { authEnabled: false, loggedIn: true, setupState: 'no_password' } });
    if (path === '/api/v1/financials/company/NVDA') return route.fulfill({ json: company });
    return route.fulfill({ json: { items: [], total: 0 } });
  });
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Search by ticker' });
  await expect(page.locator('.el-search-example.no-motion')).toBeVisible();
  await input.focus();
  await expect(page.locator('.el-search-example')).toHaveCount(0);
  await input.fill('NVDA');
  await expect(input).toHaveValue('NVDA');
  await expect(page.locator('.el-search-example')).toHaveCount(0);
});
