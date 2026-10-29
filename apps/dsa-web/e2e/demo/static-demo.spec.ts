import { expect, test } from '@playwright/test';

test('verified multi-company search, report, evidence and local continuity', async ({ page }) => {
  const privateCalls: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith('/api/') || url.port === '8000' || url.hostname === 'localhost') privateCalls.push(url.href);
  });
  await page.goto('/');
  await expect(page.getByText('YQ · PORTFOLIO DEMO')).toBeVisible();
  await expect(page.getByText(/SEC financial snapshots · NVDA, MSFT, AMAT/)).toBeVisible();
  await expect(page.getByText('215,938,000,000 USD')).toBeVisible();
  const search = page.getByLabel('Search by ticker');
  await search.fill('AAPL'); await search.press('Enter');
  await expect(page.getByRole('alert')).toContainText('supports NVDA, MSFT and AMAT only');
  await search.fill('MSFT'); await search.press('Enter');
  await expect(page).toHaveURL(/\/research\/MSFT$/);
  await expect(page.getByText('MICROSOFT CORP')).toBeVisible();
  await expect(page.getByText('331,839,000,000').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Refresh', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Quarterly' }).click();
  await expect(page.getByText(/FY2027 Q1/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Annual' }).click();
  await page.getByRole('link', { name: 'Open investigation' }).click();
  await expect(page).toHaveURL(/\/questions\/revenue-cash-flow\?basis=annual/);
  await expect(page.getByRole('heading', { name: 'Is revenue growth translating into operating cash flow?' })).toBeVisible();
  await expect(page.getByText('17.7887%')).toBeVisible();
  await page.locator('.el-v02-period-select select').selectOption('2025-06-30');
  await expect(page).toHaveURL(/period=2025-06-30/);
  await expect(page.locator('.el-v02-context')).toContainText('2025-06-30');
  await page.locator('.el-v02-period-select select').selectOption('2026-06-30');
  await expect(page.getByText('17.7887%')).toBeVisible();
  await page.locator('.el-v02-fact-grid details summary').first().click();
  await expect(page.locator('.el-v02-fact-grid a[href^="https://www.sec.gov/Archives/"]').first()).toBeVisible();
  await page.getByRole('button', { name: 'Save research' }).click();
  await expect(page.getByRole('status').last()).toContainText('Saved on this device');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export summary' }).click();
  expect((await download).suggestedFilename()).toContain('MSFT');
  await page.goto('/my-research');
  await expect(page.getByText(/MSFT · Is revenue growth/)).toBeVisible();
  const savedDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export saved context' }).click();
  expect((await savedDownload).suggestedFilename()).toContain('MSFT');
  await page.getByRole('link', { name: 'Reopen' }).click();
  await expect(page.getByRole('heading', { name: 'Is revenue growth translating into operating cash flow?' })).toBeVisible();
  await page.goto('/my-research');
  await page.getByRole('button', { name: 'Remove MSFT' }).click();
  await expect(page.getByText(/No saved research yet/)).toBeVisible();
  expect(privateCalls).toEqual([]);
});

