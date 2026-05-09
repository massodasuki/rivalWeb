/**
 * Settings Page Tests
 */
import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('loads the settings page', async ({ page }) => {
    await expect(page).toHaveURL('/settings');
    await expect(page.locator('.main-content')).toBeVisible();
  });

  test('does not show hardcoded placeholder name "John Doe"', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    // After the fix, the page should not show the fake placeholder
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('John Doe');
  });

  test('does not show hardcoded placeholder email "john.doe@example.com"', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('john.doe@example.com');
  });

  test('has a save / update button', async ({ page }) => {
    const saveBtn = page.getByRole('button', { name: /save|update|apply/i });
    await expect(saveBtn).toBeVisible();
  });

  test('page does not crash on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });
});
