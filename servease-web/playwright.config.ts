import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3102',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node scripts/mock-gateway.mjs --port 5101',
      url: 'http://127.0.0.1:5101/health',
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command:
        'SERVEASE_API_BASE_URL=http://127.0.0.1:5101 NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5101 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:5101 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=e2e-publishable-key npm run start -- --port 3102',
      url: 'http://localhost:3102',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
