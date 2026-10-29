import { defineConfig, devices } from '@playwright/test';

const liveBaseUrl = process.env.EQUITYLENS_DEMO_BASE_URL;

export default defineConfig({
  testDir: './e2e/demo',
  outputDir: './test-results/demo',
  fullyParallel: false,
  reporter: 'list',
  use: { baseURL: liveBaseUrl ?? 'http://127.0.0.1:4174', locale: 'en-US', screenshot: 'only-on-failure' },
  webServer: liveBaseUrl ? undefined : {
    command: './node_modules/.bin/vite preview --mode demo --outDir ../../demo-dist --host 127.0.0.1 --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: false,
  },
  projects: [{ name: 'chromium', use: {
    ...devices['Desktop Chrome'],
    launchOptions: process.env.EQUITYLENS_CHROME_PATH
      ? { executablePath: process.env.EQUITYLENS_CHROME_PATH }
      : undefined,
  } }],
});
