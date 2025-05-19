import { useState, useEffect } from 'react';
import { Client, Databases, Query, ID } from 'appwrite';

// Initialize Appwrite
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '681f8b930020ae807d29');

const databases = new Databases(client);
// Database and collection IDs
const DB_ID = 'default_database';
const COLLECTIONS_COLLECTION = 'collections';
const COLLECTION_ALBUMS_COLLECTION = 'collection_albums';

// Collection type
interface Collection {
  id: string | number;
  title: string;
  itemCount: number;
  coverImages: string[];
}

// Album type
interface Album {
  id: number;
  title: string;
  artist: string;
  cover: string;
  rating?: number;
  genre?: string;
  releaseDate?: string;
}

/**
 * Hook to fetch and manage user collections
 * @param username User's username
 */
export function useAppwriteCollections(username: string | undefined) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!username) return;
    
    const fetchUserCollections = async () => {
      try {
        setLoading(true);
        
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
          const formattedCollections = response.documents.map((collection: any) => ({
            id: collection.$id,
            title: collection.name,
            itemCount: collection.album_count || 0,
            coverImages: collection.cover_images?.slice(0, 3) || [],
          }));

          setCollections(formattedCollections);
        } else {
          setCollections([]);
        }
      } catch (err: any) {
        console.error("Error fetching user collections:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchUserCollections();
  }, [username]);

  /**
   * Create a new collection
   */
  const createCollection = async (collection: {
    name: string;
    description: string;
    isPrivate: boolean;
    albums: Album[];
    userId: string;
    username: string;
  }) => {
    try {
      // Create the collection in Appwrite
      const collectionData = await databases.createDocument(
        DB_ID,
        COLLECTIONS_COLLECTION,
        ID.unique(),
        {
          user_id: collection.userId,
          name: collection.name,
          description: collection.description,
          is_private: collection.isPrivate,
          user_username: collection.username,
          album_count: collection.albums.length,
        }
      );

      // Add albums to the collection
      if (collection.albums.length > 0 && collectionData?.$id) {
        // In Appwrite, we can create a separate collection for collection_albums relations
        // or we can store album IDs directly in the collection document
        
        // Create separate collection_albums documents
        for (const album of collection.albums) {
          await databases.createDocument(
            DB_ID,
            COLLECTION_ALBUMS_COLLECTION,
            ID.unique(),
            {
              collection_id: collectionData.$id,
              album_id: String(album.id),
            }
          );
        }
      }

      // Add the new collection to our local state
      const newCollection = {
        id: collectionData?.$id || "",
        title: collection.name,
        itemCount: collection.albums.length,
        coverImages: collection.albums.slice(0, 3).map((album) => album.cover),
      };

      setCollections((prev) => [newCollection, ...prev]);
      
      return collectionData.$id;
    } catch (err) {
      console.error("Error creating collection:", err);
      throw err;
    }
  };

  return {
    collections,
    loading,
    error,
    createCollection
  };
}
