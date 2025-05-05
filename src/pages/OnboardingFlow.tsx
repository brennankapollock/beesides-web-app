import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GenreSelection } from "../components/onboarding/GenreSelection";
import { ArtistSelection } from "../components/onboarding/ArtistSelection";
import { InitialRatings } from "../components/onboarding/InitialRatings";
import { RymImport } from "../components/onboarding/RymImport";
import { FollowSuggestions } from "../components/onboarding/FollowSuggestions";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { logger } from "../utils/logger";
import {
  useOnboardingProgress,
  useUpdateOnboardingStep,
  useCompleteOnboarding,
  OnboardingProgress,
} from "../hooks/queries/useOnboardingQueries";

// Define the types of steps in the onboarding flow
type Step = "genres" | "artists" | "ratings" | "rym" | "follow";

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

  // Define the steps and their order using useMemo
  const steps = useMemo<Step[]>(
    () => ["genres", "artists", "ratings", "rym", "follow"],
    []
  );
  const currentStepIndex = steps.indexOf(currentStep);

  // Titles for each step
  const stepTitles = {
    genres: "What kind of music do you like?",
    artists: "Select some artists you enjoy",
    ratings: "Rate some albums to get started",
    rym: "Import your RateYourMusic data",
    follow: "Follow some music enthusiasts",
  };

  // Setup React Query hooks
  const { data: onboardingData, isLoading, error } = useOnboardingProgress();

  const { mutate: updateStep } = useUpdateOnboardingStep();
  const { mutate: completeOnboarding } = useCompleteOnboarding();

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
  }, [currentUser?.id, currentUser?.username, location.search]);

  // Initialize onboarding progress from query data
  useEffect(() => {
    if (onboardingData) {
      // Restore progress data
      setProgress({
        genres: onboardingData.genres || [],
        artists: onboardingData.artists || [],
        ratings: onboardingData.ratings || [],
        following: onboardingData.following || [],
        rymImported: onboardingData.rymImported,
      });

      // Go to the next step after the last completed one
      if (
        "lastCompletedStep" in onboardingData &&
        onboardingData.lastCompletedStep
      ) {
        const lastStepIndex = steps.indexOf(
          onboardingData.lastCompletedStep as Step
        );
        if (lastStepIndex >= 0 && lastStepIndex < steps.length - 1) {
          setCurrentStep(steps[lastStepIndex + 1]);
        }
      }
    }
  }, [onboardingData, steps]);

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

    // First update the step data in the database
    updateStep({
      step: currentStep,
      data:
        currentStep === "genres"
          ? progress.genres
          : currentStep === "artists"
          ? progress.artists
          : currentStep === "ratings"
          ? progress.ratings
          : currentStep === "rym"
          ? progress.rymImported
          : progress.following,
    });

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

      // Complete onboarding with all data
      completeOnboarding(
        { progress },
        {
          onSuccess: () => {
            // Navigate to discover page
            navigate("/discover");
          },
          onError: () => {
            // Show error message
            alert(
              "There was a problem saving your preferences. Please try again."
            );
          },
        }
      );
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

  // Display loading indicator while fetching initial data
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">
            Loading your onboarding progress...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="mb-4 text-xl font-bold text-error">
            Something went wrong
          </h2>
          <p className="mb-4">
            We couldn't load your onboarding information. Please try refreshing
            the page.
          </p>
          <button
            className="rounded bg-primary px-4 py-2 text-white"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

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
            onUpdate={(genres: string[]) => updateProgress("genres", genres)}
          />
        );
      case "artists":
        return (
          <ArtistSelection
            selectedArtists={progress.artists}
            onUpdate={(artists: string[]) => updateProgress("artists", artists)}
            selectedGenres={progress.genres}
          />
        );
      case "ratings":
        return (
          <InitialRatings
            ratings={progress.ratings}
            onUpdate={(ratings) => updateProgress("ratings", ratings)}
            selectedGenres={progress.genres}
            selectedArtists={progress.artists}
          />
        );
      case "rym":
        return <RymImport />;
      case "follow":
        return (
          <FollowSuggestions
            following={progress.following}
            onUpdate={(following: string[]) =>
              updateProgress("follow", following)
            }
            selectedGenres={progress.genres}
            selectedArtists={progress.artists}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            Setup Your Beesides Profile
          </h1>
          <div className="text-sm text-gray-500">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            {stepTitles[currentStep]}
          </h2>

          {renderStep()}
        </div>
      </main>

      {/* Footer with navigation buttons */}
      <footer className="border-t border-gray-200 bg-white p-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className={`flex items-center rounded px-4 py-2 ${
              currentStepIndex === 0
                ? "cursor-not-allowed text-gray-400"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {currentStepIndex === steps.length - 1 ? (
              "Finish"
            ) : (
              <>
                Next
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
