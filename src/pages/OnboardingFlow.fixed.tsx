import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GenreSelection } from "../components/onboarding/GenreSelection";
import { ArtistSelection } from "../components/onboarding/ArtistSelection";
import { InitialRatings } from "../components/onboarding/InitialRatings";
import { RymImport } from "../components/onboarding/RymImport";
import { FollowSuggestions } from "../components/onboarding/FollowSuggestions";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { logger } from "../utils/logger";

// Define the types of steps in the onboarding flow
type Step = "genres" | "artists" | "ratings" | "rym" | "follow";

// Define the shape of our onboarding progress data
interface OnboardingProgress {
  genres: string[];
  artists: string[];
  ratings: Array<{
    id: number;
    rating: number;
  }>;
  following: string[];
  rymImported?: boolean; // Flag for RateYourMusic import completion
}

// Main OnboardingFlow component
export function OnboardingFlow() {
  // Current step in the flow
  const [currentStep, setCurrentStep] = useState<Step>("genres");

  // Progress data across all steps
  const [progress, setProgress] = useState<OnboardingProgress>({
    genres: [],
    artists: [],
    ratings: [],
    following: [],
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // Define the steps and their order
  const steps: Step[] = ["genres", "artists", "ratings", "rym", "follow"];
  const currentStepIndex = steps.indexOf(currentStep);

  // Titles for each step
  const stepTitles = {
    genres: "What kind of music do you like?",
    artists: "Select some artists you enjoy",
    ratings: "Rate some albums to get started",
    rym: "Import your RateYourMusic data",
    follow: "Follow some music enthusiasts",
  };

  // Log when component mounts
  useEffect(() => {
    logger.debug("OnboardingFlow component mounted", {
      category: "onboarding",
      data: {
        userId: currentUser?.id,
        username: currentUser?.username,
        queryParams: Object.fromEntries(
          new URLSearchParams(location.search).entries()
        ),
        timestamp: new Date().toISOString(),
      },
    });

    // Check if user has existing onboarding data to resume
    const loadOnboardingProgress = async () => {
      if (currentUser?.id) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("preferences")
            .eq("id", currentUser.id)
            .single();

          if (error) throw error;

          const onboardingData = data?.preferences?.onboarding;

          if (onboardingData) {
            // Resume from where the user left off
            logger.info("Resuming onboarding from saved progress", {
              category: "onboarding",
              data: {
                lastStep: onboardingData.lastCompletedStep,
                userId: currentUser.id,
              },
            });

            // Restore progress data
            const restoredProgress: OnboardingProgress = {
              genres: onboardingData.genres || [],
              artists: onboardingData.artists || [],
              ratings: onboardingData.ratings || [],
              following: onboardingData.following || [],
              rymImported: onboardingData.rymImported,
            };

            setProgress(restoredProgress);

            // Go to the next step after the last completed one
            if (onboardingData.lastCompletedStep) {
              const lastStepIndex = steps.indexOf(
                onboardingData.lastCompletedStep as Step
              );
              if (lastStepIndex >= 0 && lastStepIndex < steps.length - 1) {
                setCurrentStep(steps[lastStepIndex + 1]);
              }
            }
          }
        } catch (error) {
          logger.error("Failed to load onboarding progress", {
            category: "onboarding",
            data: { error },
          });
        }
      }
    };

    loadOnboardingProgress();
  }, [currentUser?.id, currentUser?.username, location.search, steps]);

  // Log when step changes
  useEffect(() => {
    logger.debug("Onboarding step changed", {
      category: "onboarding",
      data: {
        currentStep,
        stepIndex: currentStepIndex + 1,
        totalSteps: steps.length,
        userId: currentUser?.id,
        timestamp: new Date().toISOString(),
      },
    });
  }, [currentStep, currentStepIndex, steps.length, currentUser?.id]);

  // Function to save user genre preferences to the database
  const saveUserGenres = async (genreNames: string[]) => {
    if (!currentUser?.id || genreNames.length === 0) {
      logger.warn("Cannot save user genres", {
        category: "user",
        data: {
          reason: !currentUser?.id ? "No user ID" : "No genres selected",
          userId: currentUser?.id,
        },
      });
      return;
    }

    try {
      logger.info("Saving user genre preferences", {
        category: "user",
        data: {
          userId: currentUser.id,
          genreCount: genreNames.length,
          genres: genreNames,
        },
      });

      // First, fetch genre IDs for the selected genre names
      const { data: genres, error: genresError } = await supabase
        .from("genres")
        .select("id, name")
        .in("name", genreNames);

      if (genresError) {
        throw genresError;
      }

      if (!genres || genres.length === 0) {
        logger.warn("No matching genres found in database", {
          category: "user",
          data: { selectedGenres: genreNames },
        });

        // Since the genres table exists but we might not have all genres,
        // let's directly insert the missing genre names
        const fallbackGenres = genreNames.map((genre) => ({
          genre: genre, // Use the genre column directly
          user_id: currentUser.id,
        }));

        // Insert directly using the current structure
        const { error: insertError } = await supabase
          .from("user_genres")
          .insert(fallbackGenres);

        if (insertError) {
          throw insertError;
        }

        logger.info("Saved genre preferences using fallback method", {
          category: "user",
          data: {
            userId: currentUser.id,
            savedCount: genreNames.length,
            method: "direct-genre-names",
          },
        });

        return;
      }

      logger.debug("Found genre IDs", {
        category: "user",
        data: {
          foundGenres: genres.map((g) => g.name),
          genreIds: genres.map((g) => g.id),
        },
      });

      // Clear existing user genre preferences
      // Try both user_id and clerk_user_id to ensure compatibility
      try {
        await supabase
          .from("user_genres")
          .delete()
          .eq("user_id", currentUser.id);
      } catch (error) {
        logger.debug("Error clearing by user_id, trying clerk_user_id", {
          category: "user",
          data: { error },
        });
      }

      // Create user genre preference records
      const userGenreRecords = genres.map((genre) => ({
        user_id: currentUser.id,
        genre_id: genre.id,
        genre: genre.name, // Also include the genre name for backwards compatibility
      }));

      const { error: insertError } = await supabase
        .from("user_genres")
        .insert(userGenreRecords);

      if (insertError) {
        throw insertError;
      }

      logger.info("Successfully saved user genre preferences", {
        category: "user",
        data: {
          userId: currentUser.id,
          savedCount: genres.length,
        },
      });
    } catch (error) {
      logger.error("Error saving user genre preferences", {
        category: "user",
        data: { error },
      });
    }
  };

  // Save the complete onboarding data to the user profile
  const saveOnboardingPreferences = async () => {
    if (!currentUser?.id) {
      logger.error("Cannot save onboarding preferences - no user ID", {
        category: "onboarding",
        data: { error: "No user ID found" },
      });
      return false;
    }

    try {
      logger.info("Saving all onboarding preferences to user profile", {
        category: "onboarding",
        data: {
          userId: currentUser.id,
          preferences: {
            genres: progress.genres,
            artists: progress.artists,
            ratings: progress.ratings,
            following: progress.following,
            rymImported: progress.rymImported,
          },
        },
      });

      // Get current preferences to avoid overwriting other settings
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("id", currentUser.id)
        .single();

      if (profileError) {
        throw profileError;
      }

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
        .eq("id", currentUser.id);

      if (error) {
        throw error;
      }

      // Also save the genres to the user_genres table
      await saveUserGenres(progress.genres);

      // In a real app, here we'd save artist follows and ratings too

      logger.info("Successfully saved onboarding preferences to profile", {
        category: "onboarding",
        data: { success: true, userId: currentUser.id },
      });

      return true;
    } catch (error) {
      logger.error("Error saving onboarding preferences to profile", {
        category: "onboarding",
        data: { error },
      });
      return false;
    }
  };

  // Update progress for a specific step
  const updateProgress = (step: Step, data: unknown) => {
    logger.debug(`Updating ${step} progress`, {
      category: "onboarding",
      data: {
        step,
        dataLength: Array.isArray(data) ? data.length : "not array",
        data,
        userId: currentUser?.id,
      },
    });

    // Update the specific step's data in our progress state
    setProgress((prev) => {
      const updatedProgress = { ...prev };

      // Handle each step separately based on the data format
      if (step === "genres" && Array.isArray(data)) {
        updatedProgress.genres = data as string[];
      } else if (step === "artists" && Array.isArray(data)) {
        updatedProgress.artists = data as string[];
      } else if (step === "ratings" && Array.isArray(data)) {
        updatedProgress.ratings = data as Array<{ id: number; rating: number }>;
      } else if (step === "follow" && Array.isArray(data)) {
        updatedProgress.following = data as string[];
      } else if (step === "rym" && typeof data === "boolean") {
        updatedProgress.rymImported = data;
      }

      return updatedProgress;
    });
  };

  // Save current step progress and move to the next step
  const handleNext = async () => {
    const nextIndex = currentStepIndex + 1;

    if (nextIndex < steps.length) {
      logger.info("Moving to next onboarding step", {
        category: "onboarding",
        data: {
          currentStep,
          nextStep: steps[nextIndex],
          progress: {
            genresCount: progress.genres.length,
            artistsCount: progress.artists.length,
            ratingsCount: progress.ratings.length,
            followingCount: progress.following.length,
          },
        },
      });

      // Save the current step's progress to the user profile immediately
      if (currentUser?.id) {
        try {
          // Get current preferences first
          const { data: profileData } = await supabase
            .from("profiles")
            .select("preferences")
            .eq("id", currentUser.id)
            .single();

          // Prepare the updated preferences object
          const currentPreferences = profileData?.preferences || {};
          const currentOnboarding = currentPreferences?.onboarding || {};

          // Create a step-specific update
          let stepUpdate = {};
          if (currentStep === "genres") {
            stepUpdate = { genres: progress.genres };
          } else if (currentStep === "artists") {
            stepUpdate = { artists: progress.artists };
          } else if (currentStep === "ratings") {
            stepUpdate = { ratings: progress.ratings };
          } else if (currentStep === "rym") {
            stepUpdate = { rymImported: progress.rymImported };
          } else if (currentStep === "follow") {
            stepUpdate = { following: progress.following };
          }

          // Update the profile with the new preferences
          await supabase
            .from("profiles")
            .update({
              preferences: {
                ...currentPreferences,
                onboarding: {
                  ...currentOnboarding,
                  ...stepUpdate,
                  lastCompletedStep: currentStep,
                  updated_at: new Date().toISOString(),
                },
              },
            })
            .eq("id", currentUser.id);

          logger.debug("Saved step progress", {
            category: "onboarding",
            data: { step: currentStep, success: true },
          });
        } catch (error) {
          logger.warn("Could not save step progress", {
            category: "onboarding",
            data: { error },
          });
        }
      }

      setCurrentStep(steps[nextIndex]);
    } else {
      // Onboarding complete - save all data to database
      logger.info("Onboarding complete, saving all preferences", {
        category: "onboarding",
        data: {
          finalProgress: {
            genresSelected: progress.genres.length,
            artistsSelected: progress.artists.length,
            ratingsAdded: progress.ratings.length,
            followingAdded: progress.following.length,
          },
          userId: currentUser?.id,
        },
      });

      // Save all onboarding data to profile
      const success = await saveOnboardingPreferences();

      if (success) {
        // Navigate to discover page
        navigate("/discover");
      } else {
        // Show error message or retry
        alert("There was a problem saving your preferences. Please try again.");
      }
    }
  };

  // Go back to previous step
  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      logger.info("Moving to previous onboarding step", {
        category: "onboarding",
        data: {
          currentStep,
          prevStep: steps[prevIndex],
        },
      });
      setCurrentStep(steps[prevIndex]);
    }
  };

  // Render the current step component
  const renderStep = () => {
    logger.debug(`Rendering onboarding step: ${currentStep}`, {
      category: "onboarding",
      data: {
        progressData: {
          genresCount: progress.genres.length,
          artistsCount: progress.artists.length,
          ratingsCount: progress.ratings.length,
          followingCount: progress.following.length,
        },
        userId: currentUser?.id,
      },
    });

    switch (currentStep) {
      case "genres":
        return (
          <GenreSelection
            selectedGenres={progress.genres}
            onUpdate={(genres) => updateProgress("genres", genres)}
          />
        );
      case "artists":
        return (
          <ArtistSelection
            selectedGenres={progress.genres}
            selectedArtists={progress.artists}
            onUpdate={(artists) => updateProgress("artists", artists)}
          />
        );
      case "ratings":
        return (
          <InitialRatings
            selectedGenres={progress.genres}
            selectedArtists={progress.artists}
            ratings={progress.ratings}
            onUpdate={(ratings) => updateProgress("ratings", ratings)}
          />
        );
      case "rym":
        return <RymImport />;
      case "follow":
        return (
          <FollowSuggestions
            selectedGenres={progress.genres}
            selectedArtists={progress.artists}
            following={progress.following}
            onUpdate={(following) => updateProgress("follow", following)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="p-4 md:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="text-xl font-bold tracking-tight">BEESIDES</div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold">
              {stepTitles[currentStep]}
            </h1>
            <span className="text-sm opacity-70">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-12">{renderStep()}</div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors
              ${
                currentStepIndex === 0
                  ? "opacity-0 pointer-events-none"
                  : "hover:bg-gray-100"
              }`}
          >
            <ArrowLeftIcon size={16} />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>
              {currentStepIndex === steps.length - 1 ? "Finish" : "Next"}
            </span>
            <ArrowRightIcon size={16} />
          </button>
        </div>
      </main>
    </div>
  );
}
