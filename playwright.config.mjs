import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', fullyParallel: true, workers: 2,
  use: { baseURL: 'http://127.0.0.1:4173', channel: 'chrome', headless: true },
  expect: { timeout: 4000 },
  webServer: { command: 'node tools/serve.mjs', port: 4173, reuseExistingServer: false },
  reporter: 'list'
});
