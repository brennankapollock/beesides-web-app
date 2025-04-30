import React from 'react';
import { Link } from './Link';
import { ListMusicIcon, StarIcon } from 'lucide-react';
interface UserCardProps {
  user: {
    id: number;
    name: string;
    username: string;
    avatar: string;
    reviews: number;
    collections: number;
  };
}
export function UserCard({
  user
}: UserCardProps) {
  return <Link to={`/profile/${user.username}`} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
        <div>
          <h3 className="font-bold truncate">{user.name}</h3>
          <p className="text-sm opacity-70">@{user.username}</p>
        </div>
      </div>
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1">
          <StarIcon size={16} />
          <span>{user.reviews} reviews</span>
        </div>
        <div className="flex items-center gap-1">
          <ListMusicIcon size={16} />
          <span>{user.collections} collections</span>
        </div>
      </div>
    </Link>;
}