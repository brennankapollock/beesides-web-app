import { useState, useEffect } from 'react';
import { Client, Databases, Query, ID } from 'appwrite';

// Initialize Appwrite
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '681f8b930020ae807d29');

const databases = new Databases(client);
// Database and collection IDs
const DB_ID = 'default_database';
const RATINGS_COLLECTION = 'ratings';
const ALBUMS_COLLECTION = 'albums';

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
 * Hook to fetch user's rated albums
 */
export function useUserRatedAlbums(userId: string | undefined) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserRatedAlbums = async () => {
      try {
        setLoading(true);

        // Get albums this user has rated
        const ratingsResponse = await databases.listDocuments(
          DB_ID,
          RATINGS_COLLECTION,
          [
            Query.equal("user_id", userId),
            Query.orderDesc("created_at"),
            Query.limit(20)
          ]
        );

        if (ratingsResponse.documents.length > 0) {
          // We need to separately fetch the album details for each rating
          const albumIds = ratingsResponse.documents.map(item => item.album_id);
          
          // Fetch album details in batch where possible
          const albumsResponse = await databases.listDocuments(
            DB_ID, 
            ALBUMS_COLLECTION,
            [Query.equal("$id", albumIds)]
          );
          
          // Create map for faster lookup
          const albumsMap: Record<string, any> = {};
          albumsResponse.documents.forEach(album => {
            albumsMap[album.$id] = album;
          });
          
          // Transform the data to match our component requirements
          const formattedAlbums = ratingsResponse.documents.map((item: any) => {
            const albumData = albumsMap[item.album_id] || {};
            
            // Get artist name - assuming we have a normalized artist structure
            let artistName = "";
            if (albumData.artist_name) {
              artistName = albumData.artist_name;
            }

            return {
              id: item.album_id,
              title: albumData.title || "",
              artist: artistName,
              cover: albumData.cover_url || "",
              rating: item.rating || 0,
              releaseDate: albumData.release_date
                ? new Date(albumData.release_date).getFullYear().toString()
                : "",
            };
          });

          setAlbums(formattedAlbums);
        } else {
          setAlbums([]);
        }
      } catch (err: any) {
        console.error("Error fetching user albums:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchUserRatedAlbums();
  }, [userId]);

  return {
    albums,
    loading,
    error
  };
}

/**
 * Rate an album
 */
export async function rateAlbum(albumId: string, userId: string, rating: number) {
  try {
    // Check if rating already exists
    const existingRatings = await databases.listDocuments(
      DB_ID,
      RATINGS_COLLECTION,
      [
        Query.equal("user_id", userId),
        Query.equal("album_id", albumId)
      ]
    );
    
    if (existingRatings.documents.length > 0) {
      // Update existing rating
      const existingRating = existingRatings.documents[0];
      return await databases.updateDocument(
        DB_ID,
        RATINGS_COLLECTION,
        existingRating.$id,
        { rating }
      );
    } else {
      // Create new rating
      return await databases.createDocument(
        DB_ID,
        RATINGS_COLLECTION,
        ID.unique(),
        {
          user_id: userId,
          album_id: albumId,
          rating,
          created_at: new Date().toISOString()
        }
      );
    }
  } catch (error) {
    console.error("Error rating album:", error);
    throw error;
  }
}
