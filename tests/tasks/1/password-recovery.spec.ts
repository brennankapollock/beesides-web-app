import { test, expect } from '@playwright/test';

// Test data
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'NewPassword123!';

test.describe('Authentication - Password Recovery', () => {
  test.describe('Forgot Password', () => {
    test.beforeEach(async ({ page }) => {
      // Go to the forgot password page before each test
      await page.goto('/forgot-password');
      
      // Ensure we're on the forgot password page
      await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();
    });

    test('forgot password page renders correctly', async ({ page }) => {
      // Check that the forgot password form elements are visible
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Send recovery email' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    });

    test('shows error with empty email', async ({ page }) => {
      // Click send recovery email without entering email
      await page.getByRole('button', { name: 'Send recovery email' }).click();
      
      // Check for error message
      await expect(page.getByText('Please enter your email address')).toBeVisible();
    });

    test('shows success message after submitting valid email', async ({ page }) => {
      // Fill in the email field
      await page.getByLabel('Email').fill(TEST_EMAIL);
      
      // Mock the password recovery API response
      await page.route('**/api/auth/recovery', async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
          }),
        });
      });
      
      // Click the send recovery email button
      await page.getByRole('button', { name: 'Send recovery email' }).click();
      
      // Check for success message
      await expect(page.getByText('Recovery email sent!')).toBeVisible();
      await expect(page.getByText('Check your email for a link to reset your password')).toBeVisible();
    });

    test('navigates to login page', async ({ page }) => {
      // Click on the sign in link
      await page.getByRole('link', { name: 'Sign in' }).click();
      
      // Check that we're on the login page
      await expect(page.url()).toContain('/login');
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    });
  });

  test.describe('Reset Password', () => {
    test.beforeEach(async ({ page }) => {
      // Go to the reset password page with mock query parameters
      await page.goto('/reset-password?userId=123&secret=abc123');
      
      // Ensure we're on the reset password page
      await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();
    });

    test('reset password page renders correctly', async ({ page }) => {
      // Check that the reset password form elements are visible
      await expect(page.getByLabel('New Password')).toBeVisible();
      await expect(page.getByLabel('Confirm New Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Reset Password' })).toBeVisible();
    });

    test('shows error with empty fields', async ({ page }) => {
      // Click reset password without entering passwords
      await page.getByRole('button', { name: 'Reset Password' }).click();
      
      // Check for error message
      await expect(page.getByText('Please fill in all fields')).toBeVisible();
    });

    test('shows error with mismatched passwords', async ({ page }) => {
      // Fill in the reset password form with mismatched passwords
      await page.getByLabel('New Password').fill(TEST_PASSWORD);
      await page.getByLabel('Confirm New Password').fill('DifferentPassword123!');
      
      // Click reset password
      await page.getByRole('button', { name: 'Reset Password' }).click();
      
      // Check for error message
      await expect(page.getByText('Passwords do not match')).toBeVisible();
    });

    test('shows error with short password', async ({ page }) => {
      // Fill in the reset password form with a short password
      await page.getByLabel('New Password').fill('short');
      await page.getByLabel('Confirm New Password').fill('short');
      
      // Click reset password
      await page.getByRole('button', { name: 'Reset Password' }).click();
      
      // Check for error message
      await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
    });

    test.skip('successful password reset shows success message', async ({ page }) => {
      // Fill in the reset password form
      await page.getByLabel('New Password').fill(TEST_PASSWORD);
      await page.getByLabel('Confirm New Password').fill(TEST_PASSWORD);
      
      // Mock the password reset API response
      await page.route('**/api/auth/recovery/reset', async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
          }),
        });
      });
      
      // Click the reset password button
      await page.getByRole('button', { name: 'Reset Password' }).click();
      
      // Check for success message
      await expect(page.getByText('Password reset successful!')).toBeVisible();
    });
  });
});
