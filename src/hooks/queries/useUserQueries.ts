import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';
import { logger } from '../../utils/logger';

/**
 * Hook to fetch user profile data
 */
export function useUserProfile(username: string | undefined) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      if (!username) throw new Error("Username required");
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            display_name,
            avatar_url,
            bio,
            website,
            location,
            preferences,
            created_at,
            updated_at
          `)
          .eq('username', username)
          .single();
          
        if (error) throw error;
        
        return data;
      } catch (error) {
        logger.error('Failed to fetch user profile', {
          category: 'users',
          data: { error, username }
        });
        throw error;
      }
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch user statistics
 */
export function useUserStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");
      
      try {
        const { data: ratingsData, error: ratingsError } = await supabase
          .from('album_ratings')
          .select('count')
          .eq('user_id', userId)
          .single();
          
        if (ratingsError) throw ratingsError;
        
        const { data: collectionsData, error: collectionsError } = await supabase
          .from('collections')
          .select('count')
          .eq('user_id', userId)
          .single();
          
        if (collectionsError) throw collectionsError;
        
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('count')
          .eq('user_id', userId)
          .single();
          
        if (reviewsError) throw reviewsError;
        
        const { data: followersData, error: followersError } = await supabase
          .from('followers')
          .select('count')
          .eq('following_id', userId)
          .single();
          
        if (followersError) throw followersError;
        
        const { data: followingData, error: followingError } = await supabase
          .from('followers')
          .select('count')
          .eq('follower_id', userId)
          .single();
          
        if (followingError) throw followingError;
        
        return {
          ratings: ratingsData.count,
          collections: collectionsData.count,
          reviews: reviewsData.count,
          followers: followersData.count,
          following: followingData.count
        };
      } catch (error) {
        logger.error('Failed to fetch user stats', {
          category: 'users',
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
 * Hook to check if current user follows a user
 */
export function useIsFollowing(userId: string | undefined) {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: ['following', currentUser?.id, userId],
    queryFn: async () => {
      if (!userId || !currentUser?.id) return false;
      
      try {
        const { data, error } = await supabase
          .from('followers')
          .select()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId)
          .maybeSingle();
          
        if (error) throw error;
        
        return !!data; // Returns true if a record exists
      } catch (error) {
        logger.error('Failed to check follow status', {
          category: 'users',
          data: { error, userId }
        });
        throw error;
      }
    },
    enabled: !!userId && !!currentUser?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to follow/unfollow a user
 */
export function useToggleFollow() {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      isFollowing 
    }: { 
      userId: string; 
      isFollowing: boolean;
    }) => {
      if (!currentUser?.id) throw new Error("User ID required");
      
      try {
        if (isFollowing) {
          // Unfollow
          const { error } = await supabase
            .from('followers')
            .delete()
            .eq('follower_id', currentUser.id)
            .eq('following_id', userId);
            
          if (error) throw error;
          
          logger.info('User unfollowed', {
            category: 'users',
            data: { followingId: userId }
          });
          
          return false;
        } else {
          // Follow
          const { error } = await supabase
            .from('followers')
            .insert({
              follower_id: currentUser.id,
              following_id: userId,
              created_at: new Date().toISOString()
            });
            
          if (error) throw error;
          
          logger.info('User followed', {
            category: 'users',
            data: { followingId: userId }
          });
          
          return true;
        }
      } catch (error) {
        logger.error('Failed to toggle follow', {
          category: 'users',
          data: { error, userId, isFollowing }
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate follow status
      queryClient.invalidateQueries({ 
        queryKey: ['following', currentUser?.id, variables.userId] 
      });
      // Invalidate user stats for both users
      queryClient.invalidateQueries({ 
        queryKey: ['stats', variables.userId]
      });
      queryClient.invalidateQueries({ 
        queryKey: ['stats', currentUser?.id] 
      });
    }
  });
}

/**
 * Hook to get suggested users to follow
 */
export function useSuggestedUsers(options?: {
  limit?: number;
  basedOnGenres?: string[];
}) {
  const { currentUser } = useAuth();
  const limit = options?.limit || 5;
  
  return useQuery({
    queryKey: ['suggestedUsers', currentUser?.id, options],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error("User ID required");
      
      try {
        let query;
        
        if (options?.basedOnGenres?.length) {
          // Find users based on genre preferences
          query = supabase
            .from('user_genres')
            .select(`
              profiles:profiles!inner(
                id,
                username,
                display_name,
                avatar_url,
                bio
              )
            `)
            .in('genre', options.basedOnGenres)
            .neq('user_id', currentUser.id)
            .limit(limit);
        } else {
          // Default query to get popular users
          query = supabase
            .from('profiles')
            .select(`
              id,
              username,
              display_name,
              avatar_url,
              bio,
              follower_count:followers!follower_count(count)
            `)
            .neq('id', currentUser.id)
            .order('follower_count', { ascending: false })
            .limit(limit);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Filter out already followed users
        const { data: followedUsers, error: followError } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', currentUser.id);
          
        if (followError) throw followError;
        
        const followedIds = followedUsers.map(u => u.following_id);
        
        const filteredUsers = data
          .filter(user => !followedIds.includes(user.id))
          .map(user => options?.basedOnGenres?.length ? user.profiles : user);
        
        return filteredUsers;
      } catch (error) {
        logger.error('Failed to fetch suggested users', {
          category: 'users',
          data: { error }
        });
        throw error;
      }
    },
    enabled: !!currentUser?.id,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
