import { test, expect } from '@playwright/test';

test.describe('Authentication - Profile Completion', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state to simulate a logged-in user
    await page.route('**/api/auth/status', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: {
            id: '123',
            email: 'test@example.com',
            name: 'Test User',
          },
          isAuthenticated: true,
        }),
      });
    });
    
    // Go to the onboarding page
    await page.goto('/onboarding');
    
    // Ensure we're on the onboarding page with profile completion step
    await expect(page.getByRole('heading', { name: 'Set up your profile' })).toBeVisible();
  });

  test('profile completion page renders correctly', async ({ page }) => {
    // Check that the profile completion form elements are visible
    await expect(page.getByLabel('Bio')).toBeVisible();
    await expect(page.getByText('Favorite Genres')).toBeVisible();
    await expect(page.getByText('Favorite Artists')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Complete Profile' })).toBeVisible();
  });

  test('can select and deselect genres', async ({ page }) => {
    // Find a genre button (Rock is a common one that should be there)
    const rockGenre = page.getByRole('button', { name: 'Rock' });
    
    // Verify it exists
    await expect(rockGenre).toBeVisible();
    
    // Initially it should not be selected
    await expect(rockGenre).toHaveClass(/bg-gray-100/);
    
    // Click to select
    await rockGenre.click();
    
    // Now it should be selected
    await expect(rockGenre).toHaveClass(/bg-black/);
    
    // Click again to deselect
    await rockGenre.click();
    
    // Should be deselected again
    await expect(rockGenre).toHaveClass(/bg-gray-100/);
  });

  test('can add and remove favorite artists', async ({ page }) => {
    // Get the artist input field
    const artistInput = page.getByPlaceholder('Type an artist name and press Enter');
    
    // Add an artist
    await artistInput.fill('The Beatles');
    await artistInput.press('Enter');
    
    // Check that the artist was added
    await expect(page.getByText('The Beatles')).toBeVisible();
    
    // Add another artist
    await artistInput.fill('Queen');
    await artistInput.press('Enter');
    
    // Check that both artists are visible
    await expect(page.getByText('The Beatles')).toBeVisible();
    await expect(page.getByText('Queen')).toBeVisible();
    
    // Remove an artist
    await page.getByText('The Beatles').getByRole('button').click();
    
    // Check that the artist was removed
    await expect(page.getByText('The Beatles')).not.toBeVisible();
    await expect(page.getByText('Queen')).toBeVisible();
  });

  test('shows error when no genres are selected', async ({ page }) => {
    // Fill in the bio
    await page.getByLabel('Bio').fill('I love music!');
    
    // Add an artist
    const artistInput = page.getByPlaceholder('Type an artist name and press Enter');
    await artistInput.fill('The Beatles');
    await artistInput.press('Enter');
    
    // Don't select any genres
    
    // Click the complete profile button
    await page.getByRole('button', { name: 'Complete Profile' }).click();
    
    // Check for error message
    await expect(page.getByText('Please select at least one genre')).toBeVisible();
  });

  test.skip('successful profile completion continues to next step', async ({ page }) => {
    // Fill in the bio
    await page.getByLabel('Bio').fill('I love music!');
    
    // Select a genre
    await page.getByRole('button', { name: 'Rock' }).click();
    
    // Add an artist
    const artistInput = page.getByPlaceholder('Type an artist name and press Enter');
    await artistInput.fill('The Beatles');
    await artistInput.press('Enter');
    
    // Mock the profile update API response
    await page.route('**/api/auth/profile', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          user: {
            id: '123',
            email: 'test@example.com',
            name: 'Test User',
            bio: 'I love music!',
            preferredGenres: ['Rock'],
            favoriteArtists: ['The Beatles'],
            onboardingCompleted: true,
          },
        }),
      });
    });
    
    // Click the complete profile button
    await page.getByRole('button', { name: 'Complete Profile' }).click();
    
    // Check that we're moved to the next step in the onboarding flow
    await expect(page.getByRole('heading', { name: 'What kind of music do you like?' })).toBeVisible();
  });
});
