import { databases, ID, Query } from '../lib/appwrite';
import { useAuth } from './useAuth';
import { useState } from 'react';

// Database and collection IDs
const DB_ID = 'beesides_db';
const RATINGS_COLLECTION = 'ratings';
const ALBUMS_COLLECTION = 'albums';

// Rating interface
export interface Rating {
  id?: string;
  userId: string;
  albumId: string;
  rating: number;
  review?: string;
}

/**
 * Create a new rating or update an existing one
 */
export async function createOrUpdateRating(rating: Rating): Promise<Rating> {
  try {
    // Check if rating already exists
    const response = await databases.listDocuments(
      DB_ID,
      RATINGS_COLLECTION,
      [
        Query.equal('userId', rating.userId),
        Query.equal('albumId', rating.albumId)
      ]
    );

    if (response.documents.length > 0) {
      // Update existing rating
      const existingRating = response.documents[0];
      const updatedRating = await databases.updateDocument(
        DB_ID,
        RATINGS_COLLECTION,
        existingRating.$id,
        {
          rating: rating.rating,
          review: rating.review || null
        }
      );

      return {
        id: updatedRating.$id,
        userId: updatedRating.userId,
        albumId: updatedRating.albumId,
        rating: updatedRating.rating,
        review: updatedRating.review
      };
    } else {
      // Create new rating
      const newRating = await databases.createDocument(
        DB_ID,
        RATINGS_COLLECTION,
        ID.unique(),
        {
          userId: rating.userId,
          albumId: rating.albumId,
          rating: rating.rating,
          review: rating.review || null
        }
      );

      return {
        id: newRating.$id,
        userId: newRating.userId,
        albumId: newRating.albumId,
        rating: newRating.rating,
        review: newRating.review
      };
    }
  } catch (error) {
    console.error('Error creating/updating rating:', error);
    throw error;
  }
}

/**
 * Get all ratings for a user
 */
export async function getUserRatings(userId: string): Promise<Rating[]> {
  try {
    const response = await databases.listDocuments(
      DB_ID,
      RATINGS_COLLECTION,
      [Query.equal('userId', userId)]
    );

    return response.documents.map(doc => ({
      id: doc.$id,
      userId: doc.userId,
      albumId: doc.albumId,
      rating: doc.rating,
      review: doc.review
    }));
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    throw error;
  }
}

/**
 * Delete a rating
 */
export async function deleteRating(ratingId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      DB_ID,
      RATINGS_COLLECTION,
      ratingId
    );
  } catch (error) {
    console.error('Error deleting rating:', error);
    throw error;
  }
}

/**
 * Hook to manage ratings for the current user
 */
export function useRatings() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);

  const fetchUserRatings = async () => {
    if (!currentUser) {
      setRatings([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userRatings = await getUserRatings(currentUser.id);
      setRatings(userRatings);
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const rateAlbum = async (albumId: string, rating: number, review?: string) => {
    if (!currentUser) {
      throw new Error('User must be logged in to rate albums');
    }

    try {
      setLoading(true);
      setError(null);
      
      const newRating = await createOrUpdateRating({
        userId: currentUser.id,
        albumId,
        rating,
        review
      });
      
      // Update local state
      setRatings(prev => {
        const existingIndex = prev.findIndex(r => r.albumId === albumId);
        if (existingIndex >= 0) {
          // Replace existing rating
          const updated = [...prev];
          updated[existingIndex] = newRating;
          return updated;
        } else {
          // Add new rating
          return [...prev, newRating];
        }
      });
      
      return newRating;
    } catch (err) {
      console.error('Error rating album:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeRating = async (ratingId: string) => {
    if (!currentUser) {
      throw new Error('User must be logged in to remove ratings');
    }

    try {
      setLoading(true);
      setError(null);
      
      await deleteRating(ratingId);
      
      // Update local state
      setRatings(prev => prev.filter(r => r.id !== ratingId));
    } catch (err) {
      console.error('Error removing rating:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    ratings,
    loading,
    error,
    fetchUserRatings,
    rateAlbum,
    removeRating
  };
}
