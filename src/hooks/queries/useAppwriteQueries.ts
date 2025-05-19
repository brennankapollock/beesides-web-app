import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { account } from '../../lib/appwrite';
import { useAuth } from '../useAuth';
import { logger } from '../../utils/logger';
import { Query } from 'appwrite';

// Import necessary Appwrite SDK components
import { Client, Databases, Storage } from 'appwrite';

// Create services
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '681f8b930020ae807d29');

// Initialize Appwrite services
const databases = new Databases(client);
const storage = new Storage(client);

// Default database and collection IDs
const DEFAULT_DATABASE_ID = 'default_database';

/**
 * Base hook for Appwrite queries that simplifies data fetching 
 * operations with proper error handling and type safety
 */
export function useAppwriteQuery<T = any>(
  queryKey: string[], 
  collectionId: string, 
  options?: {
    databaseId?: string;
    filters?: string[];
    orderBy?: { field: string; direction?: 'asc' | 'desc' };
    limit?: number;
    offset?: number;
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const databaseId = options?.databaseId || DEFAULT_DATABASE_ID;
  
  return useQuery({
    queryKey: [...queryKey, collectionId, databaseId],
    queryFn: async () => {
      try {
        let queries = [];
        
        // Add filters if provided
        if (options?.filters && options.filters.length > 0) {
          queries = [...options.filters];
        }
        
        // Add ordering if provided
        if (options?.orderBy) {
          const direction = options.orderBy.direction || 'asc';
          queries.push(Query.orderAsc(options.orderBy.field));
        }
        
        // Add limit if provided
        if (options?.limit) {
          queries.push(Query.limit(options.limit));
        }
        
        // Add offset if provided
        if (options?.offset) {
          queries.push(Query.offset(options.offset));
        }
        
        const response = await databases.listDocuments(
          databaseId,
          collectionId,
          queries
        );

        return response.documents as T[];
      } catch (error) {
        logger.error(`Error fetching from ${collectionId}`, {
          category: 'database',
          data: { error, queryKey, collectionId }
        });
        throw error;
      }
    },
    enabled: options?.enabled !== false && !!userId,
    staleTime: options?.staleTime,
  });
}

/**
 * Hook for fetching a single document by ID from any collection
 */
export function useAppwriteDocument<T = any>(
  collectionId: string,
  documentId?: string,
  options?: {
    databaseId?: string;
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const databaseId = options?.databaseId || DEFAULT_DATABASE_ID;

  return useQuery({
    queryKey: ['document', collectionId, documentId, databaseId],
    queryFn: async () => {
      try {
        if (!documentId) throw new Error("Document ID is required");
        
        const response = await databases.getDocument(
          databaseId,
          collectionId,
          documentId
        );
        
        return response as T;
      } catch (error) {
        logger.error(`Error fetching document from ${collectionId}`, {
          category: 'database',
          data: { error, collectionId, documentId }
        });
        throw error;
      }
    },
    enabled: !!documentId && (options?.enabled !== false),
    staleTime: options?.staleTime,
  });
}

/**
 * Hook for mutating data in Appwrite collections
 */
export function useAppwriteMutation<T = any, TVariables = any>(
  collectionId: string,
  options?: {
    operation: 'create' | 'update' | 'delete';
    databaseId?: string;
    onSuccess?: (data: T, variables: TVariables) => void;
    invalidateQueries?: string[][];
  }
) {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const operation = options?.operation || 'create';
  const databaseId = options?.databaseId || DEFAULT_DATABASE_ID;

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        let response;

        switch (operation) {
          case 'create':
            response = await databases.createDocument(
              databaseId,
              collectionId,
              'unique()',
              variables as any
            );
            break;
          case 'update': {
            // For updates, expect an id property in variables
            const { id, ...rest } = variables as any;
            response = await databases.updateDocument(
              databaseId,
              collectionId,
              id,
              rest
            );
            break;
          }
          case 'delete': {
            // For deletes, expect an id property in variables
            const id = (variables as any).id;
            await databases.deleteDocument(
              databaseId,
              collectionId,
              id
            );
            response = { id }; // Return at least the ID for deletes
            break;
          }
        }
        
        return response as T;
      } catch (error) {
        logger.error(`Error ${operation} in ${collectionId}`, {
          category: 'database',
          data: { error, operation, collectionId, variables }
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
        // Default invalidation of the collection queries
        queryClient.invalidateQueries({ queryKey: [collectionId] });
      }
      
      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess(data, variables);
      }
    }
  });
}

// Export Appwrite services for direct use if needed
export { databases, storage };
