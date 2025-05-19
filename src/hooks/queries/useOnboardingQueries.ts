import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import { logger } from '../../utils/logger';
import { account } from '../../lib/appwrite';
import { fetchUserProfileByUserId, updateUserProfile } from '../useAppwriteProfile';

// Helper function to get authorization headers
// Exported for potential future use in API calls
export async function getAuthHeaders(): Promise<HeadersInit> {
  try {
    const jwt = await account.createJWT();
    return {
      'Authorization': `Bearer ${jwt.jwt}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    logger.error("Failed to create JWT for API auth", { 
      category: "auth", 
      data: { error: error instanceof Error ? error.message : String(error) }
    });
    return {
      'Content-Type': 'application/json'
    };
  }
}

export interface OnboardingProgress {
  genres: string[];
  artists: string[];
  rymImported?: boolean;
}

export interface FullOnboardingProgress extends OnboardingProgress {
  lastCompletedStep?: string;
}

/**
 * Hook to fetch onboarding progress for the current user
 */
export function useOnboardingProgress() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;

  return useQuery<FullOnboardingProgress, Error>({
    queryKey: ['onboarding', 'progress', userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required for query key.");

      const isFromRegistration = 
        sessionStorage.getItem("registration_complete") === "true" ||
        sessionStorage.getItem("needs_onboarding") === "true";

      logger.info("Fetching onboarding progress from Appwrite...", { 
        category: "onboarding", 
        data: { userId, isFromRegistration } 
      });
      
      try {
        // Fetch user profile from Appwrite
        const userProfile = await fetchUserProfileByUserId(userId);
        
        if (!userProfile) {
          logger.info("No user profile found, returning default empty data", {
            category: "onboarding",
            data: { userId }
          });
          return {
            genres: [],
            artists: [],
            ratings: [],
            following: [],
            rymImported: false,
            lastCompletedStep: undefined,
          };
        }
        
        // Extract onboarding data from user profile
        const onboardingData: FullOnboardingProgress = {
          genres: userProfile.preferredGenres || [],
          artists: userProfile.favoriteArtists || [],
          ratings: [], // We'll need to implement this later
          following: [], // We'll need to implement this later
          rymImported: false,
          lastCompletedStep: userProfile.onboardingCompleted ? 'complete' : undefined,
        };
        
        logger.info("Fetched onboarding progress from Appwrite", {
          category: "onboarding",
          data: { 
            userId,
            genresCount: onboardingData.genres.length,
            artistsCount: onboardingData.artists.length,
            onboardingCompleted: userProfile.onboardingCompleted
          }
        });
        
        return onboardingData;
      } catch (error) {
        logger.error("Unexpected error fetching onboarding progress from Appwrite", {
          category: "onboarding",
          data: { userId, error: error instanceof Error ? error.message : String(error) },
        });
        
        if (isFromRegistration) {
          logger.info("New user from registration with fetch error, returning default empty data", {
            category: "onboarding",
            data: { userId }
          });
          return {
            genres: [],
            artists: [],
            ratings: [],
            following: [],
            rymImported: false,
            lastCompletedStep: undefined,
          };
        }
        
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

interface UpdateOnboardingStepPayload {
  step: string;
  data: unknown;
}

/**
 * Hook to update onboarding step data
 */
export function useUpdateOnboardingStep() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, UpdateOnboardingStepPayload>({
    mutationFn: async ({ step, data }) => {
      const userId = currentUser?.id;
      if (!userId) throw new Error("User ID required for mutation context.");

      logger.info(`Updating onboarding step in Appwrite: ${step}`, { 
        category: "onboarding", 
        data: { userId, step }
      });
      
      // Get current user profile
      const userProfile = await fetchUserProfileByUserId(userId);
      
      if (!userProfile) {
        throw new Error("User profile not found");
      }
      
      // Prepare update data based on the step
      const updateData: Record<string, any> = {};
      
      switch (step) {
        case 'genres':
          updateData.preferredGenres = data as string[];
          break;
        case 'artists':
          updateData.favoriteArtists = data as string[];
          break;
        case 'ratings':
          // We'll implement this later when we have a ratings collection
          break;
        case 'follow':
          // We'll implement this later when we have a following collection
          break;
      }
      
      // Update the user profile in Appwrite
      const updatedProfile = await updateUserProfile(userId, updateData);
      
      logger.debug("Updated onboarding step successfully in Appwrite", {
        category: "onboarding",
        data: { userId, step },
      });
      
      return updatedProfile;
    },
    onSuccess: (_data, variables) => {
      logger.info("useUpdateOnboardingStep: onSuccess", { 
        category: "onboarding", 
        data: { variables } 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['onboarding', 'progress', currentUser?.id] 
      });
    }
  });
}

interface CompleteOnboardingPayload {
  progress: OnboardingProgress;
}

/**
 * Hook to complete the onboarding process
 */
export function useCompleteOnboarding() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, CompleteOnboardingPayload>({
    mutationFn: async ({ progress }) => {
      const userId = currentUser?.id;
      if (!userId) throw new Error("User ID required for mutation context.");

      logger.info("Completing onboarding in Appwrite...", { 
        category: "onboarding", 
        data: { userId } // Progress can be large, omitting from logs
      });
      
      // Get current user profile
      const userProfile = await fetchUserProfileByUserId(userId);
      
      if (!userProfile) {
        throw new Error("User profile not found");
      }
      
      // Prepare update data with all progress data and mark onboarding as completed
      const updateData: Record<string, any> = {
        preferredGenres: progress.genres,
        favoriteArtists: progress.artists,
        onboardingCompleted: true
      };
      
      // Update the user profile in Appwrite
      const updatedProfile = await updateUserProfile(userId, updateData);
      
      // Clear onboarding flags from session storage
      sessionStorage.removeItem("needs_onboarding");
      sessionStorage.removeItem("registration_complete");
      
      logger.info("Onboarding completed successfully in Appwrite", {
        category: "onboarding",
        data: { userId },
      });
      
      return updatedProfile;
    },
    onSuccess: () => {
      logger.info("useCompleteOnboarding: onSuccess", { category: "onboarding" });
      queryClient.invalidateQueries({ 
        queryKey: ['onboarding', 'progress', currentUser?.id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['profile', currentUser?.id] 
      });
    }
  });
}
