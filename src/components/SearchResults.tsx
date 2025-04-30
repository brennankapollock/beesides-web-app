import React from 'react';
import { AlbumCard } from './AlbumCard';
import { AlbumListItem } from './AlbumListItem';
import { ArtistCard } from './ArtistCard';
import { UserCard } from './UserCard';
import { Link } from './Link';
import { ListMusicIcon } from 'lucide-react';
import type { ViewMode } from '../hooks/useViewMode';
interface SearchResultsProps {
  query: string;
  type: 'albums' | 'artists' | 'users' | 'collections';
  viewMode: ViewMode;
  sortBy: string;
}
export function SearchResults({
  query,
  type,
  viewMode,
  sortBy
}: SearchResultsProps) {
  // Mock data
  const albums = [{
    id: 1,
    title: 'The Suffering',
    artist: 'Emily Bryan',
    cover: 'https://images.unsplash.com/photo-1599719500956-d158a3abd461?q=80&w=2070&auto=format&fit=crop',
    rating: 9.2,
    genre: 'Classic',
    releaseDate: '2023'
  }, {
    id: 2,
    title: 'Daily Chaos',
    artist: 'Emily Bryan',
    cover: 'https://images.unsplash.com/photo-1603384164656-2b0e573ffa0b?q=80&w=1974&auto=format&fit=crop',
    rating: 8.7,
    genre: '90s',
    releaseDate: '2022'
  }, {
    id: 3,
    title: 'Simple',
    artist: 'Ryan Parker',
    cover: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?q=80&w=2070&auto=format&fit=crop',
    rating: 7.9,
    genre: 'New',
    releaseDate: '2024'
  }, {
    id: 4,
    title: 'Midnight Tales',
    artist: 'Sarah Johnson',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=2069&auto=format&fit=crop',
    rating: 9.5,
    genre: 'Electronic',
    releaseDate: '2023'
  }];
  const artists = [{
    id: 1,
    name: 'Emily Bryan',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop',
    genres: ['Classic', 'Alternative'],
    albums: 3,
    rating: 9.1
  }, {
    id: 2,
    name: 'Ryan Parker',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974&auto=format&fit=crop',
    genres: ['Electronic', 'Pop'],
    albums: 2,
    rating: 8.7
  }];
  const users = [{
    id: 1,
    name: 'Alex Thompson',
    username: 'alexthompson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop',
    reviews: 156,
    collections: 12
  }, {
    id: 2,
    name: 'Sarah Chen',
    username: 'sarahc',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop',
    reviews: 89,
    collections: 8
  }];
  const collections = [{
    id: 1,
    title: 'Best of 2023',
    creator: 'Alex Thompson',
    albumCount: 12,
    covers: [albums[0].cover, albums[1].cover, albums[2].cover]
  }, {
    id: 2,
    title: 'Electronic Essentials',
    creator: 'Sarah Chen',
    albumCount: 8,
    covers: [albums[3].cover]
  }];
  if (!query) {
    return <div className="text-center py-12">
        <p className="text-gray-500">Start typing to search...</p>
      </div>;
  }
  if (type === 'albums') {
    return <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}>
        {albums.map(album => <Link key={album.id} to={`/album/${album.id}`}>
            {viewMode === 'grid' ? <AlbumCard album={album} /> : <AlbumListItem album={album} />}
          </Link>)}
      </div>;
  }
  if (type === 'artists') {
    return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artists.map(artist => <ArtistCard key={artist.id} artist={artist} />)}
      </div>;
  }
  if (type === 'users') {
    return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {users.map(user => <UserCard key={user.id} user={user} />)}
      </div>;
  }
  if (type === 'collections') {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {collections.map(collection => <div key={collection.id} className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-16">
                <div className="relative w-16 h-16">
                  {collection.covers.length > 0 ? <>
                      <img src={collection.covers[0]} alt="" className="absolute top-0 left-0 w-12 h-12 rounded-md object-cover border border-white" />
                      {collection.covers.length > 1 && <img src={collection.covers[1]} alt="" className="absolute bottom-0 right-0 w-12 h-12 rounded-md object-cover border border-white" />}
                    </> : <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center">
                      <ListMusicIcon size={24} className="text-gray-400" />
                    </div>}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-1">{collection.title}</h3>
                <p className="text-sm opacity-70">
                  {collection.albumCount} albums
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                    {collection.creator}
                  </span>
                </div>
              </div>
            </div>
          </div>)}
      </div>;
  }
  return null;
}