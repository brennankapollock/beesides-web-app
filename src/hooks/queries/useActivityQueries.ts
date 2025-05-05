import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';
import { logger } from '../../utils/logger';

/**
 * Hook to fetch user activity feed
 */
export function useActivityFeed(options?: {
  limit?: number;
  page?: number;
  userId?: string; // specific user's activity (if not provided, shows followed users)
}) {
  const { currentUser } = useAuth();
  const limit = options?.limit || 20;
  const page = options?.page || 0;
  const offset = page * limit;

  return useQuery({
    queryKey: ['activity', currentUser?.id, options],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error('User ID required');

      try {
        // If userId is provided, get activity for that specific user
        if (options?.userId) {
          const { data, error } = await supabase
            .rpc('get_user_activity', {
              user_id_param: options.userId,
              limit_param: limit,
              offset_param: offset
            });

          if (error) throw error;
          return data;
        }

        // Otherwise get activity from followed users
        const { data, error } = await supabase
          .rpc('get_followed_users_activity', {
            current_user_id: currentUser.id,
            limit_param: limit,
            offset_param: offset
          });

        if (error) throw error;
        return data;
      } catch (error) {
        logger.error('Failed to fetch activity feed', {
          category: 'activity',
          data: { error, userId: options?.userId || currentUser?.id }
        });
        throw error;
      }
    },
    enabled: !!currentUser?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes (refresh activity feed more frequently)
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch activity count for followed users
 * Used for notification badge
 */
export function useNewActivityCount() {
  const { currentUser } = useAuth();
  const lastChecked = localStorage.getItem(`activity_last_checked_${currentUser?.id}`) || new Date(0).toISOString();

  return useQuery({
    queryKey: ['activityCount', currentUser?.id, lastChecked],
    queryFn: async () => {
      if (!currentUser?.id) return 0;

      try {
        const { data, error } = await supabase
          .rpc('get_new_activity_count', {
            current_user_id: currentUser.id,
            since_timestamp: lastChecked
          });

        if (error) throw error;
        return data || 0;
      } catch (error) {
        logger.error('Failed to fetch activity count', {
          category: 'activity',
          data: { error }
        });
        return 0;
      }
    },
    enabled: !!currentUser?.id,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Refresh every minute
  });
}

/**
 * Function to mark activity as checked
 */
export function markActivityChecked(userId: string | undefined) {
  if (!userId) return;
  localStorage.setItem(`activity_last_checked_${userId}`, new Date().toISOString());
}
