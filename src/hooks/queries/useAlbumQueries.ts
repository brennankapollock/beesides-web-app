import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Client, Databases, Query, ID } from 'appwrite';
import { useAuth } from '../useAuth';
import { logger } from '../../utils/logger';

// Initialize Appwrite
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '681f8b930020ae807d29');

const databases = new Databases(client);

// Database and collection IDs
const DB_ID = 'default_database';
const ALBUMS_COLLECTION = 'albums';
const RATINGS_COLLECTION = 'ratings';
const ALBUM_ARTISTS_COLLECTION = 'album_artists';
const ARTISTS_COLLECTION = 'artists';

/**
 * Hook to fetch an album by its ID
 */
export function useAlbumQuery(albumId: string | number | undefined) {
  return useQuery({
    queryKey: ['album', albumId],
    queryFn: async () => {
      if (!albumId) throw new Error("Album ID required");
      
      try {
        // Get the album
        const album = await databases.getDocument(
          DB_ID,
          ALBUMS_COLLECTION,
          albumId.toString()
        );
        
        // Get the album artists
        const albumArtists = await databases.listDocuments(
          DB_ID,
          ALBUM_ARTISTS_COLLECTION,
          [Query.equal('album_id', albumId.toString())]
        );
        
        // Get the artist details for each album artist
        const artistPromises = albumArtists.documents.map(async (albumArtist) => {
          const artist = await databases.getDocument(
            DB_ID,
            ARTISTS_COLLECTION, 
            albumArtist.artist_id
          );
          
          return {
            artist_id: albumArtist.artist_id,
            artists: artist
          };
        });
        
        const artists = await Promise.all(artistPromises);
        
        // Combine album with artists
        return {
          ...album,
          artists
        };
      } catch (error) {
        logger.error('Failed to fetch album', {
          category: 'albums',
          data: { error, albumId }
        });
        throw error;
      }
    },
    enabled: !!albumId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch albums by genre
 */
export function useAlbumsByGenre(genreName: string | undefined, options?: {
  limit?: number;
  offset?: number;
  sortBy?: 'popularity' | 'release_date' | 'title';
  sortDirection?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['albums', 'genre', genreName, options],
    queryFn: async () => {
      if (!genreName) throw new Error("Genre name required");
      
      try {
        // Build the query
        const queries = [Query.equal('genre', genreName)];
        
        // Set up pagination and sorting options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        
        // Get albums by genre
        const albumGenres = await databases.listDocuments(
          DB_ID,
          'album_genres',
          queries
        );
        
        // For each album genre entry, get the full album details
        const albumPromises = albumGenres.documents.map(async (document) => {
          return await databases.getDocument(
            DB_ID,
            ALBUMS_COLLECTION,
            document.album_id.toString()
          );
        });
        
        let albums = await Promise.all(albumPromises);
        
        // Apply client-side sorting if needed
        if (options?.sortBy) {
          const sortKey = options.sortBy;
          albums = albums.sort((a, b) => {
            const fieldA = a[sortKey];
            const fieldB = b[sortKey];
            
            if (options.sortDirection === 'desc') {
              return fieldA > fieldB ? -1 : 1;
            } else {
              return fieldA < fieldB ? -1 : 1;
            }
          });
        }
        
        // Apply pagination
        if (offset > 0 || limit < albums.length) {
          albums = albums.slice(offset, offset + limit);
        }
        
        return albums;
      } catch (error) {
        logger.error('Failed to fetch albums by genre', {
          category: 'albums',
          data: { error, genreName, options }
        });
        throw error;
      }
    },
    enabled: !!genreName,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch user album ratings
 */
export function useUserRatings(userId: string | undefined) {
  return useQuery({
    queryKey: ['ratings', userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");
      
      try {
        // Get all ratings for this user
        const ratingsResult = await databases.listDocuments(
          DB_ID,
          RATINGS_COLLECTION,
          [Query.equal('user_id', userId)]
        );
        
        // For each rating, get the album details
        const ratingsWithAlbums = await Promise.all(
          ratingsResult.documents.map(async (rating) => {
            try {
              const album = await databases.getDocument(
                DB_ID,
                ALBUMS_COLLECTION,
                rating.album_id
              );
              
              return {
                ...rating,
                albums: album
              };
            } catch (error) {
              logger.error('Failed to fetch album for rating', {
                category: 'ratings',
                data: { error, ratingId: rating.$id, albumId: rating.album_id }
              });
              return rating; // Return rating without album if album fetch fails
            }
          })
        );
        
        return ratingsWithAlbums;
      } catch (error) {
        logger.error('Failed to fetch user ratings', {
          category: 'ratings',
          data: { error, userId }
        });
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to rate an album
 */
export function useRateAlbum() {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      albumId, 
      rating 
    }: { 
      albumId: number | string; 
      rating: number;
    }) => {
      if (!currentUser?.id) throw new Error("User ID required");
      
      try {
        // Check if rating already exists
        const existingRatings = await databases.listDocuments(
          DB_ID,
          RATINGS_COLLECTION,
          [
            Query.equal('user_id', currentUser.id),
            Query.equal('album_id', albumId.toString())
          ]
        );
        
        let result;
        const now = new Date().toISOString();
        
        if (existingRatings.documents.length > 0) {
          // Update existing rating
          const existingRating = existingRatings.documents[0];
          
          result = await databases.updateDocument(
            DB_ID,
            RATINGS_COLLECTION,
            existingRating.$id,
            {
              rating,
              updated_at: now
            }
          );
        } else {
          // Create new rating
          result = await databases.createDocument(
            DB_ID,
            RATINGS_COLLECTION,
            ID.unique(),
            {
              user_id: currentUser.id,
              album_id: albumId.toString(),
              rating,
              created_at: now,
              updated_at: now
            }
          );
        }
        
        logger.info('Album rating saved', {
          category: 'ratings',
          data: { albumId, rating }
        });
        
        return result;
      } catch (error) {
        logger.error('Failed to save album rating', {
          category: 'ratings',
          data: { error, albumId, rating }
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['ratings', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['album', variables.albumId] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });
}

/**
 * Hook to fetch user collections
 */
export function useUserCollections(userId: string | undefined) {
  return useQuery({
    queryKey: ['collections', userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");
      
      try {
        // Get all collections for this user
        const collectionsResult = await databases.listDocuments(
          DB_ID,
          'collections',
          [Query.equal('user_id', userId)]
        );
        
        // For each collection, count the number of albums in it
        const collectionsWithCounts = await Promise.all(
          collectionsResult.documents.map(async (collection) => {
            try {
              // Count albums in this collection
              const albumsCount = await databases.listDocuments(
                DB_ID,
                'collection_albums',
                [Query.equal('collection_id', collection.$id)]
              );
              
              return {
                ...collection,
                album_count: albumsCount.total
              };
            } catch (error) {
              logger.error('Failed to fetch album count for collection', {
                category: 'collections',
                data: { error, collectionId: collection.$id }
              });
              return {
                ...collection,
                album_count: 0
              };
            }
          })
        );
        
        return collectionsWithCounts;
      } catch (error) {
        logger.error('Failed to fetch user collections', {
          category: 'collections',
          data: { error, userId }
        });
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new collection
 */
export function useCreateCollection() {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      name, 
      description, 
      isPrivate = false 
    }: { 
      name: string; 
      description?: string; 
      isPrivate?: boolean;
    }) => {
      if (!currentUser?.id) throw new Error("User ID required");
      
      try {
        const now = new Date().toISOString();
        
        const collection = await databases.createDocument(
          DB_ID,
          'collections',
          ID.unique(),
          {
            name,
            description: description || '',
            is_private: isPrivate,
            user_id: currentUser.id,
            created_at: now,
            updated_at: now
          }
        );
          
        logger.info('Collection created', {
          category: 'collections',
          data: { name, isPrivate }
        });
        
        return collection;
      } catch (error) {
        logger.error('Failed to create collection', {
          category: 'collections',
          data: { error, name }
        });
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch collections
      queryClient.invalidateQueries({ 
        queryKey: ['collections', currentUser?.id] 
      });
    }
  });
}

/**
 * Hook to add an album to a collection
 */
export function useAddAlbumToCollection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      collectionId, 
      albumId 
    }: { 
      collectionId: string | number; 
      albumId: string | number;
    }) => {
      try {
        const now = new Date().toISOString();
        
        const collectionAlbum = await databases.createDocument(
          DB_ID,
          'collection_albums',
          ID.unique(),
          {
            collection_id: collectionId.toString(),
            album_id: albumId.toString(),
            added_at: now
          }
        );
          
        return collectionAlbum;
      } catch (error) {
        logger.error('Failed to add album to collection', {
          category: 'collections',
          data: { error, collectionId, albumId }
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate specific collection queries
      queryClient.invalidateQueries({ 
        queryKey: ['collection', variables.collectionId] 
      });
      // Invalidate all collections (for album count)
      queryClient.invalidateQueries({ 
        queryKey: ['collections'] 
      });
    }
  });
}