test('Market Tools disclosure and read-only comparison use verified periods', async ({ page }) => {
  await page.goto('/tools/compare');
  await expect(page.getByRole('heading', { name: 'Company comparison' })).toBeVisible();
  await expect(page.getByText('MICROSOFT CORP · MSFT')).toBeVisible();
  await expect(page.getByText('APPLIED MATERIALS INC /DE · AMAT')).toBeVisible();
  await expect(page.getByText('2025-07-01 → 2026-06-30')).toBeVisible();
  const disclosure = page.getByRole('button', { name: 'Hide market tools' });
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true');
  await disclosure.click();
  await expect(page.getByRole('button', { name: 'Show market tools' })).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Show market tools' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Hide market tools' })).toHaveAttribute('aria-expanded', 'true');
  await page.reload();
  await expect(page.locator('.el-nav-tools').getByRole('link', { name: 'Company comparison', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Verified-universe screener' }).first().click();
  await page.getByLabel('Minimum annual revenue (USD billions)').fill('300');
  await expect(page.getByRole('table')).toContainText('MSFT');
  await expect(page.getByRole('table')).not.toContainText('AMAT');
  await page.getByRole('link', { name: 'Metric explorer' }).first().click();
  await expect(page.getByRole('heading', { name: 'Metric explorer' })).toBeVisible();
});

test('saved company reopens its selected quarter', async ({ page }) => {
  await page.goto('/research/AMAT');
  await page.getByRole('button', { name: 'Quarterly', exact: true }).click();
  await expect(page.getByText(/FY2026 Q3/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Save company' }).click();
  await page.goto('/my-research');
  await page.getByRole('link', { name: 'Reopen' }).click();
  await expect(page).toHaveURL(/research\/AMAT\?basis=quarterly&period=2026-07-26/);
  await expect(page.getByRole('button', { name: 'Quarterly', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(/FY2026 Q3/).first()).toBeVisible();
});

test('Chinese mobile, dark mode and direct research URL remain usable', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'zh-CN', viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/research/AMAT/questions/revenue-cash-flow?basis=annual');
  await expect(page.getByRole('heading', { name: '收入增长是否转化为经营现金流？' })).toBeVisible();
  await page.reload();
  await expect(page.getByText('4.3862%')).toBeVisible();
  await page.getByRole('button', { name: '打开导航菜单' }).click();
  await expect(page.getByRole('link', { name: '市场工具', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '关闭抽屉' }).click();
  await page.getByRole('button', { name: '切换主题' }).click();
  await page.getByRole('menuitemradio', { name: '深色' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await context.close();
});

test('unsupported inherited routes explain the public boundary', async ({ page }) => {
  await page.goto('/tools/daily-analysis');
  await expect(page.getByRole('heading', { name: 'This workspace is not in the public demo.' })).toBeVisible();
  await page.getByRole('link', { name: 'Return to Research Home' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('first visit exposes three real research entries, question, tools and methodology', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Verified company research' })).toBeVisible();
  const companies = page.locator('.el-v021-company-row');
  await expect(companies).toHaveCount(3);
  await expect(companies.nth(0)).toContainText('215.94');
  await expect(companies.nth(1)).toContainText('331.84');
  await expect(companies.nth(2)).toContainText('28.37');
  await page.locator('.el-v021-question-action select').selectOption('AMAT');
  await page.locator('.el-v021-question-action a').click();
  await expect(page).toHaveURL(/research\/AMAT\/questions\/revenue-cash-flow/);
  await page.getByRole('link', { name: 'About EquityLens' }).click();
  await expect(page.getByRole('heading', { name: 'Methodology' })).toBeVisible();
  await expect(page.getByText(/30 reported facts and six derived-quarter values/)).toBeVisible();
  await expect(page.locator('.el-v021-about-summary')).toContainText('Oct 29, 2026');
});

test('comparison selection and screener sorting stay within the three verified issuers', async ({ page }) => {
  await page.goto('/tools/compare');
  await expect(page.getByRole('table')).toContainText('NVIDIA CORP');
  await page.getByLabel('AMAT', { exact: true }).uncheck();
  await expect(page.getByRole('table')).not.toContainText('APPLIED MATERIALS');
  await expect(page.getByText('Issuers screened: 3')).toBeVisible();
  await page.goto('/tools/screener');
  await page.getByLabel('Sort by').selectOption('revenue');
  await expect(page.getByRole('table').locator('tbody tr').first()).toContainText('MICROSOFT');
  await page.getByLabel('Minimum annual revenue (USD billions)').fill('-1');
  await expect(page.getByRole('alert')).toContainText('nonnegative');
});

test('public research routes retain bilingual responsive light and dark behavior', async ({ browser }) => {
  test.setTimeout(180_000);
  const routes = ['/', '/research/NVDA', '/research/MSFT', '/research/AMAT', '/questions', '/research/NVDA/questions/revenue-cash-flow', '/tools', '/tools/compare', '/tools/screener', '/my-research', '/about'];
  for (const width of [1440, 1024, 768, 390]) for (const language of ['en', 'zh'] as const) for (const theme of ['light', 'dark'] as const) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, locale: language === 'zh' ? 'zh-CN' : 'en-US' });
    await context.addInitScript(({ language, theme }) => { localStorage.setItem('dsa.uiLanguage', language); localStorage.setItem('theme', theme); }, { language, theme });
    const page = await context.newPage();
    const failures: string[] = [];
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('request', (request) => { const url = new URL(request.url()); if (url.pathname.startsWith('/api/') || url.hostname === 'localhost') failures.push(url.href); });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('main h1').first(), `${route} ${width} ${language} ${theme}`).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route} ${width} ${language} ${theme}`).toBe(true);
      expect(await page.locator('html').getAttribute('lang')).toBe(language === 'zh' ? 'zh-CN' : 'en');
    }
    expect(failures, `${width} ${language} ${theme}`).toEqual([]);
    await context.close();
  }
});
