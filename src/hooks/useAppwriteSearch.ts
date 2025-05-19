import { useState, useEffect } from 'react';
import { Client, Databases, Query } from 'appwrite';

// Initialize Appwrite
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '681f8b930020ae807d29');

const databases = new Databases(client);

// Database and collection IDs
const DB_ID = 'default_database';
const ALBUMS_COLLECTION = 'albums';
const ARTISTS_COLLECTION = 'artists';
const USERS_COLLECTION = 'users';

// Types for search results
export interface AlbumSearchResult {
  id: string;
  title: string;
  artist_name: string;
  cover_url?: string;
  release_date?: string;
  type: 'album';
}

export interface ArtistSearchResult {
  id: string;
  name: string;
  image_url?: string;
  type: 'artist';
}

export interface UserSearchResult {
  id: string;
  username: string;
  name?: string;
  avatar_url?: string;
  type: 'user';
}

export type SearchResult = AlbumSearchResult | ArtistSearchResult | UserSearchResult;

/**
 * Search across albums, artists, and users
 */
export function useGlobalSearch(query: string, limit = 20) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't search if query is too short
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      try {
        setLoading(true);
        setError(null);

        // Search albums
        const albumsPromise = databases.listDocuments(
          DB_ID,
          ALBUMS_COLLECTION,
          [
            Query.search('title', query),
            Query.limit(limit / 2)
          ]
        );

        // Search artists
        const artistsPromise = databases.listDocuments(
          DB_ID,
          ARTISTS_COLLECTION,
          [
            Query.search('name', query),
            Query.limit(limit / 3)
          ]
        );

        // Search users
        const usersPromise = databases.listDocuments(
          DB_ID,
          USERS_COLLECTION,
          [
            Query.search('username', query),
            Query.limit(limit / 3)
          ]
        );

        // Wait for all searches to complete
        const [albumsResponse, artistsResponse, usersResponse] = await Promise.all([
          albumsPromise,
          artistsPromise,
          usersPromise
        ]);

        // Format album results
        const albumResults: AlbumSearchResult[] = albumsResponse.documents.map(doc => ({
          id: doc.$id,
          title: doc.title,
          artist_name: doc.artist_name,
          cover_url: doc.cover_url,
          release_date: doc.release_date,
          type: 'album' as const
        }));

        // Format artist results
        const artistResults: ArtistSearchResult[] = artistsResponse.documents.map(doc => ({
          id: doc.$id,
          name: doc.name,
          image_url: doc.image_url,
          type: 'artist' as const
        }));

        // Format user results
        const userResults: UserSearchResult[] = usersResponse.documents.map(doc => ({
          id: doc.$id,
          username: doc.username,
          name: doc.name,
          avatar_url: doc.avatar_url,
          type: 'user' as const
        }));

        // Combine and sort results (albums first, then artists, then users)
        const combinedResults = [
          ...albumResults,
          ...artistResults,
          ...userResults
        ];

        setResults(combinedResults);
      } catch (err) {
        console.error("Search error:", err);
        setError(err instanceof Error ? err : new Error('Unknown search error'));
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, limit]);

  return { results, loading, error };
}

/**
 * Search for albums only
 */
export function useAlbumSearch(query: string, limit = 20) {
  const [results, setResults] = useState<AlbumSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchAlbums = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await databases.listDocuments(
          DB_ID,
          ALBUMS_COLLECTION,
          [
            Query.search('title', query),
            Query.limit(limit)
          ]
        );

        const albumResults: AlbumSearchResult[] = response.documents.map(doc => ({
          id: doc.$id,
          title: doc.title,
          artist_name: doc.artist_name,
          cover_url: doc.cover_url,
          release_date: doc.release_date,
          type: 'album' as const
        }));

        setResults(albumResults);
      } catch (err) {
        console.error("Album search error:", err);
        setError(err instanceof Error ? err : new Error('Unknown album search error'));
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      searchAlbums();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, limit]);

  return { results, loading, error };
}

/**
 * Search for artists only
 */
export function useArtistSearch(query: string, limit = 20) {
  const [results, setResults] = useState<ArtistSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchArtists = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await databases.listDocuments(
          DB_ID,
          ARTISTS_COLLECTION,
          [
            Query.search('name', query),
            Query.limit(limit)
          ]
        );

        const artistResults: ArtistSearchResult[] = response.documents.map(doc => ({
          id: doc.$id,
          name: doc.name,
          image_url: doc.image_url,
          type: 'artist' as const
        }));

        setResults(artistResults);
      } catch (err) {
        console.error("Artist search error:", err);
        setError(err instanceof Error ? err : new Error('Unknown artist search error'));
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      searchArtists();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, limit]);

  return { results, loading, error };
}

/**
 * Search for users only
 */
export function useUserSearch(query: string, limit = 20) {
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await databases.listDocuments(
          DB_ID,
          USERS_COLLECTION,
          [
            Query.search('username', query),
            Query.limit(limit)
          ]
        );

        const userResults: UserSearchResult[] = response.documents.map(doc => ({
          id: doc.$id,
          username: doc.username,
          name: doc.name,
          avatar_url: doc.avatar_url,
          type: 'user' as const
        }));

        setResults(userResults);
      } catch (err) {
        console.error("User search error:", err);
        setError(err instanceof Error ? err : new Error('Unknown user search error'));
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, limit]);

  return { results, loading, error };
}
