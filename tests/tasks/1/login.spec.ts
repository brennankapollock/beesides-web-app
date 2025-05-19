import { test, expect } from '@playwright/test';

// Test data
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Password123!';

test.describe('Authentication - Login', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the login page before each test
    await page.goto('/login');
    
    // Ensure we're on the login page
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('login page renders correctly', async ({ page }) => {
    // Check that the login form elements are visible
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
  });

  test('shows error with empty fields', async ({ page }) => {
    // Click sign in without entering credentials
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Check for error message
    await expect(page.getByText('Please fill in all fields')).toBeVisible();
  });

  test('navigates to registration page', async ({ page }) => {
    // Click on the sign up link
    await page.getByRole('link', { name: 'Sign up' }).click();
    
    // Check that we're on the registration page
    await expect(page.url()).toContain('/register');
    await expect(page.getByRole('heading', { name: /Create your account/i })).toBeVisible();
  });

  test('navigates to forgot password page', async ({ page }) => {
    // Click on the forgot password link
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    
    // Check that we're on the forgot password page
    await expect(page.url()).toContain('/forgot-password');
    await expect(page.getByRole('heading', { name: /Reset your password/i })).toBeVisible();
  });

  // This test requires mocking the authentication API
  test.skip('successful login redirects to home page', async ({ page }) => {
    // Fill in the login form
    await page.getByLabel('Email').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    
    // Mock the authentication API response
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: {
            id: '123',
            email: TEST_EMAIL,
            name: 'Test User',
          },
          session: {
            id: 'session123',
          },
        }),
      });
    });
    
    // Click the sign in button
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Check that we're redirected to the home page
    await expect(page.url()).toBe('/');
  });

  // This test requires mocking the authentication API
  test.skip('shows error with invalid credentials', async ({ page }) => {
    // Fill in the login form with invalid credentials
    await page.getByLabel('Email').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill('WrongPassword');
    
    // Mock the authentication API response for invalid credentials
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({
          message: 'Invalid email or password',
        }),
      });
    });
    
    // Click the sign in button
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Check for error message
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });
});
