/**
 * Teams Page Tests
 */
import { test, expect } from '@playwright/test';

test.describe('Teams', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
  });

  test('loads the teams page', async ({ page }) => {
    await expect(page).toHaveURL('/teams');
    await expect(page.locator('.main-content')).toBeVisible();
  });

  test('page does not crash on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/teams');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('shows teams list or empty state', async ({ page }) => {
    const hasTeams = await page.locator('[class*="team-card"], [class*="team-item"]').count();
    const hasEmptyState = await page.getByText(/no teams/i).isVisible().catch(() => false);

    expect(hasTeams > 0 || hasEmptyState).toBeTruthy();
  });

  test('has a button to create a new team', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /create|new team/i });
    await expect(createBtn).toBeVisible();
  });
});
