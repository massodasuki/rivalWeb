/**
 * Matchmaking Page Tests
 */
import { test, expect } from '@playwright/test';

test.describe('Matchmaking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/matchmaking');
  });

  test('loads the matchmaking page', async ({ page }) => {
    await expect(page).toHaveURL('/matchmaking');
    // Page should render without crashing
    await expect(page.locator('.main-content')).toBeVisible();
  });

  test('page does not show a JS error overlay', async ({ page }) => {
    // Collect console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/matchmaking');
    await page.waitForLoadState('networkidle');

    // Filter out known non-critical network errors (e.g. favicon 404)
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('net::ERR_')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('shows available matches or empty state', async ({ page }) => {
    // Either a list of matches or an empty-state message should be visible
    const hasMatches = await page.locator('[class*="match-card"], [class*="match-item"]').count();
    const hasEmptyState = await page.getByText(/no matches/i).isVisible().catch(() => false);

    expect(hasMatches > 0 || hasEmptyState).toBeTruthy();
  });

  test('has a button to create a new match', async ({ page }) => {
    // Look for a create/host match button
    const createBtn = page.getByRole('button', { name: /create|host|new match/i });
    await expect(createBtn).toBeVisible();
  });
});
