import { Databases, Query } from 'appwrite';
import { Client } from 'appwrite';

// Initialize Appwrite
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '681f8b930020ae807d29');

const databases = new Databases(client);

// Database and collection IDs
const DB_ID = 'default_database';
const COLLECTIONS_COLLECTION = 'collections';

/**
 * Fetch user collections from Appwrite
 * @param username User username
 * @returns Array of user collections
 */
export async function fetchUserCollections(username: string) {
  if (!username) {
    throw new Error('Username is required');
  }

  try {
    // Get collections from Appwrite
    const response = await databases.listDocuments(
      DB_ID,
      COLLECTIONS_COLLECTION,
      [
        Query.equal("user_username", username),
        Query.orderDesc("$createdAt")
      ]
    );

    if (response.documents.length > 0) {
      // Transform the data to match our component requirements
      return response.documents.map((collection: any) => ({
        id: collection.$id,
        title: collection.name,
        itemCount: collection.album_count || 0,
        coverImages: collection.cover_images?.slice(0, 3) || [],
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching user collections:", error);
    throw error;
  }
}
