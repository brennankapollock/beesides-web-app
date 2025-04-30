import React, { useState } from 'react';
import { XIcon, SearchIcon, PlusIcon, CheckIcon } from 'lucide-react';
interface Album {
  id: number;
  title: string;
  artist: string;
  cover: string;
  rating?: number;
  genre?: string;
}
interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (collection: {
    name: string;
    description: string;
    isPrivate: boolean;
    albums: Album[];
  }) => void;
}
export function CreateCollectionModal({
  isOpen,
  onClose,
  onSubmit
}: CreateCollectionModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbums, setSelectedAlbums] = useState<Album[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Mock albums for search results
  const allAlbums: Album[] = [{
    id: 1,
    title: 'The Suffering',
    artist: 'Emily Bryan',
    cover: 'https://images.unsplash.com/photo-1599719500956-d158a3abd461?q=80&w=2070&auto=format&fit=crop',
    rating: 9.2
  }, {
    id: 2,
    title: 'Daily Chaos',
    artist: 'Emily Bryan',
    cover: 'https://images.unsplash.com/photo-1603384164656-2b0e573ffa0b?q=80&w=1974&auto=format&fit=crop',
    rating: 8.7
  }, {
    id: 3,
    title: 'Simple',
    artist: 'Ryan Parker',
    cover: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?q=80&w=2070&auto=format&fit=crop',
    rating: 7.9
  }, {
    id: 4,
    title: 'Midnight Tales',
    artist: 'Sarah Johnson',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=2069&auto=format&fit=crop',
    rating: 9.5
  }];
  // Filter albums based on search query
  const filteredAlbums = searchQuery ? allAlbums.filter(album => album.title.toLowerCase().includes(searchQuery.toLowerCase()) || album.artist.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const isAlbumSelected = (albumId: number) => selectedAlbums.some(album => album.id === albumId);
  const toggleAlbumSelection = (album: Album) => {
    if (isAlbumSelected(album.id)) {
      setSelectedAlbums(selectedAlbums.filter(a => a.id !== album.id));
    } else {
      setSelectedAlbums([...selectedAlbums, album]);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedAlbums.length === 0) return;
    setIsSubmitting(true);
    // Submit the collection
    onSubmit({
      name,
      description,
      isPrivate,
      albums: selectedAlbums
    });
    // Reset the form
    setName('');
    setDescription('');
    setIsPrivate(false);
    setSelectedAlbums([]);
    setSearchQuery('');
    setIsSubmitting(false);
    onClose();
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-bold">Create Collection</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
              <XIcon size={20} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Collection Name */}
            <div className="mb-4">
              <label htmlFor="collection-name" className="block font-medium mb-2">
                Collection Name
              </label>
              <input id="collection-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="e.g., Jazz Essentials, Workout Mix, 90s Nostalgia" maxLength={50} required />
            </div>
            {/* Collection Description */}
            <div className="mb-4">
              <label htmlFor="collection-description" className="block font-medium mb-2">
                Description (Optional)
              </label>
              <textarea id="collection-description" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="Tell others what this collection is about..." rows={3} />
            </div>
            {/* Privacy Setting */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="rounded text-black focus:ring-black" />
                <span>Make this collection private</span>
              </label>
              <p className="text-xs opacity-70 mt-1 ml-6">
                Private collections are only visible to you
              </p>
            </div>
            {/* Album Search */}
            <div className="mb-6">
              <label htmlFor="album-search" className="block font-medium mb-2">
                Add Albums to Your Collection
              </label>
              <div className="relative mb-2">
                <input id="album-search" type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="Search albums by title or artist..." />
                <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {/* Search Results */}
              {searchQuery && <div className="border rounded-lg overflow-hidden mb-4 max-h-60 overflow-y-auto">
                  {filteredAlbums.length > 0 ? filteredAlbums.map(album => <div key={album.id} className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 ${isAlbumSelected(album.id) ? 'bg-gray-50' : ''}`} onClick={() => toggleAlbumSelection(album)}>
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          <img src={album.cover} alt={album.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{album.title}</p>
                          <p className="text-xs opacity-70 truncate">
                            {album.artist}
                          </p>
                        </div>
                        <div className="w-6 h-6 rounded-full border flex items-center justify-center">
                          {isAlbumSelected(album.id) && <CheckIcon size={14} className="text-black" />}
                        </div>
                      </div>) : <div className="p-4 text-center text-gray-500">
                      No albums found
                    </div>}
                </div>}
              {/* Selected Albums */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">
                    Selected Albums ({selectedAlbums.length})
                  </p>
                </div>
                {selectedAlbums.length > 0 ? <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedAlbums.map(album => <div key={album.id} className="relative group">
                        <img src={album.cover} alt={album.title} className="w-full aspect-square object-cover rounded-md" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                          <button type="button" onClick={() => toggleAlbumSelection(album)} className="p-2 bg-white rounded-full" aria-label="Remove album">
                            <XIcon size={16} />
                          </button>
                        </div>
                        <p className="text-xs mt-1 font-medium truncate">
                          {album.title}
                        </p>
                        <p className="text-xs opacity-70 truncate">
                          {album.artist}
                        </p>
                      </div>)}
                  </div> : <div className="border border-dashed rounded-lg p-8 text-center">
                    <p className="text-gray-500 mb-2">No albums selected yet</p>
                    <p className="text-xs text-gray-400">
                      Search and select albums to add to your collection
                    </p>
                  </div>}
              </div>
            </div>
            {/* Submit Button */}
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting || !name || selectedAlbums.length === 0} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Create Collection
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>;
}