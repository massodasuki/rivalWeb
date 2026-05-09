/**
 * Auth Setup — runs once before all tests.
 *
 * Logs in with the test user and saves the browser storage state
 * (cookies + localStorage) to playwright/.auth/user.json so that
 * every subsequent test starts already authenticated.
 *
 * If the test user doesn't exist yet, it registers first.
 */
import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_FILE = path.join(__dirname, '../playwright/.auth/user.json');

const TEST_USER = {
  name: 'E2E Test User',
  email: process.env.TEST_EMAIL || 'e2e@rival.test',
  password: process.env.TEST_PASSWORD || 'TestPass123!',
};

setup('authenticate', async ({ page }) => {
  // Ensure the auth directory exists
  const authDir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Try logging in first
  await page.goto('/login');
  await page.getByLabel('Email').fill(TEST_USER.email);
  await page.getByLabel('Password').fill(TEST_USER.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // If login fails (error message appears), register the user
  const errorVisible = await page.locator('.auth-error').isVisible().catch(() => false);
  if (errorVisible) {
    await page.goto('/signup');
    await page.getByLabel('Full Name').fill(TEST_USER.name);
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password', { exact: true }).fill(TEST_USER.password);
    await page.getByLabel('Confirm Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: /create account/i }).click();
  }

  // Wait until we land on the dashboard (protected route)
  await expect(page).toHaveURL('/', { timeout: 10_000 });

  // Save auth state for reuse across all tests
  await page.context().storageState({ path: AUTH_FILE });
});
