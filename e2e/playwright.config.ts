import { defineConfig, devices } from '@playwright/test';

/**
 * Rival E2E Test Configuration
 *
 * Targets the frontend at http://localhost:3000 (Docker / Nginx)
 * or http://localhost:5173 (Vite dev server).
 *
 * Set BASE_URL env var to override, e.g.:
 *   BASE_URL=http://localhost:5173 npx playwright test
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    // Setup project — creates a reusable auth state file
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },

    // Main browser — reuses auth state from setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Firefox (optional — comment out if slow in CI)
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },
  ],
});
