import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GenreSelection } from "../components/onboarding/GenreSelection";
import { ArtistSelection } from "../components/onboarding/ArtistSelection";
import { RymImport } from "../components/onboarding/RymImport";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { logger } from "../utils/logger";
import { toast } from "react-hot-toast";
import {
  useOnboardingProgress,
  useUpdateOnboardingStep,
  useCompleteOnboarding,
  OnboardingProgress,
} from "../hooks/queries/useOnboardingQueries";
import { useCurrentUserProfile } from "../hooks/useAppwriteProfile";

// Define the types of steps in the onboarding flow
type Step = "genres" | "artists" | "rym";

export function OnboardingFlow() {
  // Ensure user profile exists
  const { loading: profileLoading } = useCurrentUserProfile();
  // Current step in the flow - start with genres
  const [currentStep, setCurrentStep] = useState<Step>("genres");

  // Progress data across all steps
  const [progress, setProgress] = useState<OnboardingProgress>({
    genres: [],
    artists: [],
  });

  // Track if user is new from registration
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // Define the steps and their order using useMemo
  const steps = useMemo<Step[]>(
    () => ["genres", "artists", "rym"],
    []
  );
  const currentStepIndex = steps.indexOf(currentStep);

  // Titles for each step
  const stepTitles = {
    genres: "What kind of music do you like?",
    artists: "Select some artists you enjoy",
    rym: "Import your RateYourMusic data",
  };

  // Setup React Query hooks
  const { data: onboardingData, isLoading: onboardingLoading, error } = useOnboardingProgress();
  
  // Combined loading state
  const isLoading = profileLoading || onboardingLoading;

  const { mutate: updateStep } = useUpdateOnboardingStep();
  const { mutate: completeOnboarding } = useCompleteOnboarding();

  // Check if user is coming from registration and handle onboarding accordingly
  useEffect(() => {
    const fromRegistration =
      sessionStorage.getItem("registration_complete") === "true";
    const needsOnboarding =
      sessionStorage.getItem("needs_onboarding") === "true";
    const fromParam = new URLSearchParams(location.search).get("from");

    console.log("OnboardingFlow checking registration status:", {
      fromRegistration,
      needsOnboarding,
      fromParam,
      sessionStorageKeys: Object.keys(sessionStorage),
      pathname: location.pathname,
      search: location.search,
      userId: currentUser?.id,
      timestamp: new Date().toISOString(),
    });

    // More robust check for new users coming from registration
    const isFromRegistration =
      fromRegistration || fromParam === "signup" || needsOnboarding;

    if (isFromRegistration) {
      console.log(
        "User is coming from registration, starting onboarding from first step",
        { isFromRegistration, timestamp: new Date().toISOString() }
      );

      // Start from the first step for new users
      setCurrentStep("genres");
      setIsNewUser(true);

      // Reset progress data for new users
      setProgress({
        genres: [],
        artists: [],
        rymImported: false,
      });

      // Don't remove the registration_complete flag until onboarding is fully complete
      // This ensures that if the user refreshes during onboarding, they'll still be recognized as a new user
      // We'll remove it in the completeOnboarding function instead
    }

    logger.debug("OnboardingFlow component mounted", {
      category: "onboarding",
      data: {
        userId: currentUser?.id,
        username: currentUser?.username,
        fromRegistration,
        needsOnboarding,
        fromParam,
        isNewUser:
          fromRegistration || (fromParam === "signup" && needsOnboarding),
        queryParams: Object.fromEntries(
          new URLSearchParams(location.search).entries()
        ),
        timestamp: new Date().toISOString(),
      },
    });
  }, [
    currentUser?.id,
    currentUser?.username,
    location.search,
    location.pathname,
  ]);

  // Initialize onboarding progress from query data
  useEffect(() => {
    if (onboardingData) {
      // Don't restore progress if this is a new user from registration
      if (!isNewUser) {
        // Restore progress data
        setProgress({
          genres: onboardingData.genres || [],
          artists: onboardingData.artists || [],
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
    }
  }, [onboardingData, steps, isNewUser]);

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
        // Handle both number and string IDs
        updatedProgress.ratings = data.map((item) => ({
          id: typeof item.id === "string" ? parseInt(item.id, 10) : item.id,
          rating: item.rating,
        }));
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
    if (!currentUser) {
      logger.error("Cannot proceed with onboarding - user not authenticated", {
        category: "onboarding",
      });
      toast.error("Please sign in to continue with onboarding");
      navigate("/login?redirect=/onboarding");
      return;
    }

    // Log the current step and progress
    logger.debug(`Saving progress for step: ${currentStep}`, {
      category: "onboarding",
      data: {
        step: currentStep,
        progressData: progress,
        userId: currentUser?.id,
      },
    });

    const nextIndex = currentStepIndex + 1;

    // If this is the last step, complete the onboarding
    if (nextIndex >= steps.length) {
      logger.info("Completing onboarding process", {
        category: "onboarding",
        data: {
          userId: currentUser?.id,
          username: currentUser?.username,
        },
      });

      // Call the completeOnboarding mutation
      completeOnboarding(
        { progress },
        {
          onSuccess: () => {
            // Clear the registration flags from session storage
            sessionStorage.removeItem("registration_complete");
            sessionStorage.removeItem("needs_onboarding");

            logger.info("Onboarding completed successfully", {
              category: "onboarding",
              data: { userId: currentUser?.id },
            });

            toast.success("Profile setup complete!");
            navigate("/"); // Navigate to home page
          },
          onError: (error) => {
            logger.error("Failed to complete onboarding", {
              category: "onboarding",
              data: { error: error.message },
            });
            toast.error("Failed to save your preferences. Please try again.");
          },
        }
      );
      return;
    }

    // Otherwise, update the current step progress and move to the next step
    updateStep(
      {
        step: currentStep,
        data: progress[currentStep as keyof typeof progress],
      },
      {
        onSuccess: () => {
          logger.debug(`Progress saved for step: ${currentStep}`, {
            category: "onboarding",
          });
          // Move to the next step
          const nextStep = steps[nextIndex];
          setCurrentStep(nextStep);
        },
        onError: (error) => {
          logger.error(`Failed to save progress for step: ${currentStep}`, {
            category: "onboarding",
            data: { error: error.message },
          });
          toast.error("Failed to save your progress. Please try again.");
        },
      }
    );
  }

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

  // Check if user is coming from registration
  const isFromRegistration = 
    sessionStorage.getItem("registration_complete") === "true" ||
    sessionStorage.getItem("needs_onboarding") === "true" ||
    new URLSearchParams(location.search).get("from") === "signup";

  // Show error state, but bypass for new users from registration
  if (error && !isFromRegistration) {
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
  
  // For new users from registration with API errors, we'll continue with empty data
  // This prevents the error screen from showing when a new user registers

  // Render the current step component
  const renderStep = () => {
    logger.debug(`Rendering onboarding step: ${currentStep}`, {
      category: "onboarding",
      data: {
        progressData: {
          genresCount: progress.genres.length,
          artistsCount: progress.artists.length,
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

      case "rym":
        return <RymImport />;

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

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            renderStep()
          )}
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
