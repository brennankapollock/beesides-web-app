import { useState, useEffect } from 'react';
import { Client, Databases, Query } from 'appwrite';

// Initialize Appwrite
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '681f8b930020ae807d29');

const databases = new Databases(client);

// Database and collection IDs
const DB_ID = 'default_database';
const ACTIVITIES_COLLECTION = 'activities';

// Interface for Activity objects
export interface Activity {
  id: string;
  user_id: string;
  username?: string;
  user_avatar?: string;
  type: 'rating' | 'review' | 'collection' | 'follow';
  content?: string;
  rating?: number;
  album_id?: string;
  album_title?: string;
  album_artist?: string;
  album_cover?: string;
  collection_id?: string;
  collection_title?: string;
  target_user_id?: string;
  target_username?: string;
  created_at: string;
}

/**
 * Get recent activities for the feed
 */
export function useRecentActivities(limit = 20) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        const response = await databases.listDocuments(
          DB_ID,
          ACTIVITIES_COLLECTION,
          [
            Query.orderDesc("created_at"),
            Query.limit(limit)
          ]
        );

        if (response.documents.length > 0) {
          const formattedActivities = response.documents.map(doc => ({
            id: doc.$id,
            user_id: doc.user_id,
            username: doc.username,
            user_avatar: doc.user_avatar,
            type: doc.type,
            content: doc.content,
            rating: doc.rating,
            album_id: doc.album_id,
            album_title: doc.album_title,
            album_artist: doc.album_artist,
            album_cover: doc.album_cover,
            collection_id: doc.collection_id,
            collection_title: doc.collection_title,
            target_user_id: doc.target_user_id,
            target_username: doc.target_username,
            created_at: doc.created_at || doc.$createdAt,
          }));
          
          setActivities(formattedActivities);
        } else {
          setActivities([]);
        }
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching activities'));
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [limit]);

  return { activities, loading, error };
}

/**
 * Get activities for a specific user
 */
export function useUserActivities(userId: string | undefined, limit = 10) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserActivities = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const response = await databases.listDocuments(
          DB_ID,
          ACTIVITIES_COLLECTION,
          [
            Query.equal("user_id", userId),
            Query.orderDesc("created_at"),
            Query.limit(limit)
          ]
        );

        if (response.documents.length > 0) {
          const formattedActivities = response.documents.map(doc => ({
            id: doc.$id,
            user_id: doc.user_id,
            username: doc.username,
            user_avatar: doc.user_avatar,
            type: doc.type,
            content: doc.content,
            rating: doc.rating,
            album_id: doc.album_id,
            album_title: doc.album_title,
            album_artist: doc.album_artist,
            album_cover: doc.album_cover,
            collection_id: doc.collection_id,
            collection_title: doc.collection_title,
            target_user_id: doc.target_user_id,
            target_username: doc.target_username,
            created_at: doc.created_at || doc.$createdAt,
          }));
          
          setActivities(formattedActivities);
        } else {
          setActivities([]);
        }
      } catch (err) {
        console.error("Error fetching user activities:", err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching user activities'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserActivities();
  }, [userId, limit]);

  return { activities, loading, error };
}

/**
 * Create a new activity
 */
export async function createActivity(activity: Omit<Activity, 'id' | 'created_at'>) {
  try {
    const response = await databases.createDocument(
      DB_ID,
      ACTIVITIES_COLLECTION,
      'unique()', // Generate a unique ID
      {
        ...activity,
        created_at: new Date().toISOString()
      }
    );

    return {
      success: true,
      activity: {
        ...activity,
        id: response.$id,
        created_at: response.created_at || response.$createdAt
      }
    };
  } catch (error) {
    console.error("Error creating activity:", error);
    return {
      success: false,
      error: error
    };
  }
}
