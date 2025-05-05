import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';
import { logger } from '../../utils/logger';

export interface OnboardingProgress {
  genres: string[];
  artists: string[];
  ratings: Array<{ id: number; rating: number }>;
  following: string[];
  rymImported?: boolean;
}

/**
 * Hook to fetch onboarding progress for the current user
 */
export function useOnboardingProgress() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  
  return useQuery({
    queryKey: ['onboarding', 'progress', userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("preferences")
          .eq("id", userId)
          .single();

        if (error) throw error;

        const onboardingData = data?.preferences?.onboarding;
        
        if (!onboardingData) {
          return {
            genres: [],
            artists: [],
            ratings: [],
            following: [],
            rymImported: false,
          } as OnboardingProgress;
        }

        return {
          genres: onboardingData.genres || [],
          artists: onboardingData.artists || [],
          ratings: onboardingData.ratings || [],
          following: onboardingData.following || [],
          rymImported: onboardingData.rymImported || false,
          lastCompletedStep: onboardingData.lastCompletedStep,
        } as OnboardingProgress & { lastCompletedStep?: string };
      } catch (error) {
        logger.error("Failed to load onboarding progress", {
          category: "onboarding",
          data: { error, userId },
        });
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to update onboarding step data
 */
export function useUpdateOnboardingStep() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      step, 
      data 
    }: {
      step: string;
      data: unknown;
    }) => {
      const userId = currentUser?.id;
      if (!userId) throw new Error("User ID required");
      
      try {
        // Get current preferences first
        const { data: profileData, error: fetchError } = await supabase
          .from("profiles")
          .select("preferences")
          .eq("id", userId)
          .single();

        if (fetchError) throw fetchError;

        // Prepare the updated preferences object
        const currentPreferences = profileData?.preferences || {};
        const currentOnboarding = currentPreferences?.onboarding || {};

        // Create a step-specific update
        let stepUpdate = {};
        if (step === "genres") {
          stepUpdate = { genres: data };
        } else if (step === "artists") {
          stepUpdate = { artists: data };
        } else if (step === "ratings") {
          stepUpdate = { ratings: data };
        } else if (step === "rym") {
          stepUpdate = { rymImported: data };
        } else if (step === "follow") {
          stepUpdate = { following: data };
        }

        // Update the profile
        const { error } = await supabase
          .from("profiles")
          .update({
            preferences: {
              ...currentPreferences,
              onboarding: {
                ...currentOnboarding,
                ...stepUpdate,
                lastCompletedStep: step,
                updated_at: new Date().toISOString(),
              },
            },
          })
          .eq("id", userId);

        if (error) throw error;
        
        logger.debug("Updated onboarding step", {
          category: "onboarding",
          data: { step, success: true },
        });

        return { success: true, step };
      } catch (error) {
        logger.error("Failed to update onboarding step", {
          category: "onboarding",
          data: { error, step },
        });
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch onboarding data
      queryClient.invalidateQueries({ 
        queryKey: ['onboarding', 'progress', currentUser?.id] 
      });
    }
  });
}

/**
 * Hook to complete the onboarding process
 */
export function useCompleteOnboarding() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ progress }: { progress: OnboardingProgress }) => {
      const userId = currentUser?.id;
      if (!userId) throw new Error("User ID required");
      
      try {
        // Get current preferences
        const { data: profileData, error: fetchError } = await supabase
          .from("profiles")
          .select("preferences")
          .eq("id", userId)
          .single();

        if (fetchError) throw fetchError;

        const currentPreferences = profileData?.preferences || {};

        // Update profile with all onboarding preferences
        const { error } = await supabase
          .from("profiles")
          .update({
            preferences: {
              ...currentPreferences,
              onboarding: {
                genres: progress.genres,
                artists: progress.artists,
                ratings: progress.ratings,
                following: progress.following,
                rymImported: progress.rymImported,
                completed: true,
                completedAt: new Date().toISOString(),
              },
            },
          })
          .eq("id", userId);

        if (error) throw error;

        // Also save genres to user_genres table if we have them
        if (progress.genres.length > 0) {
          await saveUserGenres(userId, progress.genres);
        }

        logger.info("Successfully completed onboarding", {
          category: "onboarding",
          data: { success: true, userId },
        });

        return { success: true };
      } catch (error) {
        logger.error("Error completing onboarding", {
          category: "onboarding",
          data: { error },
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['onboarding'] 
      });
      queryClient.invalidateQueries({
        queryKey: ['user', currentUser?.id]
      });
    }
  });
}

// Helper function to save user genres
async function saveUserGenres(userId: string, genreNames: string[]) {
  if (genreNames.length === 0) return;
  
  try {
    // First, fetch genre IDs for the selected genre names
    const { data: genres, error: genresError } = await supabase
      .from("genres")
      .select("id, name")
      .in("name", genreNames);

    if (genresError) throw genresError;

    // Clear existing user genre preferences
    await supabase
      .from("user_genres")
      .delete()
      .eq("user_id", userId);

    if (!genres || genres.length === 0) {
      // Use fallback method - insert genre names directly
      const fallbackGenres = genreNames.map((genre) => ({
        genre: genre,
        user_id: userId,
      }));

      await supabase
        .from("user_genres")
        .insert(fallbackGenres);
        
      return;
    }

    // Create user genre preference records
    const userGenreRecords = genres.map((genre) => ({
      user_id: userId,
      genre_id: genre.id,
      genre: genre.name,
    }));

    await supabase.from("user_genres").insert(userGenreRecords);
    
  } catch (error) {
    logger.error("Error saving user genre preferences", {
      category: "user",
      data: { error },
    });
    throw error;
  }
}
