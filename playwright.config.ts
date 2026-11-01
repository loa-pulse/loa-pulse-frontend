import { defineConfig, devices } from '@playwright/test'

const PORT = 4180

/**
 * E2E (04-testing 5절). 목업(MSW)을 켠 개발 서버 위에서 메인 시나리오(S1)를 돌린다.
 * 백엔드 없이 로컬과 CI에서 같은 결과를 낸다. 데스크톱 전용이므로 Chromium 하나만 쓴다.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: `pnpm exec vite --port ${PORT} --strictPort`,
    env: { VITE_USE_MOCK: 'true' },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
