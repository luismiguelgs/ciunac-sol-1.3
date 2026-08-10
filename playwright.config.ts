import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const appUrl = 'http://127.0.0.1:3100'
const mockApiUrl = 'http://127.0.0.1:4100'
const serverFetchMock = pathToFileURL(path.resolve('tests/e2e/support/server-fetch-mock.mjs')).href
const googleFontResponses = path.resolve('tests/e2e/fixtures/google-font-responses.cjs')

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: appUrl,
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
      command: 'node tests/e2e/support/mock-api.mjs',
      url: `${mockApiUrl}/__test/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'npm run dev -- --webpack --hostname 127.0.0.1 --port 3100',
      url: appUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        API_URL: mockApiUrl,
        API_KEY: 'e2e-private-api-key',
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: 'e2e-recaptcha-key',
        RECAPTCHA_SECRET_KEY: 'e2e-recaptcha-secret',
        OTP_SESSION_SECRET: 'e2e-otp-session-secret-with-32-bytes-minimum',
        APP_BASE_URL: appUrl,
        API_KEY_Q10: 'e2e-q10-key',
        CIUNAC_E2E: '1',
        NEXT_FONT_GOOGLE_MOCKED_RESPONSES: googleFontResponses,
        NODE_OPTIONS: `--import=${serverFetchMock}`,
      },
    },
  ],
})
