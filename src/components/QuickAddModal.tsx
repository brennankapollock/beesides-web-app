import React, { useState } from 'react';
import { StarIcon, XIcon, SearchIcon, CheckIcon } from 'lucide-react';
interface Album {
  id: number;
  title: string;
  artist: string;
  cover: string;
  rating?: number;
}
interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: {
    albumId: number;
    rating: number;
    title: string;
    content: string;
  }) => void;
}
export function QuickAddModal({
  isOpen,
  onClose,
  onSubmit
}: QuickAddModalProps) {
  const [step, setStep] = useState<'search' | 'review'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Mock albums for search results
  const allAlbums: Album[] = [{
    id: 1,
    title: 'The Suffering',
    artist: 'Emily Bryan',
    cover: 'https://images.unsplash.com/photo-1599719500956-d158a3abd461?q=80&w=2070&auto=format&fit=crop'
  }, {
    id: 2,
    title: 'Daily Chaos',
    artist: 'Emily Bryan',
    cover: 'https://images.unsplash.com/photo-1603384164656-2b0e573ffa0b?q=80&w=1974&auto=format&fit=crop'
  }, {
    id: 3,
    title: 'Simple',
    artist: 'Ryan Parker',
    cover: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?q=80&w=2070&auto=format&fit=crop'
  }];
  const filteredAlbums = searchQuery ? allAlbums.filter(album => album.title.toLowerCase().includes(searchQuery.toLowerCase()) || album.artist.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const displayRating = hoverRating !== null ? hoverRating : rating;
  const ratingDescriptions = ['Select a rating', 'Terrible', 'Poor', 'Bad', 'Subpar', 'Average', 'Good', 'Very good', 'Great', 'Excellent', 'Masterpiece'];
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum || rating === 0) return;
    setIsSubmitting(true);
    onSubmit({
      albumId: selectedAlbum.id,
      rating,
      title,
      content
    });
    // Reset form
    setStep('search');
    setSearchQuery('');
    setSelectedAlbum(null);
    setRating(0);
    setTitle('');
    setContent('');
    setIsSubmitting(false);
    onClose();
  };
  const handleClose = () => {
    // Reset everything when closing
    setStep('search');
    setSearchQuery('');
    setSelectedAlbum(null);
    setRating(0);
    setTitle('');
    setContent('');
    onClose();
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-bold">
              {step === 'search' ? 'Find Album' : 'Write Review'}
            </h2>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
              <XIcon size={20} />
            </button>
          </div>
        </div>
        <div className="p-6">
          {step === 'search' ? <div>
              <div className="relative mb-4">
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="Search for an album..." autoFocus />
                <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="space-y-2">
                {filteredAlbums.map(album => <div key={album.id} onClick={() => {
              setSelectedAlbum(album);
              setStep('review');
            }} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <img src={album.cover} alt={album.title} className="w-12 h-12 rounded object-cover" />
                    <div>
                      <p className="font-medium">{album.title}</p>
                      <p className="text-sm opacity-70">{album.artist}</p>
                    </div>
                  </div>)}
                {searchQuery && filteredAlbums.length === 0 && <div className="text-center py-8 text-gray-500">
                    No albums found
                  </div>}
              </div>
            </div> : <form onSubmit={handleSubmit}>
              {selectedAlbum && <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <img src={selectedAlbum.cover} alt={selectedAlbum.title} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <h3 className="font-bold">{selectedAlbum.title}</h3>
                    <p className="text-sm opacity-70">{selectedAlbum.artist}</p>
                  </div>
                </div>}
              <div className="mb-6">
                <label className="block font-medium mb-2">Your Rating</label>
                <div className="flex flex-col">
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => <button key={value} type="button" onClick={() => setRating(value)} onMouseEnter={() => setHoverRating(value)} onMouseLeave={() => setHoverRating(null)} className="p-1">
                        <StarIcon size={24} className={value <= displayRating ? 'fill-black text-black' : 'text-gray-300'} />
                      </button>)}
                  </div>
                  <p className="text-sm font-medium">
                    {displayRating ? ratingDescriptions[displayRating] : ratingDescriptions[0]}
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="review-title" className="block font-medium mb-2">
                  Review Title
                </label>
                <input id="review-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="Summarize your thoughts" maxLength={100} />
              </div>
              <div className="mb-6">
                <label htmlFor="review-content" className="block font-medium mb-2">
                  Your Review
                </label>
                <textarea id="review-content" value={content} onChange={e => setContent(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[150px]" placeholder="What did you think about this album? What stood out to you?" />
                <p className="text-xs opacity-70 mt-1">Minimum 50 characters</p>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setStep('search')} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                  Back
                </button>
                <button type="submit" disabled={isSubmitting || rating === 0 || content.length < 50} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Publish Review
                </button>
              </div>
            </form>}
        </div>
      </div>
    </div>;
}