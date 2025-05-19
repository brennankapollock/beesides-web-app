import { useState, useEffect } from 'react';
import { databases, ID, Query } from '../lib/appwrite';
import { useAuth } from './useAuth';

// Database and collection IDs
const DB_ID = 'beesides_db';
const USERS_COLLECTION = 'users';

// User interface
export interface User {
  id?: string;
  userId?: string;
  name?: string;
  email?: string;
  username?: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  created_at?: string;
  joinDate?: string;
  bio?: string;
  preferredGenres?: string[];
  favoriteArtists?: string[];
  onboardingCompleted?: boolean;
  stats?: {
    ratings: number;
    reviews: number;
    lists: number;
    followers: number;
    following: number;
  };
}

/**
 * Fetch user profile data by username
 */
export async function fetchUserProfileByUsername(username: string): Promise<User | null> {
  try {
    if (!username || username === 'me' || username === 'guest') {
      return null;
    }
    
    console.log("Fetching profile data from Appwrite for:", username);
    
    const response = await databases.listDocuments(
      DB_ID,
      USERS_COLLECTION,
      [Query.equal("name", username), Query.limit(1)]
    );

    const userData = response.documents[0];
    
    if (userData) {
      console.log("Profile data fetched successfully:", userData.name);
      return {
        id: userData.$id,
        userId: userData.userId,
        name: userData.name,
        email: userData.email,
        username: userData.name, // Using name as username for now
        avatar: userData.avatarUrl,
        avatarUrl: userData.avatarUrl,
        joinDate: `Member since ${new Date(
          userData.$createdAt || Date.now()
        ).getFullYear()}`,
        bio: userData.bio || "No bio available",
        preferredGenres: userData.preferredGenres || [],
        favoriteArtists: userData.favoriteArtists || [],
        onboardingCompleted: userData.onboardingCompleted || false,
        stats: {
          ratings: userData.ratings_count || 0,
          reviews: userData.reviews_count || 0,
          lists: userData.collections_count || 0,
          followers: userData.followers_count || 0,
          following: userData.following_count || 0,
        },
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw error;
  }
}

/**
 * Fetch user profile data by user ID
 */
export async function fetchUserProfileByUserId(userId: string): Promise<User | null> {
  try {
    if (!userId) {
      return null;
    }
    
    console.log("Fetching profile data from Appwrite for user ID:", userId);
    
    const response = await databases.listDocuments(
      DB_ID,
      USERS_COLLECTION,
      [Query.equal("userId", userId), Query.limit(1)]
    );

    const userData = response.documents[0];
    
    if (userData) {
      console.log("Profile data fetched successfully for user ID:", userId);
      return {
        id: userData.$id,
        userId: userData.userId,
        name: userData.name,
        email: userData.email,
        username: userData.name, // Using name as username for now
        avatar: userData.avatarUrl,
        avatarUrl: userData.avatarUrl,
        joinDate: `Member since ${new Date(
          userData.$createdAt || Date.now()
        ).getFullYear()}`,
        bio: userData.bio || "No bio available",
        preferredGenres: userData.preferredGenres || [],
        favoriteArtists: userData.favoriteArtists || [],
        onboardingCompleted: userData.onboardingCompleted || false,
        stats: {
          ratings: userData.ratings_count || 0,
          reviews: userData.reviews_count || 0,
          lists: userData.collections_count || 0,
          followers: userData.followers_count || 0,
          following: userData.following_count || 0,
        },
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw error;
  }
}

/**
 * Create a new user profile in the database
 */
export async function createUserProfile(userData: {
  userId: string;
  name: string;
  email: string;
}): Promise<User | null> {
  try {
    if (!userData.userId) {
      console.error("Cannot create user profile: missing userId");
      return null;
    }
    
    console.log("Creating new user profile for:", userData.name);
    
    // First check if a profile already exists for this user
    try {
      const existingProfile = await fetchUserProfileByUserId(userData.userId);
      if (existingProfile) {
        console.log("User profile already exists, returning existing profile");
        return existingProfile;
      }
    } catch (error) {
      // Profile doesn't exist, continue with creation
    }
    
    // Create a new document in the users collection with attributes that match the schema
    const newUser = await databases.createDocument(
      DB_ID,
      USERS_COLLECTION,
      ID.unique(), // Generate a unique ID for the document
      {
        userId: userData.userId,
        name: userData.name,
        email: userData.email, // Email is required in the schema
        bio: "",
        avatarUrl: null,
        preferredGenres: [],
        favoriteArtists: [],
        onboardingCompleted: false
      }
    );
    
    console.log("User profile created successfully:", newUser.$id);
    
    return {
      id: newUser.$id,
      userId: newUser.userId,
      name: newUser.name,
      email: newUser.email,
      username: newUser.name,
      bio: newUser.bio || "",
      avatarUrl: newUser.avatarUrl,
      preferredGenres: newUser.preferredGenres || [],
      favoriteArtists: newUser.favoriteArtists || [],
      onboardingCompleted: newUser.onboardingCompleted || false,
      joinDate: `Member since ${new Date(newUser.$createdAt).getFullYear()}`,
      stats: {
        ratings: 0,
        reviews: 0,
        lists: 0,
        followers: 0,
        following: 0
      }
    };
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

/**
 * Update an existing user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    console.log("Updating user profile for user ID:", userId);
    
    // First fetch the current profile to get the document ID
    const existingUser = await fetchUserProfileByUserId(userId);
    if (!existingUser || !existingUser.id) {
      console.error("Cannot update non-existent user profile");
      return null;
    }
    
    // Prepare the update data (remove any fields that shouldn't be directly updated)
    const updateData: Record<string, any> = {};
    
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.avatarUrl !== undefined) updateData.avatarUrl = updates.avatarUrl;
    if (updates.preferredGenres !== undefined) updateData.preferredGenres = updates.preferredGenres;
    if (updates.favoriteArtists !== undefined) updateData.favoriteArtists = updates.favoriteArtists;
    if (updates.onboardingCompleted !== undefined) updateData.onboardingCompleted = updates.onboardingCompleted;
    
    // Only update name if provided and different
    if (updates.name !== undefined && updates.name !== existingUser.name) {
      updateData.name = updates.name;
    }
    
    const updatedUser = await databases.updateDocument(
      DB_ID,
      USERS_COLLECTION,
      existingUser.id,
      updateData
    );
    
    console.log("User profile updated successfully:", updatedUser.$id);
    
    return {
      id: updatedUser.$id,
      userId: updatedUser.userId,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.name,
      bio: updatedUser.bio || "",
      avatarUrl: updatedUser.avatarUrl,
      preferredGenres: updatedUser.preferredGenres || [],
      favoriteArtists: updatedUser.favoriteArtists || [],
      onboardingCompleted: updatedUser.onboardingCompleted || false,
      joinDate: `Member since ${new Date(updatedUser.$createdAt).getFullYear()}`,
      stats: {
        ratings: updatedUser.ratings_count || 0,
        reviews: updatedUser.reviews_count || 0,
        lists: updatedUser.collections_count || 0,
        followers: updatedUser.followers_count || 0,
        following: updatedUser.following_count || 0
      }
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

/**
 * Hook to fetch and manage a user profile by username
 */
export function useUserProfile(username: string | undefined) {
  const [profileData, setProfileData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }
    
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Skip fetch for special usernames like 'me' or 'guest'
        if (username === 'me' || username === 'guest') {
          setLoading(false);
          return;
        }
        
        const userData = await fetchUserProfileByUsername(username);
        setProfileData(userData);
      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [username]);
  
  return {
    profileData,
    loading,
    error,
    setProfileData
  };
}

/**
 * Hook to fetch and manage the current user's profile
 */
export function useCurrentUserProfile() {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!currentUser) {
      setProfileData(null);
      setLoading(false);
      return;
    }
    
    const fetchCurrentUserProfile = async () => {
      try {
        setLoading(true);
        
        // Try to fetch the existing profile
        let userData = await fetchUserProfileByUserId(currentUser.id);
        
        // If no profile exists, create one
        if (!userData) {
          userData = await createUserProfile({
            userId: currentUser.id,
            name: currentUser.name || currentUser.email.split('@')[0],
            email: currentUser.email
          });
        }
        
        setProfileData(userData);
      } catch (err: any) {
        console.error("Error fetching/creating current user profile:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUserProfile();
  }, [currentUser]);
  
  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser || !profileData) {
      throw new Error("Cannot update profile: user not authenticated or profile not loaded");
    }
    
    try {
      setLoading(true);
      const updatedProfile = await updateUserProfile(currentUser.id, updates);
      setProfileData(updatedProfile);
      return updatedProfile;
    } catch (err: any) {
      console.error("Error updating user profile:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const completeOnboarding = async (onboardingData: {
    bio?: string;
    preferredGenres?: string[];
    favoriteArtists?: string[];
  }) => {
    return updateProfile({
      ...onboardingData,
      onboardingCompleted: true
    });
  };
  
  return {
    profileData,
    loading,
    error,
    updateProfile,
    completeOnboarding
  };
}
