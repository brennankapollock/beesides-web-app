import { account } from '../lib/appwrite';
import { logger } from './logger';

/**
 * Utility function to make authenticated API requests
 * @param url The API endpoint URL
 * @param options Fetch options
 * @returns Response from the fetch request
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    // Get a JWT token from Appwrite
    const jwt = await account.createJWT();
    
    // Create headers with Authorization
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${jwt.jwt}`,
    };
    
    // Return the fetch with authorization header
    return fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    logger.error('Failed to create JWT for API auth', {
      category: 'auth',
      data: { error: error instanceof Error ? error.message : String(error) },
    });
    
    // If we can't get a JWT, attempt the fetch without it
    // This will likely fail for protected endpoints but prevents the entire app from crashing
    return fetch(url, options);
  }
}
