import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1, // Run tests sequentially to avoid overwhelming translation service
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Timeout for each test */
  timeout: 120000, // 120 seconds per test (increased for long inputs)
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Run tests in headless mode by default (no browser window) */
    headless: true,
  },

  /* Configure projects for major browsers */
  projects: [
    // Chromium for functional tests (headless)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true },
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*ui.*\.spec\.ts/,
    },

    // Chromium for UI tests (visible browser with slow motion)
    {
      name: 'chromium-ui',
      use: { 
        ...devices['Desktop Chrome'], 
        headless: false,
        launchOptions: { slowMo: 300 }
      },
      testMatch: /.*\.spec\.ts/,
      grep: /@ui/,
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], headless: true },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], headless: true },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
