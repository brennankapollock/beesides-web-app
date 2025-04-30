import React from 'react';
import { Layout } from '../components/Layout';
import { StatsBanner } from '../components/StatsBanner';
import { ActivityFeed } from '../components/ActivityFeed';
import { TestimonialCarousel } from '../components/TestimonialCarousel';
import { EmailCapture } from '../components/EmailCapture';
import { AlbumCard } from '../components/AlbumCard';
import { GenreTag } from '../components/GenreTag';
import { SearchIcon, ArrowRightIcon } from 'lucide-react';
import { Link } from '../components/Link';
export function Home() {
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
  }];
  return <Layout>
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-20 md:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-mono font-bold mb-4">
            Beesides
          </h1>
          <p className="text-lg md:text-xl opacity-80 mb-8">
            The next-generation platform for music enthusiasts to catalog, rate,
            and discover their next favorite album
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/discover" className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-bold text-center">
              Join Now
            </Link>
            <button className="px-8 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Learn More
            </button>
          </div>
        </div>
        {/* Stats Banner */}
        <StatsBanner />
        {/* Featured Testimonial */}
        <div className="mb-16">
          <TestimonialCarousel />
        </div>
        {/* Community Activity */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-mono font-bold">
              Community Activity
            </h2>
            <Link to="/discover" className="flex items-center gap-1 text-sm hover:underline">
              See more <ArrowRightIcon size={16} />
            </Link>
          </div>
          <div className="md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActivityFeed />
          </div>
        </div>
        {/* Trending Albums */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-mono font-bold">
              Trending Albums
            </h2>
            <Link to="/discover" className="flex items-center gap-1 text-sm hover:underline">
              View all <ArrowRightIcon size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {albums.map(album => <Link key={album.id} to={`/album/${album.id}`}>
                <AlbumCard album={album} />
              </Link>)}
          </div>
        </div>
        {/* Genres */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-mono font-bold">
              Explore Genres
            </h2>
            <Link to="/discover" className="flex items-center text-sm font-mono hover:bg-gray-100 px-4 py-2 rounded-full transition-colors">
              <SearchIcon size={16} className="mr-2" />
              Search
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 pb-4">
            {genres.map(genre => <GenreTag key={genre.id} name={genre.name} />)}
          </div>
        </div>
        {/* Email Capture */}
        <EmailCapture />
      </div>
    </Layout>;
}