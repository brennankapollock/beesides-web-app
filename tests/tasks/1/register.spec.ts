import { test, expect } from '@playwright/test';

// Test data
const TEST_NAME = 'Test User';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Password123!';

test.describe('Authentication - Registration', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the registration page before each test
    await page.goto('/register');
    
    // Ensure we're on the registration page
    await expect(page.getByRole('heading', { name: /Create your account/i })).toBeVisible();
  });

  test('registration page renders correctly', async ({ page }) => {
    // Check that the registration form elements are visible
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Account/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  test('shows error with empty fields', async ({ page }) => {
    // Click create account without entering credentials
    await page.getByRole('button', { name: /Create Account/i }).click();
    
    // Check for error message
    await expect(page.getByText('Please fill in all fields')).toBeVisible();
  });

  test('shows error with mismatched passwords', async ({ page }) => {
    // Fill in the registration form with mismatched passwords
    await page.getByLabel('Name').fill(TEST_NAME);
    await page.getByLabel('Email').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill('DifferentPassword123!');
    
    // Click create account
    await page.getByRole('button', { name: /Create Account/i }).click();
    
    // Check for error message
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('shows error with short password', async ({ page }) => {
    // Fill in the registration form with a short password
    await page.getByLabel('Name').fill(TEST_NAME);
    await page.getByLabel('Email').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill('short');
    await page.getByLabel('Confirm Password').fill('short');
    
    // Click create account
    await page.getByRole('button', { name: /Create Account/i }).click();
    
    // Check for error message
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });

  test('password strength indicator works', async ({ page }) => {
    // Enter a weak password
    await page.getByLabel('Password').fill('12345678');
    
    // Check that the password strength indicator shows "Weak"
    await expect(page.getByText('Weak')).toBeVisible();
    
    // Enter a stronger password
    await page.getByLabel('Password').fill('Password123');
    
    // Check that the password strength indicator shows "Good" or "Strong"
    await expect(page.getByText(/Good|Strong/)).toBeVisible();
  });

  test('navigates to login page', async ({ page }) => {
    // Click on the sign in link
    await page.getByRole('link', { name: 'Sign in' }).click();
    
    // Check that we're on the login page
    await expect(page.url()).toContain('/login');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  // This test requires mocking the authentication API
  test.skip('successful registration redirects to onboarding', async ({ page }) => {
    // Fill in the registration form
    await page.getByLabel('Name').fill(TEST_NAME);
    await page.getByLabel('Email').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
    
    // Mock the authentication API response
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: {
            id: '123',
            email: TEST_EMAIL,
            name: TEST_NAME,
          },
          session: {
            id: 'session123',
          },
        }),
      });
    });
    
    // Click the create account button
    await page.getByRole('button', { name: /Create Account/i }).click();
    
    // Check that we're redirected to the onboarding page
    await expect(page.url()).toContain('/onboarding');
  });
});
