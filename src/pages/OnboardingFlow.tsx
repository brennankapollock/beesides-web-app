import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenreSelection } from '../components/onboarding/GenreSelection';
import { ArtistSelection } from '../components/onboarding/ArtistSelection';
import { InitialRatings } from '../components/onboarding/InitialRatings';
import { RymImport } from '../components/onboarding/RymImport';
import { FollowSuggestions } from '../components/onboarding/FollowSuggestions';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
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
  const steps: Step[] = ['genres', 'artists', 'ratings', 'rym', 'follow'];
  const currentStepIndex = steps.indexOf(currentStep);
  const stepTitles = {
    genres: 'What kind of music do you like?',
    artists: 'Select some artists you enjoy',
    ratings: 'Rate some albums to get started',
    rym: 'Import your RateYourMusic data',
    follow: 'Follow some music enthusiasts'
  };
  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    } else {
      // Onboarding complete
      navigate('/discover');
    }
  };
  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };
  const updateProgress = (step: Step, data: any) => {
    setProgress(prev => ({
      ...prev,
      [step]: data
    }));
  };
  const renderStep = () => {
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
  return <div className="min-h-screen bg-white">
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
            <div className="h-full bg-black transition-all duration-300" style={{
            width: `${(currentStepIndex + 1) / steps.length * 100}%`
          }} />
          </div>
        </div>
        {/* Step Content */}
        <div className="mb-12">{renderStep()}</div>
        {/* Navigation */}
        <div className="flex justify-between">
          <button onClick={handleBack} className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors
              ${currentStepIndex === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-gray-100'}`}>
            <ArrowLeftIcon size={18} />
            <span>Back</span>
          </button>
          <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors">
            <span>
              {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
            </span>
            {currentStepIndex !== steps.length - 1 && <ArrowRightIcon size={18} />}
          </button>
        </div>
      </main>
    </div>;
}
