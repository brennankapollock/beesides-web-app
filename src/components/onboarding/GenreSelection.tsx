import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../utils/logger';
import { supabase } from '../../lib/supabase';

interface GenreSelectionProps {
  selectedGenres: string[];
  onUpdate: (genres: string[]) => void;
}

export function GenreSelection({
  selectedGenres,
  onUpdate
}: GenreSelectionProps) {
  const { currentUser } = useAuth();
  
  // State to store available genres from the database
  const [availableGenres, setAvailableGenres] = useState<{name: string, subgenres: string[]}[]>([
    {
      name: 'Rock',
      subgenres: ['Alternative', 'Indie', 'Classic', 'Post-Rock']
    },
    {
      name: 'Electronic',
      subgenres: ['Electronic', '90s']
    },
    {
      name: 'Hip Hop',
      subgenres: ['Hip-Hop']
    },
    {
      name: 'Jazz',
      subgenres: ['Jazz', 'Bebop', 'Fusion']
    },
    {
      name: 'Other',
      subgenres: ['Instrumental', 'New', 'Pop']
    }
  ]);
  
  // Fetch available genres from the database
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const { data, error } = await supabase
          .from('genres')
          .select('name')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          logger.debug("Fetched genres from database", {
            category: 'onboarding',
            data: { genreCount: data.length, genres: data.map(g => g.name) }
          });
          
          // This is just a fallback in case the database fetch works but we want to keep our
          // existing category structure. In a real app, you might want to have a genres_categories
          // table to properly organize genres.
        }
      } catch (error) {
        logger.error("Error fetching genres", {
          category: 'onboarding',
          data: { error }
        });
      }
    };
    
    fetchGenres();
  }, []);
  
  // Log when component mounts
  useEffect(() => {
    logger.debug("GenreSelection component mounted", {
      category: 'onboarding',
      data: {
        userId: currentUser?.id,
        initialSelectedCount: selectedGenres.length,
        initialSelected: selectedGenres,
        timestamp: new Date().toISOString()
      }
    });
  }, []);
  
  // Log when selectedGenres changes
  useEffect(() => {
    logger.debug("Selected genres updated", {
      category: 'onboarding',
      data: {
        count: selectedGenres.length,
        genres: selectedGenres,
        userId: currentUser?.id
      }
    });
  }, [selectedGenres]);
  
  const toggleGenre = (genre: string) => {
    logger.debug("Genre toggle action", {
      category: 'onboarding',
      data: {
        genre,
        action: selectedGenres.includes(genre) ? 'remove' : 'add',
        userId: currentUser?.id
      }
    });
    
    if (selectedGenres.includes(genre)) {
      onUpdate(selectedGenres.filter(g => g !== genre));
    } else {
      onUpdate([...selectedGenres, genre]);
    }
  };
  
  logger.debug("Rendering GenreSelection component", {
    category: 'onboarding',
    data: {
      selectedGenresCount: selectedGenres.length,
      totalAvailableGenres: availableGenres.reduce((acc, g) => acc + g.subgenres.length, 0)
    }
  });
  
  return (
    <div>
      <p className="text-lg mb-8">
        Select the genres you enjoy listening to. This will help us personalize
        your experience.
      </p>
      <div className="space-y-8">
        {availableGenres.map(genre => (
          <div key={genre.name}>
            <h3 className="text-xl font-bold mb-4">{genre.name}</h3>
            <div className="flex flex-wrap gap-3">
              {genre.subgenres.map(subgenre => (
                <button 
                  key={subgenre} 
                  onClick={() => toggleGenre(subgenre)} 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${selectedGenres.includes(subgenre) ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {subgenre}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}