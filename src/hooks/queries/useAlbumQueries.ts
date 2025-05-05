import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';
import { logger } from '../../utils/logger';

/**
 * Hook to fetch an album by its ID
 */
export function useAlbumQuery(albumId: string | number | undefined) {
  return useQuery({
    queryKey: ['album', albumId],
    queryFn: async () => {
      if (!albumId) throw new Error("Album ID required");
      
      try {
        const { data, error } = await supabase
          .from('albums')
          .select(`
            *,
            artists:album_artists(artist_id, artists(*))
          `)
          .eq('id', albumId)
          .single();
          
        if (error) throw error;
        
        return data;
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
        let query = supabase
          .from('album_genres')
          .select(`
            albums(*)
          `)
          .eq('genre', genreName);
        
        // Apply limit if provided
        if (options?.limit) {
          query = query.limit(options.limit);
        }
        
        // Apply offset if provided
        if (options?.offset) {
          query = query.range(
            options.offset, 
            options.offset + (options.limit || 20) - 1
          );
        }
        
        // Apply sorting if provided
        if (options?.sortBy) {
          query = query.order(
            `albums.${options.sortBy}`, 
            { ascending: options.sortDirection !== 'desc' }
          );
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Extract albums from the nested structure
        return data.map(item => item.albums);
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
        const { data, error } = await supabase
          .from('album_ratings')
          .select(`
            *,
            albums(*)
          `)
          .eq('user_id', userId);
          
        if (error) throw error;
        
        return data;
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
      albumId: number; 
      rating: number;
    }) => {
      if (!currentUser?.id) throw new Error("User ID required");
      
      try {
        // Check if rating already exists
        const { data: existingRating, error: checkError } = await supabase
          .from('album_ratings')
          .select()
          .eq('user_id', currentUser.id)
          .eq('album_id', albumId)
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        let result;
        
        if (existingRating) {
          // Update existing rating
          result = await supabase
            .from('album_ratings')
            .update({ rating, updated_at: new Date().toISOString() })
            .eq('id', existingRating.id)
            .select();
        } else {
          // Create new rating
          result = await supabase
            .from('album_ratings')
            .insert({
              user_id: currentUser.id,
              album_id: albumId,
              rating,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select();
        }
        
        if (result.error) throw result.error;
        
        logger.info('Album rating saved', {
          category: 'ratings',
          data: { albumId, rating }
        });
        
        return result.data?.[0];
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
        const { data, error } = await supabase
          .from('collections')
          .select(`
            *,
            album_count:albums(count)
          `)
          .eq('user_id', userId);
          
        if (error) throw error;
        
        return data;
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
        const { data, error } = await supabase
          .from('collections')
          .insert({
            name,
            description,
            is_private: isPrivate,
            user_id: currentUser.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (error) throw error;
        
        logger.info('Collection created', {
          category: 'collections',
          data: { name, isPrivate }
        });
        
        return data[0];
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
      collectionId: number; 
      albumId: number;
    }) => {
      try {
        const { data, error } = await supabase
          .from('collection_albums')
          .insert({
            collection_id: collectionId,
            album_id: albumId,
            added_at: new Date().toISOString()
          })
          .select();
          
        if (error) throw error;
        
        return data[0];
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
