import { defineConfig, devices } from '@playwright/test';

const PUERTO_API = 4100;
const PUERTO_APP = 5175;
const BASE_URL = `http://localhost:${PUERTO_APP}`;
const URL_API = `http://localhost:${PUERTO_API}`;
const DB_E2E = 'postgres://todo:todo123@localhost:5432/todo_list_e2e';

export default defineConfig({
  testDir: './e2e/escenarios',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    locale: 'es-ES',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run start:e2e',
      cwd: '../server',
      env: {
        NODE_ENV: 'test',
        PORT: String(PUERTO_API),
        DATABASE_URL: DB_E2E,
        TEST_DATABASE_URL: DB_E2E,
      },
      url: `${URL_API}/api/health`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `npm run dev -- --port ${PUERTO_APP} --strictPort`,
      env: { VITE_PROXY_TARGET: URL_API },
      url: BASE_URL,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});