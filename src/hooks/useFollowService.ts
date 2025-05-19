import { databases, ID, Query } from '../lib/appwrite';
import { useAuth } from './useAuth';
import { useState } from 'react';

// Database and collection IDs
const DB_ID = 'beesides_db';
const FOLLOWS_COLLECTION = 'follows';
const USERS_COLLECTION = 'users';

// Follow interface
export interface Follow {
  id?: string;
  followerId: string;
  followingId: string;
}

// User interface (simplified for following)
export interface FollowUser {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string | null;
}

/**
 * Follow a user
 */
export async function followUser(followerId: string, followingId: string): Promise<Follow> {
  try {
    // Check if already following
    const response = await databases.listDocuments(
      DB_ID,
      FOLLOWS_COLLECTION,
      [
        Query.equal('followerId', followerId),
        Query.equal('followingId', followingId)
      ]
    );

    if (response.documents.length > 0) {
      // Already following, return existing follow
      const existingFollow = response.documents[0];
      return {
        id: existingFollow.$id,
        followerId: existingFollow.followerId,
        followingId: existingFollow.followingId
      };
    } else {
      // Create new follow
      const newFollow = await databases.createDocument(
        DB_ID,
        FOLLOWS_COLLECTION,
        ID.unique(),
        {
          followerId: followerId,
          followingId: followingId
        }
      );

      return {
        id: newFollow.$id,
        followerId: newFollow.followerId,
        followingId: newFollow.followingId
      };
    }
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  try {
    // Find the follow document
    const response = await databases.listDocuments(
      DB_ID,
      FOLLOWS_COLLECTION,
      [
        Query.equal('followerId', followerId),
        Query.equal('followingId', followingId)
      ]
    );

    if (response.documents.length > 0) {
      // Delete the follow document
      await databases.deleteDocument(
        DB_ID,
        FOLLOWS_COLLECTION,
        response.documents[0].$id
      );
    }
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

/**
 * Get all users that a user is following
 */
export async function getFollowing(userId: string): Promise<FollowUser[]> {
  try {
    // Get all follows where userId is the follower
    const followsResponse = await databases.listDocuments(
      DB_ID,
      FOLLOWS_COLLECTION,
      [Query.equal('followerId', userId)]
    );

    // Get the user details for each following
    const followingIds = followsResponse.documents.map(doc => doc.followingId);
    
    if (followingIds.length === 0) {
      return [];
    }

    // Get user details for each following
    const usersResponse = await databases.listDocuments(
      DB_ID,
      USERS_COLLECTION,
      [Query.equal('userId', followingIds)]
    );

    return usersResponse.documents.map(doc => ({
      id: doc.$id,
      userId: doc.userId,
      name: doc.name,
      avatarUrl: doc.avatarUrl
    }));
  } catch (error) {
    console.error('Error getting following:', error);
    throw error;
  }
}

/**
 * Get all users who follow a user
 */
export async function getFollowers(userId: string): Promise<FollowUser[]> {
  try {
    // Get all follows where userId is being followed
    const followsResponse = await databases.listDocuments(
      DB_ID,
      FOLLOWS_COLLECTION,
      [Query.equal('followingId', userId)]
    );

    // Get the user details for each follower
    const followerIds = followsResponse.documents.map(doc => doc.followerId);
    
    if (followerIds.length === 0) {
      return [];
    }

    // Get user details for each follower
    const usersResponse = await databases.listDocuments(
      DB_ID,
      USERS_COLLECTION,
      [Query.equal('userId', followerIds)]
    );

    return usersResponse.documents.map(doc => ({
      id: doc.$id,
      userId: doc.userId,
      name: doc.name,
      avatarUrl: doc.avatarUrl
    }));
  } catch (error) {
    console.error('Error getting followers:', error);
    throw error;
  }
}

/**
 * Check if a user is following another user
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    const response = await databases.listDocuments(
      DB_ID,
      FOLLOWS_COLLECTION,
      [
        Query.equal('followerId', followerId),
        Query.equal('followingId', followingId)
      ]
    );

    return response.documents.length > 0;
  } catch (error) {
    console.error('Error checking follow status:', error);
    throw error;
  }
}

/**
 * Hook to manage follows for the current user
 */
export function useFollows() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [followers, setFollowers] = useState<FollowUser[]>([]);

  const fetchFollowing = async () => {
    if (!currentUser) {
      setFollowing([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userFollowing = await getFollowing(currentUser.id);
      setFollowing(userFollowing);
    } catch (err) {
      console.error('Error fetching following:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    if (!currentUser) {
      setFollowers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userFollowers = await getFollowers(currentUser.id);
      setFollowers(userFollowers);
    } catch (err) {
      console.error('Error fetching followers:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const follow = async (userId: string) => {
    if (!currentUser) {
      throw new Error('User must be logged in to follow others');
    }

    try {
      setLoading(true);
      setError(null);
      
      await followUser(currentUser.id, userId);
      
      // Refresh following list
      await fetchFollowing();
    } catch (err) {
      console.error('Error following user:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unfollow = async (userId: string) => {
    if (!currentUser) {
      throw new Error('User must be logged in to unfollow others');
    }

    try {
      setLoading(true);
      setError(null);
      
      await unfollowUser(currentUser.id, userId);
      
      // Update local state
      setFollowing(prev => prev.filter(f => f.userId !== userId));
    } catch (err) {
      console.error('Error unfollowing user:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkIsFollowing = async (userId: string) => {
    if (!currentUser) {
      return false;
    }

    try {
      return await isFollowing(currentUser.id, userId);
    } catch (err) {
      console.error('Error checking follow status:', err);
      return false;
    }
  };

  return {
    following,
    followers,
    loading,
    error,
    fetchFollowing,
    fetchFollowers,
    follow,
    unfollow,
    checkIsFollowing
  };
}
