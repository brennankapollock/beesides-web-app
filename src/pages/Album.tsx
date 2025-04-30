import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { StarIcon, HeartIcon, ListPlusIcon, ShareIcon, MessageSquareIcon } from 'lucide-react';
import { Link } from '../components/Link';
import { ReviewFormModal } from '../components/ReviewFormModal';
export function Album() {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const album = {
    id: 1,
    title: 'The Suffering',
    artist: 'Emily Bryan',
    cover: 'https://images.unsplash.com/photo-1599719500956-d158a3abd461?q=80&w=2070&auto=format&fit=crop',
    releaseDate: 'May 15, 2023',
    genres: ['Classic', 'Alternative'],
    averageRating: 9.2,
    ratingCount: 1245,
    reviewCount: 87,
    label: 'Indie Records',
    description: 'A groundbreaking album that explores themes of resilience and transformation through a unique blend of electronic and orchestral elements.',
    tracks: [{
      id: 1,
      title: 'Introduction',
      duration: '1:24'
    }, {
      id: 2,
      title: 'Lost in Time',
      duration: '4:32'
    }, {
      id: 3,
      title: 'Echoes of Yesterday',
      duration: '3:56'
    }, {
      id: 4,
      title: 'The Journey Within',
      duration: '5:21'
    }, {
      id: 5,
      title: 'Midnight Reflections',
      duration: '4:18'
    }, {
      id: 6,
      title: 'Breaking Through',
      duration: '3:45'
    }, {
      id: 7,
      title: 'Eternal Light',
      duration: '6:12'
    }, {
      id: 8,
      title: 'Final Resolution',
      duration: '4:53'
    }]
  };
  const handleReviewSubmit = (review: {
    rating: number;
    title: string;
    content: string;
  }) => {
    // In a real app, this would send the review to an API
    console.log('Review submitted:', review);
    // For demo purposes, we'll just update the UI
    setUserRating(review.rating);
    // Show a success message or update the UI
    alert('Your review has been published!');
  };
  const renderRatingStars = () => {
    return <div className="flex">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => <button key={rating} onClick={() => setUserRating(rating)} className="p-1">
            <StarIcon size={20} className={userRating !== null && rating <= userRating ? 'fill-black' : 'stroke-gray-400'} />
          </button>)}
      </div>;
  };
  return <Layout>
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-20 md:px-6 lg:px-8">
        {/* Album Header */}
        <div className="md:flex gap-8 mb-12">
          <div className="md:w-1/3 mb-6 md:mb-0">
            <img src={album.cover} alt={album.title} className="w-full aspect-square object-cover rounded-xl shadow-lg" />
          </div>
          <div className="md:w-2/3">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {album.title}
              </h1>
              <p className="text-xl mb-4">{album.artist}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {album.genres.map(genre => <span key={genre} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {genre}
                  </span>)}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <StarIcon size={20} className="fill-black mr-1" />
                  <span className="font-bold">{album.averageRating}</span>
                  <span className="text-sm opacity-70 ml-1">
                    ({album.ratingCount.toLocaleString()})
                  </span>
                </div>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-sm">{album.releaseDate}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-sm">{album.label}</span>
              </div>
              <p className="opacity-70 mb-6">{album.description}</p>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors" onClick={() => setIsReviewModalOpen(true)}>
                  <StarIcon size={18} />
                  <span>Rate & Review</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <HeartIcon size={18} />
                  <span>Like</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <ListPlusIcon size={18} />
                  <span>Add to Collection</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <ShareIcon size={18} />
                  <span>Share</span>
                </button>
              </div>
            </div>
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">Your Rating</h2>
                {renderRatingStars()}
              </div>
            </div>
          </div>
        </div>
        {/* Tracks */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Tracks</h2>
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            {album.tracks.map((track, index) => <div key={track.id} className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer ${index !== album.tracks.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <span className="w-8 text-center opacity-70">{track.id}</span>
                <span className="flex-1 font-medium">{track.title}</span>
                <span className="opacity-70">{track.duration}</span>
              </div>)}
          </div>
        </div>
        {/* Reviews */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Reviews</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors" onClick={() => setIsReviewModalOpen(true)}>
              <MessageSquareIcon size={18} />
              <span>Write Review</span>
            </button>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Link to="/profile/johndoe" className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="font-bold">JD</span>
                </Link>
                <div>
                  <Link to="/profile/johndoe" className="font-bold">
                    John Doe
                  </Link>
                  <div className="flex items-center">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => <StarIcon key={star} size={14} className={star <= 4 ? 'fill-black' : 'stroke-gray-400'} />)}
                    </div>
                    <span className="text-sm opacity-70 ml-2">
                      March 12, 2024
                    </span>
                  </div>
                </div>
              </div>
              <p>
                This album completely changed my perspective on what modern
                classic music can be. The production quality is outstanding and
                Emily Bryan's artistic vision shines through every track.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Review Modal */}
      <ReviewFormModal albumId={album.id} albumTitle={album.title} albumArtist={album.artist} albumCover={album.cover} isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} onSubmit={handleReviewSubmit} />
    </Layout>;
}