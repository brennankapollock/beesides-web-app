import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { AlbumCard } from '../components/AlbumCard';
import { GenreTag } from '../components/GenreTag';
import { SearchIcon, FilterIcon, TrendingUpIcon, ClockIcon } from 'lucide-react';
import { Link } from '../components/Link';
export function Discover() {
  const [activeFilter, setActiveFilter] = useState('trending');
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const genres = [{
    id: 1,
    name: 'Classic'
  }, {
    id: 2,
    name: '90s'
  }, {
    id: 3,
    name: 'New'
  }, {
    id: 4,
    name: 'Instrumental'
  }, {
    id: 5,
    name: 'Jazz'
  }, {
    id: 6,
    name: 'Electronic'
  }, {
    id: 7,
    name: 'Hip-Hop'
  }, {
    id: 8,
    name: 'Rock'
  }, {
    id: 9,
    name: 'Pop'
  }];
  const albums = [{
    id: 1,
    title: 'The Suffering',
    artist: 'Emily Bryan',
    cover: 'https://images.unsplash.com/photo-1599719500956-d158a3abd461?q=80&w=2070&auto=format&fit=crop',
    rating: 9.2,
    genre: 'Classic'
  }, {
    id: 2,
    title: 'Daily Chaos',
    artist: 'Emily Bryan',
    cover: 'https://images.unsplash.com/photo-1603384164656-2b0e573ffa0b?q=80&w=1974&auto=format&fit=crop',
    rating: 8.7,
    genre: '90s'
  }, {
    id: 3,
    title: 'Simple',
    artist: 'Ryan Parker',
    cover: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?q=80&w=2070&auto=format&fit=crop',
    rating: 7.9,
    genre: 'New'
  }, {
    id: 4,
    title: 'Midnight Tales',
    artist: 'Sarah Johnson',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=2069&auto=format&fit=crop',
    rating: 9.5,
    genre: 'Electronic'
  }, {
    id: 5,
    title: 'Urban Rhythm',
    artist: 'Marcus Lee',
    cover: 'https://images.unsplash.com/photo-1598387846148-47e82ee120cc?q=80&w=1976&auto=format&fit=crop',
    rating: 8.3,
    genre: 'Hip-Hop'
  }, {
    id: 6,
    title: 'Echoes',
    artist: 'Stella Kim',
    cover: 'https://images.unsplash.com/photo-1598518619776-eae3f8a34eac?q=80&w=1974&auto=format&fit=crop',
    rating: 8.9,
    genre: 'Rock'
  }, {
    id: 7,
    title: 'Neon Dreams',
    artist: 'Alex Wong',
    cover: 'https://images.unsplash.com/photo-1526327760257-75f515c8eacd?q=80&w=1974&auto=format&fit=crop',
    rating: 7.5,
    genre: 'Electronic'
  }, {
    id: 8,
    title: 'Acoustic Journey',
    artist: 'Laura Martinez',
    cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop',
    rating: 9.1,
    genre: 'Instrumental'
  }];
  const currentlyPlaying = {
    title: 'The Suffering',
    artist: 'Emily Bryan',
    cover: 'https://images.unsplash.com/photo-1599719500956-d158a3abd461?q=80&w=2070&auto=format&fit=crop',
    currentTime: '1:54',
    duration: '3:35'
  };
  return <Layout>
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-20 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-mono font-bold">Discover</h1>
          <div className="flex gap-3">
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <FilterIcon size={20} />
            </button>
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <SearchIcon size={20} />
            </button>
          </div>
        </div>
        {/* Filters */}
        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            <button onClick={() => setActiveFilter('trending')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeFilter === 'trending' ? 'bg-black text-white' : 'bg-gray-100'}`}>
              <TrendingUpIcon size={18} />
              <span>Trending</span>
            </button>
            <button onClick={() => setActiveFilter('recent')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeFilter === 'recent' ? 'bg-black text-white' : 'bg-gray-100'}`}>
              <ClockIcon size={18} />
              <span>Recent</span>
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            {genres.map(genre => <GenreTag key={genre.id} name={genre.name} active={activeGenre === genre.name} onClick={() => setActiveGenre(activeGenre === genre.name ? null : genre.name)} />)}
          </div>
        </div>
        {/* Albums Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map(album => <Link key={album.id} to={`/album/${album.id}`}>
              <AlbumCard album={album} />
            </Link>)}
        </div>
      </div>
    </Layout>;
}