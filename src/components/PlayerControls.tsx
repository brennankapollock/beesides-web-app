import React from 'react';
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, MaximizeIcon } from 'lucide-react';
interface CurrentlyPlaying {
  title: string;
  artist: string;
  cover: string;
  currentTime: string;
  duration: string;
}
interface PlayerControlsProps {
  currentlyPlaying: CurrentlyPlaying;
}
export function PlayerControls({
  currentlyPlaying
}: PlayerControlsProps) {
  return <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t z-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center px-4 py-4 md:px-6 lg:px-8">
          <img src={currentlyPlaying.cover} alt={currentlyPlaying.title} className="w-14 h-14 rounded-lg object-cover mr-4" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm truncate">
              {currentlyPlaying.title}
            </h4>
            <p className="text-xs opacity-70 truncate">
              {currentlyPlaying.artist}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-mono">
                {currentlyPlaying.currentTime}
              </span>
              <div className="flex-1 h-1 bg-gray-200 rounded-full">
                <div className="h-full w-1/2 bg-black rounded-full transition-all duration-300" />
              </div>
              <span className="text-xs font-mono">
                {currentlyPlaying.duration}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-6">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <SkipBackIcon size={20} />
            </button>
            <button className="p-3 bg-black text-white rounded-full hover:bg-gray-900 transition-colors">
              <PauseIcon size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <SkipForwardIcon size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-2">
              <MaximizeIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>;
}