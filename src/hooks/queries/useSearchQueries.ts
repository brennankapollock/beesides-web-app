import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

type SearchFilter = 'albums' | 'artists' | 'users' | 'all';

/**
 * Hook to search across albums, artists, and users
 */
export function useSearch(
  query: string, 
  filter: SearchFilter = 'all',
  options?: {
    limit?: number;
    page?: number;
    genreFilter?: string[];
  }
) {
  const searchTerm = query?.trim();
  const limit = options?.limit || 20;
  const page = options?.page || 0;
  const offset = page * limit;
  
  return useQuery({
    queryKey: ['search', searchTerm, filter, options],
    queryFn: async () => {
      if (!searchTerm) return { albums: [], artists: [], users: [], total: 0 };
      
      try {
        const results: {
          albums: any[];
          artists: any[];
          users: any[];
          total: number;
        } = {
          albums: [],
          artists: [],
          users: [],
          total: 0
        };
        
        // Function to perform a specific search type
        const performSearch = async (table: string, fields: string[], alias?: string) => {
          const conditions = fields.map(field => `${field}.ilike.%${searchTerm}%`);
          
          let query = supabase
            .from(table)
            .select(alias || '*')
            .or(conditions.join(','));
            
          // Apply genre filter if applicable
          if (table === 'albums' && options?.genreFilter?.length) {
            query = query.in('genre', options.genreFilter);
          }
          
          // Apply pagination
          query = query.range(offset, offset + limit - 1);
          
          const { data, error, count } = await query.limit(limit);
          
          if (error) throw error;
          
          return { data, count };
        };
        
        // Search based on the filter
        if (filter === 'albums' || filter === 'all') {
          const { data: albums, count: albumCount } = await performSearch(
            'albums', 
            ['title', 'artist_name']
          );
          results.albums = albums;
          results.total += albumCount || 0;
        }
        
        if (filter === 'artists' || filter === 'all') {
          const { data: artists, count: artistCount } = await performSearch(
            'artists', 
            ['name', 'description']
          );
          results.artists = artists;
          results.total += artistCount || 0;
        }
        
        if (filter === 'users' || filter === 'all') {
          const { data: users, count: userCount } = await performSearch(
            'profiles', 
            ['username', 'display_name']
          );
          results.users = users;
          results.total += userCount || 0;
        }
        
        return results;
      } catch (error) {
        logger.error('Search failed', {
          category: 'search',
          data: { error, query: searchTerm, filter }
        });
        throw error;
      }
    },
    enabled: !!searchTerm,
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true,
  });
}

/**
 * Hook to get search suggestions as the user types
 */
export function useSearchSuggestions(query: string) {
  const searchTerm = query?.trim();
  
  return useQuery({
    queryKey: ['searchSuggestions', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      try {
        // Get albums that match the search term
        const { data: albums, error: albumsError } = await supabase
          .from('albums')
          .select('id, title, artist_name')
          .or(`title.ilike.%${searchTerm}%,artist_name.ilike.%${searchTerm}%`)
          .limit(3);
          
        if (albumsError) throw albumsError;
        
        // Get artists that match the search term
        const { data: artists, error: artistsError } = await supabase
          .from('artists')
          .select('id, name')
          .ilike('name', `%${searchTerm}%`)
          .limit(3);
          
        if (artistsError) throw artistsError;
        
        // Get users that match the search term
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, username, display_name')
          .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
          .limit(3);
          
        if (usersError) throw usersError;
        
        // Format suggestions for display
        return [
          ...albums.map(album => ({
            id: `album-${album.id}`,
            type: 'album',
            text: album.title,
            subtext: album.artist_name,
            data: album
          })),
          ...artists.map(artist => ({
            id: `artist-${artist.id}`,
            type: 'artist',
            text: artist.name,
            subtext: 'Artist',
            data: artist
          })),
          ...users.map(user => ({
            id: `user-${user.id}`,
            type: 'user',
            text: user.display_name || user.username,
            subtext: `@${user.username}`,
            data: user
          })),
        ];
      } catch (error) {
        logger.error('Search suggestions failed', {
          category: 'search',
          data: { error, query: searchTerm }
        });
        return [];
      }
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });
}
