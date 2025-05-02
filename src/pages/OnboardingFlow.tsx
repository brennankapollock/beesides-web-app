import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GenreSelection } from '../components/onboarding/GenreSelection';
import { ArtistSelection } from '../components/onboarding/ArtistSelection';
import { InitialRatings } from '../components/onboarding/InitialRatings';
import { RymImport } from '../components/onboarding/RymImport';
import { FollowSuggestions } from '../components/onboarding/FollowSuggestions';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

type Step = 'genres' | 'artists' | 'ratings' | 'rym' | 'follow';

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<Step>('genres');
  const [progress, setProgress] = useState({
    genres: [] as string[],
    artists: [] as string[],
    ratings: [] as Array<{
      id: number;
      rating: number;
    }>,
    following: [] as string[]
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const steps: Step[] = ['genres', 'artists', 'ratings', 'rym', 'follow'];
  const currentStepIndex = steps.indexOf(currentStep);
  
  const stepTitles = {
    genres: 'What kind of music do you like?',
    artists: 'Select some artists you enjoy',
    ratings: 'Rate some albums to get started',
    rym: 'Import your RateYourMusic data',
    follow: 'Follow some music enthusiasts'
  };
  
  // Log when component mounts
  useEffect(() => {
    console.log("OnboardingFlow mounted:", {
      userId: currentUser?.id,
      username: currentUser?.username,
      queryParams: Object.fromEntries(new URLSearchParams(location.search).entries()),
      timestamp: new Date().toISOString()
    });
  }, []);
  
  // Log when step changes
  useEffect(() => {
    console.log("Onboarding step changed:", {
      currentStep,
      stepIndex: currentStepIndex + 1,
      totalSteps: steps.length,
      userId: currentUser?.id,
      timestamp: new Date().toISOString()
    });
  }, [currentStep, currentStepIndex]);
  
  // Function to save user genre preferences to the database
  const saveUserGenres = async (genreNames: string[]) => {
    if (!currentUser?.id || genreNames.length === 0) {
      logger.warn("Cannot save user genres", {
        category: 'user',
        data: { 
          reason: !currentUser?.id ? 'No user ID' : 'No genres selected',
          userId: currentUser?.id
        }
      });
      return;
    }

    try {
      logger.info("Saving user genre preferences", {
        category: 'user',
        data: { 
          userId: currentUser.id,
          genreCount: genreNames.length,
          genres: genreNames
        }
      });

      // First, fetch genre IDs for the selected genre names
      const { data: genres, error: genresError } = await supabase
        .from('genres')
        .select('id, name')
        .in('name', genreNames);

      if (genresError) {
        throw genresError;
      }

      if (!genres || genres.length === 0) {
        logger.warn("No matching genres found in database", {
          category: 'user',
          data: { selectedGenres: genreNames }
        });
        return;
      }

      logger.debug("Found genre IDs", {
        category: 'user',
        data: { 
          foundGenres: genres.map(g => g.name),
          genreIds: genres.map(g => g.id)
        }
      });

      // Clear existing user genre preferences
      const { error: deleteError } = await supabase
        .from('user_genres')
        .delete()
        .eq('user_id', currentUser.id);

      if (deleteError) {
        throw deleteError;
      }

      // Create user genre preference records
      const userGenreRecords = genres.map(genre => ({
        user_id: currentUser.id,
        genre_id: genre.id
      }));

      const { data: insertedGenres, error: insertError } = await supabase
        .from('user_genres')
        .insert(userGenreRecords)
        .select();

      if (insertError) {
        throw insertError;
      }

      logger.info("Successfully saved user genre preferences", {
        category: 'user',
        data: { 
          userId: currentUser.id,
          savedCount: insertedGenres?.length || 0
        }
      });
    } catch (error) {
      logger.error("Error saving user genre preferences", {
        category: 'user',
        data: { error }
      });
    }
  };

  const handleNext = async () => {
    const nextIndex = currentStepIndex + 1;
    
    if (nextIndex < steps.length) {
      logger.info("Moving to next onboarding step", {
        category: 'onboarding',
        data: {
          currentStep,
          nextStep: steps[nextIndex],
          progress: {
            genresCount: progress.genres.length,
            artistsCount: progress.artists.length,
            ratingsCount: progress.ratings.length,
            followingCount: progress.following.length
          }
        }
      });
      setCurrentStep(steps[nextIndex]);
    } else {
      // Onboarding complete - save data to database
      logger.info("Onboarding complete, saving preferences", {
        category: 'onboarding',
        data: {
          finalProgress: {
            genresSelected: progress.genres,
            artistsSelected: progress.artists.length,
            ratingsAdded: progress.ratings.length,
            followingAdded: progress.following.length
          },
          userId: currentUser?.id
        }
      });

      // Save user genre preferences
      await saveUserGenres(progress.genres);
      
      // Navigate to discover page
      navigate('/discover');
    }
  };
  
  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      logger.info("Moving to previous onboarding step", {
        category: 'onboarding',
        data: {
          currentStep,
          prevStep: steps[prevIndex]
        }
      });
      setCurrentStep(steps[prevIndex]);
    }
  };
  
  const updateProgress = (step: Step, data: any) => {
    logger.debug(`Updating ${step} progress`, {
      category: 'onboarding',
      data: {
        step,
        dataLength: Array.isArray(data) ? data.length : 'not array',
        data: data,
        userId: currentUser?.id
      }
    });
    
    setProgress(prev => ({
      ...prev,
      [step]: data
    }));
  };
  const renderStep = () => {
    logger.debug(`Rendering onboarding step: ${currentStep}`, {
      category: 'onboarding',
      data: {
        progressData: {
          genresCount: progress.genres.length,
          artistsCount: progress.artists.length,
          ratingsCount: progress.ratings.length,
          followingCount: progress.following.length
        },
        userId: currentUser?.id
      }
    });
    
    switch (currentStep) {
      case 'genres':
        return <GenreSelection selectedGenres={progress.genres} onUpdate={genres => updateProgress('genres', genres)} />;
      case 'artists':
        return <ArtistSelection selectedGenres={progress.genres} selectedArtists={progress.artists} onUpdate={artists => updateProgress('artists', artists)} />;
      case 'ratings':
        return <InitialRatings selectedGenres={progress.genres} selectedArtists={progress.artists} ratings={progress.ratings} onUpdate={ratings => updateProgress('ratings', ratings)} />;
      case 'rym':
        return <RymImport />;
      case 'follow':
        return <FollowSuggestions selectedGenres={progress.genres} selectedArtists={progress.artists} following={progress.following} onUpdate={following => updateProgress('following', following)} />;
    }
  };
  
  logger.debug("Rendering OnboardingFlow component", {
    category: 'onboarding',
    data: {
      currentStep,
      progress: {
        genresCount: progress.genres.length,
        artistsCount: progress.artists.length,
        ratingsCount: progress.ratings.length,
        followingCount: progress.following.length
      }
    }
  });
  
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
                width: `${(currentStepIndex + 1) / steps.length * 100}%`
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
              ${currentStepIndex === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeftIcon size={18} />
            <span>Back</span>
          </button>
          <button 
            onClick={handleNext} 
            className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            <span>
              {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
            </span>
            <ArrowRightIcon size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}