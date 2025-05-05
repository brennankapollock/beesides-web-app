import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';
import { logger } from '../../utils/logger';

/**
 * Base hook for Supabase queries that simplifies data fetching 
 * operations with proper error handling and type safety
 */
export function useSupabaseQuery<T = any>(
  queryKey: string[], 
  tableName: string, 
  options?: {
    column?: string;
    value?: string | number | boolean;
    select?: string;
    order?: {column: string; ascending?: boolean};
    limit?: number;
    range?: [number, number];
    filter?: (query: any) => any;
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  
  return useQuery({
    queryKey: [...queryKey, tableName, options?.value || ''],
    queryFn: async () => {
      try {
        let query = supabase
          .from(tableName)
          .select(options?.select || '*');

        // Apply filtering function if provided
        if (options?.filter) {
          query = options.filter(query);
        } 
        // Otherwise apply simple column filter if provided
        else if (options?.column && options?.value !== undefined) {
          query = query.eq(options.column, options.value);
        }

        // Apply ordering if provided
        if (options?.order) {
          query = query.order(
            options.order.column, 
            { ascending: options.order.ascending ?? true }
          );
        }

        // Apply limit if provided
        if (options?.limit) {
          query = query.limit(options.limit);
        }

        // Apply range if provided
        if (options?.range) {
          query = query.range(options.range[0], options.range[1]);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        return data as T;
      } catch (error) {
        logger.error(`Error fetching from ${tableName}`, {
          category: 'database',
          data: { error, queryKey, tableName, options }
        });
        throw error;
      }
    },
    enabled: options?.enabled !== false && !!userId,
    staleTime: options?.staleTime,
  });
}

/**
 * Hook for fetching a single item by ID from any table
 */
export function useSupabaseItem<T = any>(
  tableName: string,
  id?: string | number,
  options?: {
    select?: string;
    idColumn?: string;
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const idColumn = options?.idColumn || 'id';

  return useSupabaseQuery<T>(
    ['item', tableName, String(id)],
    tableName,
    {
      column: idColumn,
      value: id,
      select: options?.select,
      enabled: !!id && (options?.enabled !== false),
      staleTime: options?.staleTime
    }
  );
}

/**
 * Hook for mutating data in Supabase tables
 */
export function useSupabaseMutation<T = any, TVariables = any>(
  tableName: string,
  options?: {
    operation: 'insert' | 'update' | 'upsert' | 'delete';
    idColumn?: string;
    onSuccess?: (data: T, variables: TVariables) => void;
    invalidateQueries?: string[][];
  }
) {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const operation = options?.operation || 'insert';
  const idColumn = options?.idColumn || 'id';

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        let query;

        switch (operation) {
          case 'insert':
            query = supabase.from(tableName).insert(variables);
            break;
          case 'update': {
            // For updates, expect an id property in variables
            const { id, ...rest } = variables as any;
            query = supabase
              .from(tableName)
              .update(rest)
              .eq(idColumn, id);
            break;
          }
          case 'upsert':
            query = supabase.from(tableName).upsert(variables);
            break;
          case 'delete': {
            // For deletes, expect an id property in variables
            const id = (variables as any).id;
            query = supabase
              .from(tableName)
              .delete()
              .eq(idColumn, id);
            break;
          }
        }

        const { data, error } = await query.select();
        
        if (error) {
          throw error;
        }
        
        return data as T;
      } catch (error) {
        logger.error(`Error ${operation} in ${tableName}`, {
          category: 'database',
          data: { error, operation, tableName, variables }
        });
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate queries based on configuration
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      } else {
        // Default invalidation of the table queries
        queryClient.invalidateQueries({ queryKey: [tableName] });
      }
      
      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess(data, variables);
      }
    }
  });
}
