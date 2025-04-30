import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { AlbumCard } from '../components/AlbumCard';
import { AlbumListItem } from '../components/AlbumListItem';
import { SettingsIcon, EditIcon, ListMusicIcon, StarIcon, BarChart2Icon, UserIcon } from 'lucide-react';
import { Link } from '../components/Link';
import { ViewToggle } from '../components/ViewToggle';
import { useViewMode } from '../hooks/useViewMode';
export function Profile() {
  const [activeTab, setActiveTab] = useState('collection');
  const [viewMode, setViewMode] = useViewMode('grid');
  const user = {
    name: 'John Doe',
    username: 'musiclover42',
    avatar: null,
    joinDate: 'Member since 2022',
    bio: 'Music enthusiast with a passion for discovering new sounds and artists. Collector of vinyl and digital music across various genres.',
    stats: {
      ratings: 478,
      reviews: 62,
      lists: 14,
      followers: 125,
      following: 87
    }
  };
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
  const lists = [{
    id: 1,
    title: 'Best Albums of 2023',
    itemCount: 12
  }, {
    id: 2,
    title: 'Desert Island Collection',
    itemCount: 8
  }, {
    id: 3,
    title: 'Workout Playlist',
    itemCount: 15
  }];
  return <Layout>
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-20 md:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-gray-50 rounded-2xl p-6 md:p-8 mb-8">
          <div className="md:flex gap-8 items-center">
            <div className="mb-6 md:mb-0 flex justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-black flex items-center justify-center text-white text-3xl font-bold">
                {user.name.charAt(0)}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">
                    {user.name}
                  </h1>
                  <p className="text-sm opacity-70">
                    @{user.username} · {user.joinDate}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex justify-center md:justify-end gap-2">
                  <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors">
                    Follow
                  </button>
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <EditIcon size={20} />
                  </button>
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <SettingsIcon size={20} />
                  </button>
                </div>
              </div>
              <p className="mb-6">{user.bio}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="text-center">
                  <p className="text-xl font-bold">{user.stats.ratings}</p>
                  <p className="text-sm opacity-70">Ratings</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{user.stats.reviews}</p>
                  <p className="text-sm opacity-70">Reviews</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{user.stats.lists}</p>
                  <p className="text-sm opacity-70">Lists</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{user.stats.followers}</p>
                  <p className="text-sm opacity-70">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{user.stats.following}</p>
                  <p className="text-sm opacity-70">Following</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex overflow-x-auto border-b">
            <button onClick={() => setActiveTab('collection')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'collection' ? 'border-b-2 border-black' : 'opacity-70'}`}>
              <span className="flex items-center gap-2">
                <ListMusicIcon size={18} />
                Collection
              </span>
            </button>
            <button onClick={() => setActiveTab('ratings')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'ratings' ? 'border-b-2 border-black' : 'opacity-70'}`}>
              <span className="flex items-center gap-2">
                <StarIcon size={18} />
                Ratings
              </span>
            </button>
            <button onClick={() => setActiveTab('lists')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'lists' ? 'border-b-2 border-black' : 'opacity-70'}`}>
              <span className="flex items-center gap-2">
                <BarChart2Icon size={18} />
                Lists
              </span>
            </button>
            <button onClick={() => setActiveTab('followers')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'followers' ? 'border-b-2 border-black' : 'opacity-70'}`}>
              <span className="flex items-center gap-2">
                <UserIcon size={18} />
                Followers
              </span>
            </button>
          </div>
        </div>
        {/* Tab Content */}
        {activeTab === 'collection' && <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Collection (42)</h2>
              <div className="flex gap-2">
                <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
                <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Filter
                </button>
                <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Sort
                </button>
              </div>
            </div>
            <div className={`transition-all duration-300 ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 gap-6' : 'space-y-4'}`}>
              {albums.map(album => <Link key={album.id} to={`/album/${album.id}`}>
                  {viewMode === 'grid' ? <AlbumCard album={album} /> : <AlbumListItem album={album} />}
                </Link>)}
            </div>
          </div>}
        {activeTab === 'lists' && <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Lists ({lists.length})</h2>
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors">
                Create List
              </button>
            </div>
            <div className="space-y-4">
              {lists.map(list => <div key={list.id} className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                  <h3 className="font-bold mb-1">{list.title}</h3>
                  <p className="text-sm opacity-70">{list.itemCount} items</p>
                </div>)}
            </div>
          </div>}
      </div>
    </Layout>;
}