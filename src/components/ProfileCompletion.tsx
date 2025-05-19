import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCurrentUserProfile } from "../hooks/useAppwriteProfile";
import { logger } from "../utils/logger";

interface ProfileCompletionProps {
  onComplete?: () => void;
}

export function ProfileCompletion({ onComplete }: ProfileCompletionProps) {
  const { currentUser, updateProfile } = useAuth();
  const { profileData, updateProfile: updateUserProfile } = useCurrentUserProfile();
  const [bio, setBio] = useState(profileData?.bio || "");
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>(profileData?.preferredGenres || []);
  const [favoriteArtists, setFavoriteArtists] = useState<string[]>(profileData?.favoriteArtists || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Predefined genre options
  const genreOptions = [
    "Rock", "Pop", "Hip Hop", "R&B", "Jazz", "Classical", "Electronic", 
    "Folk", "Country", "Metal", "Blues", "Reggae", "Punk", "Soul", "Funk",
    "Indie", "Alternative", "Ambient", "Techno", "House"
  ];

  const handleGenreToggle = (genre: string) => {
    setFavoriteGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : [...prev, genre]
    );
  };

  const handleArtistInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const newArtist = e.currentTarget.value.trim();
      if (!favoriteArtists.includes(newArtist)) {
        setFavoriteArtists(prev => [...prev, newArtist]);
      }
      e.currentTarget.value = '';
      e.preventDefault();
    }
  };

  const removeArtist = (artist: string) => {
    setFavoriteArtists(prev => prev.filter(a => a !== artist));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (favoriteGenres.length === 0) {
      setError("Please select at least one genre");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      logger.info("Completing user profile", {
        category: "profile",
        data: { userId: currentUser?.id }
      });

      // Update the user profile in the database
      await updateUserProfile({
        bio,
        preferredGenres: favoriteGenres,
        favoriteArtists,
        onboardingCompleted: true
      });

      // Mark onboarding as completed
      sessionStorage.removeItem("needs_onboarding");
      sessionStorage.removeItem("registration_complete");

      logger.info("Profile completion successful", {
        category: "profile",
        data: { userId: currentUser?.id }
      });

      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      } else {
        // Otherwise navigate to the home page
        navigate("/");
      }
    } catch (err) {
      logger.error("Profile completion failed", {
        category: "profile",
        data: { 
          userId: currentUser?.id,
          error: err instanceof Error ? err.message : String(err)
        }
      });
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bio Section */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Tell us about yourself and your music taste..."
            rows={4}
          />
        </div>
        
        {/* Genres Section */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Favorite Genres
          </label>
          <div className="flex flex-wrap gap-2">
            {genreOptions.map(genre => (
              <button
                key={genre}
                type="button"
                onClick={() => handleGenreToggle(genre)}
                className={`px-3 py-1 rounded-full text-sm ${
                  favoriteGenres.includes(genre)
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
        
        {/* Artists Section */}
        <div>
          <label htmlFor="artists" className="block text-sm font-medium mb-2">
            Favorite Artists
          </label>
          <div className="mb-2">
            <input
              id="artists"
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Type an artist name and press Enter"
              onKeyDown={handleArtistInput}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {favoriteArtists.map(artist => (
              <div
                key={artist}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {artist}
                <button
                  type="button"
                  onClick={() => removeArtist(artist)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-bold disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Complete Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfileCompletion;
