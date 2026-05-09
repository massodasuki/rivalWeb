/**
 * Stats Page Tests
 */
import { test, expect } from '@playwright/test';

test.describe('Stats', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stats');
  });

  test('loads the stats page', async ({ page }) => {
    await expect(page).toHaveURL('/stats');
    await expect(page.locator('.main-content')).toBeVisible();
  });

  test('page does not crash on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/stats');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('shows stats content (not just a blank page)', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    // The page should have some meaningful content
    const mainContent = page.locator('.main-content');
    const text = await mainContent.innerText();
    expect(text.trim().length).toBeGreaterThan(10);
  });
});
