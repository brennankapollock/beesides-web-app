import React, { useState } from 'react';
import { StarIcon, XIcon } from 'lucide-react';
interface ReviewFormModalProps {
  albumId: number;
  albumTitle: string;
  albumArtist: string;
  albumCover: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: {
    rating: number;
    title: string;
    content: string;
  }) => void;
}
export function ReviewFormModal({
  albumId,
  albumTitle,
  albumArtist,
  albumCover,
  isOpen,
  onClose,
  onSubmit
}: ReviewFormModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!isOpen) return null;
  const displayRating = hoverRating !== null ? hoverRating : rating;
  const ratingDescriptions = ['Select a rating', 'Terrible', 'Poor', 'Bad', 'Subpar', 'Average', 'Good', 'Very good', 'Great', 'Excellent', 'Masterpiece'];
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setIsSubmitting(true);
    // Submit the review
    onSubmit({
      rating,
      title,
      content
    });
    // Reset the form
    setRating(0);
    setTitle('');
    setContent('');
    setIsSubmitting(false);
    onClose();
  };
  return <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-bold">Write a Review</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
              <XIcon size={20} />
            </button>
          </div>
        </div>
        <div className="p-6">
          {/* Album Info */}
          <div className="flex gap-4 mb-6">
            <img src={albumCover} alt={albumTitle} className="w-16 h-16 object-cover rounded-md" />
            <div>
              <h3 className="font-bold">{albumTitle}</h3>
              <p className="text-sm opacity-70">{albumArtist}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Rating */}
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
            {/* Review Title */}
            <div className="mb-4">
              <label htmlFor="review-title" className="block font-medium mb-2">
                Review Title
              </label>
              <input id="review-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="Summarize your thoughts" maxLength={100} />
            </div>
            {/* Review Content */}
            <div className="mb-6">
              <label htmlFor="review-content" className="block font-medium mb-2">
                Your Review
              </label>
              <textarea id="review-content" value={content} onChange={e => setContent(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[150px]" placeholder="What did you think about this album? What stood out to you? How does it compare to the artist's other work?" />
              <p className="text-xs opacity-70 mt-1">Minimum 50 characters</p>
            </div>
            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting || rating === 0 || content.length < 50} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Publish Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>;
}