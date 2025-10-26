import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 5174);
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  /* Tempo total por teste */
  timeout: 60_000,
  expect: { timeout: 5_000 },
  /* Retries no CI ajudam a estabilizar */
  retries: process.env.CI ? 2 : 0,
  /* Menos workers no CI para evitar flakiness */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter com HTML para inspecionar falhas localmente/CI */
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Sobe o Vite automaticamente antes dos testes */
  webServer: {
    command: `npm run dev`,                     // em package.json: "dev": "vite --host --port 5174 --strictPort"
    url: BASE_URL,                              // tem de bater certo com a porta
    reuseExistingServer: !process.env.CI,       // reutiliza se já estiver a correr
    timeout: 120_000,                           // Windows às vezes demora mais a arrancar
    stdout: 'pipe',
    stderr: 'pipe',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Ativa se quiseres cobrir mais:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});

