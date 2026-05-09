/**
 * Community Page Tests
 */
import { test, expect } from '@playwright/test';

test.describe('Community', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/community');
  });

  test('loads the community page', async ({ page }) => {
    await expect(page).toHaveURL('/community');
    await expect(page.locator('.main-content')).toBeVisible();
  });

  test('page does not crash on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('shows posts or empty state', async ({ page }) => {
    const hasPosts = await page.locator('[class*="post-card"], [class*="post-item"]').count();
    const hasEmptyState = await page.getByText(/no posts/i).isVisible().catch(() => false);

    expect(hasPosts > 0 || hasEmptyState).toBeTruthy();
  });

  test('has a text area or button to create a post', async ({ page }) => {
    const postInput = page.locator('textarea').or(
      page.getByRole('button', { name: /post|create|write/i })
    );
    await expect(postInput.first()).toBeVisible();
  });
});
