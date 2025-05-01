import React from 'react';
import { UserIcon, StarIcon, ListMusicIcon } from 'lucide-react';
interface FollowSuggestionsProps {
  selectedGenres: string[];
  selectedArtists: string[];
  following: string[];
  onUpdate: (following: string[]) => void;
}
export function FollowSuggestions({
  selectedGenres,
  selectedArtists,
  following,
  onUpdate
}: FollowSuggestionsProps) {
  // Mock users based on selected genres and artists
  const suggestedUsers = [{
    username: 'alexthompson',
    name: 'Alex Thompson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop',
    bio: 'Electronic music enthusiast. Always hunting for new ambient and IDM gems.',
    stats: {
      reviews: 156,
      collections: 12,
      avgRating: 8.4
    },
    genres: ['Electronic', 'Ambient', 'IDM']
  }, {
    username: 'sarahc',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop',
    bio: 'Music journalist and indie rock devotee. Building the ultimate 90s alternative collection.',
    stats: {
      reviews: 89,
      collections: 8,
      avgRating: 7.9
    },
    genres: ['Indie Rock', 'Alternative', 'Post-Rock']
  }, {
    username: 'mjazz',
    name: 'Marcus Jazz',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
    bio: 'Jazz historian and record collector. From bebop to contemporary.',
    stats: {
      reviews: 234,
      collections: 15,
      avgRating: 8.7
    },
    genres: ['Jazz', 'Fusion', 'Bebop']
  }, {
    username: 'emilyd',
    name: 'Emily Davis',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop',
    bio: 'Classical music student and contemporary composer. Always exploring new sounds.',
    stats: {
      reviews: 167,
      collections: 9,
      avgRating: 8.2
    },
    genres: ['Classical', 'Contemporary', 'Minimal']
  }];
  const toggleFollow = (username: string) => {
    if (following.includes(username)) {
      onUpdate(following.filter(u => u !== username));
    } else {
      onUpdate([...following, username]);
    }
  };
  return <div>
      <p className="text-lg mb-8">
        Follow some music enthusiasts to get started. We've suggested some users
        based on your interests.
      </p>
      <div className="grid gap-4">
        {suggestedUsers.map(user => <div key={user.username} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-4">
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold">{user.name}</h3>
                    <p className="text-sm opacity-70 mb-2">@{user.username}</p>
                  </div>
                  <button onClick={() => toggleFollow(user.username)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${following.includes(user.username) ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                    {following.includes(user.username) ? 'Following' : 'Follow'}
                  </button>
                </div>
                <p className="text-sm mb-3">{user.bio}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <StarIcon size={16} />
                    <span>{user.stats.reviews} reviews</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ListMusicIcon size={16} />
                    <span>{user.stats.collections} collections</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UserIcon size={16} />
                    <span>{user.stats.avgRating} avg rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>)}
      </div>
      <p className="text-sm text-center mt-8 text-gray-500">
        {following.length === 0 ? 'Follow at least 3 users to continue' : `Following ${following.length} users`}
      </p>
    </div>;
}