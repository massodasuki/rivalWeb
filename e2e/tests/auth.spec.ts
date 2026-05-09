/**
 * Auth Tests — Login, Registration, Logout, Route Protection
 *
 * These tests run WITHOUT the saved auth state (they test the auth flow itself).
 */
import { test, expect } from '@playwright/test';

// Override storageState — these tests must start unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

const TEST_USER = {
  email: process.env.TEST_EMAIL || 'e2e@rival.test',
  password: process.env.TEST_PASSWORD || 'TestPass123!',
};

test.describe('Login page', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.locator('.auth-error')).toBeVisible({ timeout: 8_000 });
  });

  test('redirects to dashboard on valid login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL('/', { timeout: 10_000 });
  });

  test('has link to signup page', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL('/signup');
  });
});

test.describe('Signup page', () => {
  test('shows registration form', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
  });

  test('shows error when passwords do not match', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill('mismatch@rival.test');
    await page.getByLabel('Password', { exact: true }).fill('Password123!');
    await page.getByLabel('Confirm Password').fill('DifferentPass!');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.locator('.auth-error')).toContainText(/passwords do not match/i);
  });

  test('shows error when password is too short', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill('short@rival.test');
    await page.getByLabel('Password', { exact: true }).fill('abc');
    await page.getByLabel('Confirm Password').fill('abc');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.locator('.auth-error')).toContainText(/at least 6 characters/i);
  });

  test('has link back to login page', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Route protection', () => {
  test('redirects unauthenticated user from dashboard to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('redirects unauthenticated user from teams to login', async ({ page }) => {
    await page.goto('/teams');
    await expect(page).toHaveURL('/login');
  });

  test('redirects unauthenticated user from matchmaking to login', async ({ page }) => {
    await page.goto('/matchmaking');
    await expect(page).toHaveURL('/login');
  });

  test('redirects authenticated user away from login page', async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/', { timeout: 10_000 });

    // Now try to visit login again — should redirect to dashboard
    await page.goto('/login');
    await expect(page).toHaveURL('/');
  });
});
