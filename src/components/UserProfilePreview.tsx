import React from 'react';
import { BarChart2Icon, ListMusicIcon, StarIcon } from 'lucide-react';
export function UserProfilePreview() {
  return <div className="bg-gray-100 rounded-lg p-4 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white">
          <span className="text-lg font-bold">JD</span>
        </div>
        <div>
          <h3 className="font-bold">John Doe</h3>
          <p className="text-xs opacity-70">Music enthusiast since 2018</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white p-2 rounded-lg">
          <StarIcon size={16} className="mx-auto mb-1" />
          <p className="text-xs">478</p>
          <p className="text-xs opacity-70">Ratings</p>
        </div>
        <div className="bg-white p-2 rounded-lg">
          <ListMusicIcon size={16} className="mx-auto mb-1" />
          <p className="text-xs">32</p>
          <p className="text-xs opacity-70">Lists</p>
        </div>
        <div className="bg-white p-2 rounded-lg">
          <BarChart2Icon size={16} className="mx-auto mb-1" />
          <p className="text-xs">8.7</p>
          <p className="text-xs opacity-70">Avg Rating</p>
        </div>
      </div>
    </div>;
}