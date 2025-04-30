import React from 'react';
import { StarIcon, ListMusicIcon, MessageCircleIcon } from 'lucide-react';
export function ActivityFeed() {
  const activities = [{
    id: 1,
    user: 'Sarah K.',
    action: 'rated',
    album: 'Midnight Tales',
    rating: 4.5,
    time: '2m ago',
    type: 'rating'
  }, {
    id: 2,
    user: 'Mike R.',
    action: 'created a list',
    album: 'Best of 2024',
    tracks: 12,
    time: '15m ago',
    type: 'list'
  }, {
    id: 3,
    user: 'Alex M.',
    action: 'reviewed',
    album: 'Daily Chaos',
    comment: 'A masterpiece that defines the genre...',
    time: '1h ago',
    type: 'review'
  }];
  return <div className="space-y-4">
      {activities.map(activity => <div key={activity.id} className="bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              {activity.user.charAt(0)}
            </div>
            <p className="text-sm">
              <span className="font-bold">{activity.user}</span>
              <span className="opacity-70"> {activity.action}</span>
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">{activity.album}</p>
            {activity.type === 'rating' && <div className="flex items-center gap-1">
                <StarIcon size={16} className="fill-black" />
                <span className="text-sm font-bold">{activity.rating}</span>
              </div>}
            {activity.type === 'list' && <div className="flex items-center gap-1">
                <ListMusicIcon size={16} />
                <span className="text-sm">{activity.tracks} tracks</span>
              </div>}
            {activity.type === 'review' && <MessageCircleIcon size={16} className="opacity-70" />}
          </div>
        </div>)}
    </div>;
}