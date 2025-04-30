import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { SearchFilters } from '../components/SearchFilters';
import { SearchResults } from '../components/SearchResults';
import { SearchIcon, XIcon, SlidersHorizontalIcon, ArrowUpDownIcon } from 'lucide-react';
import { ViewToggle } from '../components/ViewToggle';
import { useViewMode } from '../hooks/useViewMode';
import { useSearchParams } from 'react-router-dom';
type ResultType = 'albums' | 'artists' | 'users' | 'collections';
export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<ResultType>('albums');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useViewMode('grid');
  // Update URL when search query changes
  useEffect(() => {
    if (query) {
      searchParams.set('q', query);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  }, [query]);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would trigger an API call
    console.log('Searching for:', query);
  };
  const clearSearch = () => {
    setQuery('');
  };
  return <Layout>
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-20 md:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-mono font-bold mb-6">
            Search
          </h1>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for albums, artists, users, or collections..." className="w-full pl-12 pr-12 py-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-lg" />
              <SearchIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {query && <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors">
                  <XIcon size={20} className="text-gray-500" />
                </button>}
            </div>
          </form>
        </div>
        {/* Results Section */}
        <div className="lg:grid lg:grid-cols-[280px,1fr] gap-8">
          {/* Filters - Mobile Toggle */}
          <div className="lg:hidden flex gap-2 mb-4">
            <button onClick={() => setIsFiltersOpen(!isFiltersOpen)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <SlidersHorizontalIcon size={18} />
              <span>Filters</span>
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <ArrowUpDownIcon size={18} />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent border-none focus:outline-none text-sm">
                <option value="relevance">Most Relevant</option>
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
          </div>
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block">
            <SearchFilters />
          </div>
          {/* Results */}
          <div>
            {/* Tabs */}
            <div className="mb-6 border-b">
              <div className="flex overflow-x-auto">
                <button onClick={() => setActiveTab('albums')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'albums' ? 'border-b-2 border-black' : 'opacity-70'}`}>
                  Albums
                </button>
                <button onClick={() => setActiveTab('artists')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'artists' ? 'border-b-2 border-black' : 'opacity-70'}`}>
                  Artists
                </button>
                <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-black' : 'opacity-70'}`}>
                  Users
                </button>
                <button onClick={() => setActiveTab('collections')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'collections' ? 'border-b-2 border-black' : 'opacity-70'}`}>
                  Collections
                </button>
              </div>
            </div>
            {/* Desktop Sort & View Controls */}
            <div className="hidden lg:flex justify-between items-center mb-6">
              <p className="text-sm opacity-70">
                Showing {activeTab === 'albums' ? '127' : '0'} results
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ArrowUpDownIcon size={18} className="text-gray-500" />
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border-none focus:outline-none text-sm">
                    <option value="relevance">Most Relevant</option>
                    <option value="recent">Most Recent</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
                <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
              </div>
            </div>
            {/* Results Grid */}
            <SearchResults query={query} type={activeTab} viewMode={viewMode} sortBy={sortBy} />
          </div>
        </div>
        {/* Mobile Filters Sheet */}
        {isFiltersOpen && <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
            <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold">Filters</h2>
                  <button onClick={() => setIsFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <XIcon size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <SearchFilters />
              </div>
            </div>
          </div>}
      </div>
    </Layout>;
}