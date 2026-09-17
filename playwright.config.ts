import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const BASE_URL =
  process.env.ORANGEHRM_BASE_URL || 'https://opensource-demo.orangehrmlive.com';

const IS_CI = !!process.env.CI;

/**
 * Playwright configuration for the OrangeHRM QA Automation Framework.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  /* Maximum time a single test can run */
  timeout: 120_000,

  /* Maximum time expect() assertions can wait */
  expect: {
    timeout: 15_000,
  },

  /* Run tests sequentially since we're testing a shared application state */
  fullyParallel: false,

  /* Fail the build on CI if test.only is accidentally committed */
  forbidOnly: IS_CI,

  /* Retry configuration: 0 locally, 2 on CI to handle transient failures */
  retries: IS_CI ? 2 : 0,

  /* Single worker since tests depend on sequential state */
  workers: 1,

  /* Reporter configuration */
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
  ],

  /* Output directory for test artifacts (screenshots, videos, traces) */
  outputDir: 'test-results',

  /* Shared settings for all projects */
  use: {
    /* Base URL for navigation */
    baseURL: BASE_URL,

    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video for every test to satisfy assessment requirements */
    video: 'on',

    /* Trace collection for debugging failures */
    trace: IS_CI ? 'on-first-retry' : 'retain-on-failure',

    /* Run headless by default */
    headless: true,

    /* Browser viewport */
    viewport: { width: 1280, height: 720 },

    /* Navigation timeout */
    navigationTimeout: 30_000,

    /* Action timeout */
    actionTimeout: 15_000,

    /* Ignore HTTPS errors on demo sites */
    ignoreHTTPSErrors: true,
  },

  /* Browser projects */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
