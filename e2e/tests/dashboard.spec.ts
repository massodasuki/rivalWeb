/**
 * Dashboard Tests
 *
 * Verifies the main dashboard loads correctly for an authenticated user.
 * Auth state is injected from playwright/.auth/user.json (created by auth.setup.ts).
 */
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads the dashboard page', async ({ page }) => {
    await expect(page).toHaveURL('/');
    // Sidebar should be visible
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('sidebar navigation links are present', async ({ page }) => {
    const nav = page.locator('.sidebar-nav');
    await expect(nav.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /teams/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /matchmaking/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /community/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /stats/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /settings/i })).toBeVisible();
  });

  test('logout button is present and works', async ({ page }) => {
    const logoutBtn = page.getByRole('button', { name: /logout/i });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();
    await expect(page).toHaveURL('/login', { timeout: 8_000 });
  });

  test('navigates to teams via sidebar', async ({ page }) => {
    await page.locator('.sidebar-nav').getByRole('link', { name: /teams/i }).click();
    await expect(page).toHaveURL('/teams');
  });

  test('navigates to matchmaking via sidebar', async ({ page }) => {
    await page.locator('.sidebar-nav').getByRole('link', { name: /matchmaking/i }).click();
    await expect(page).toHaveURL('/matchmaking');
  });

  test('navigates to community via sidebar', async ({ page }) => {
    await page.locator('.sidebar-nav').getByRole('link', { name: /community/i }).click();
    await expect(page).toHaveURL('/community');
  });

  test('navigates to stats via sidebar', async ({ page }) => {
    await page.locator('.sidebar-nav').getByRole('link', { name: /stats/i }).click();
    await expect(page).toHaveURL('/stats');
  });

  test('navigates to settings via sidebar', async ({ page }) => {
    await page.locator('.sidebar-nav').getByRole('link', { name: /settings/i }).click();
    await expect(page).toHaveURL('/settings');
  });
});
