import React from 'react';
export function StatsBanner() {
  return <div className="bg-black text-white py-6 px-4 rounded-2xl mb-12">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
        <div>
          <p className="text-3xl font-bold mb-1">50k+</p>
          <p className="text-sm opacity-70">Active Users</p>
        </div>
        <div className="hidden md:block w-px h-12 bg-white/20" />
        <div>
          <p className="text-3xl font-bold mb-1">1M+</p>
          <p className="text-sm opacity-70">Music Ratings</p>
        </div>
        <div className="hidden md:block w-px h-12 bg-white/20" />
        <div>
          <p className="text-3xl font-bold mb-1">100k+</p>
          <p className="text-sm opacity-70">Albums Cataloged</p>
        </div>
      </div>
    </div>;
}