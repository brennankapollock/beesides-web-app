import { useEffect } from "react";
import { Layout } from "../components/Layout";
import { StatsBanner } from "../components/StatsBanner";
import { TestimonialCarousel } from "../components/TestimonialCarousel";
import { AlbumCard } from "../components/AlbumCard";
import { GenreTag } from "../components/GenreTag";
import {
  SearchIcon,
  ArrowRightIcon,
  CheckIcon,
  XIcon,
  PlayIcon,
  StarIcon,
  ListMusicIcon,
  UserIcon,
} from "lucide-react";
import { Link } from "../components/Link";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function Home() {
  const { isAuthenticated, loading, isSessionInitialized } = useAuth();
  const navigate = useNavigate();

  // Check if user needs to be redirected to onboarding
  useEffect(() => {
    // Only process redirects after session is fully initialized
    // This prevents flickering during authentication state determination
    if (isSessionInitialized && !loading && isAuthenticated) {
      const needsOnboarding =
        sessionStorage.getItem("needs_onboarding") === "true";
      if (needsOnboarding) {
        sessionStorage.removeItem("needs_onboarding");
        navigate("/onboarding", { replace: true });
      }
    }
  }, [isAuthenticated, loading, isSessionInitialized, navigate]);
  const albums = [
    {
      id: 1,
      title: "The Suffering",
      artist: "Emily Bryan",
      cover:
        "https://images.unsplash.com/photo-1599719500956-d158a3abd461?q=80&w=2070&auto=format&fit=crop",
      rating: 9.2,
      genre: "Classic",
    },
    {
      id: 2,
      title: "Daily Chaos",
      artist: "Emily Bryan",
      cover:
        "https://images.unsplash.com/photo-1603384164656-2b0e573ffa0b?q=80&w=1974&auto=format&fit=crop",
      rating: 8.7,
      genre: "90s",
    },
    {
      id: 3,
      title: "Simple",
      artist: "Ryan Parker",
      cover:
        "https://images.unsplash.com/photo-1594623930572-300a3011d9ae?q=80&w=2070&auto=format&fit=crop",
      rating: 7.9,
      genre: "New",
    },
    {
      id: 4,
      title: "Midnight Tales",
      artist: "Sarah Johnson",
      cover:
        "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=2069&auto=format&fit=crop",
      rating: 9.5,
      genre: "Electronic",
    },
  ];
  const testimonials = [
    {
      id: 1,
      text: "Thanks to Beesides, I discovered an entire genre I never knew I'd love. Their community recommendations led me to my new favorite artist!",
      author: "David Chen",
      role: "Music Producer",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop",
    },
    {
      id: 2,
      text: "I was stuck in a music rut until I joined Beesides. Now I've rated over 200 albums and discovered dozens of artists I would have never found on streaming platforms.",
      author: "Maria Garcia",
      role: "Playlist Curator",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
    },
    {
      id: 3,
      text: "The human curation aspect of Beesides is what sets it apart. I've found so many hidden gems through user-created lists that algorithms would never suggest.",
      author: "Alex Kim",
      role: "Music Enthusiast",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974&auto=format&fit=crop",
    },
  ];
  const comparisonFeatures = [
    {
      name: "Human-curated recommendations",
      beesides: true,
      streaming: false,
    },
    {
      name: "Detailed rating system",
      beesides: true,
      streaming: false,
    },
    {
      name: "Community-driven discovery",
      beesides: true,
      streaming: false,
    },
    {
      name: "Personal music journal",
      beesides: true,
      streaming: false,
    },
    {
      name: "Album-focused experience",
      beesides: true,
      streaming: false,
    },
    {
      name: "No algorithm bias",
      beesides: true,
      streaming: false,
    },
  ];
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-20 md:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-mono font-bold mb-6">
            Discover music through{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              people
            </span>
            , not algorithms
          </h1>
          <p className="text-xl opacity-70 max-w-3xl mx-auto mb-8">
            Beesides helps you find your next favorite albums through a
            community of music enthusiasts, not repetitive recommendation
            engines.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-bold"
            >
              Join the Community
            </Link>
            <Link
              to="/explore"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-bold flex items-center gap-2"
            >
              <PlayIcon size={18} />
              Explore Albums
            </Link>
          </div>
        </div>

        {/* Featured Albums */}
        <div className="mb-24">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-mono font-bold">Featured Albums</h2>
            <Link
              to="/explore"
              className="flex items-center gap-1 text-sm font-bold"
            >
              View All
              <ArrowRightIcon size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </div>

        {/* Stats Banner */}
        <StatsBanner className="mb-24" />

        {/* Browse by Genre */}
        <div className="mb-24">
          <h2 className="text-3xl font-mono font-bold mb-8">Browse by Genre</h2>
          <div className="flex flex-wrap gap-3">
            <GenreTag genre="Rock" count={1243} />
            <GenreTag genre="Hip Hop" count={982} />
            <GenreTag genre="Electronic" count={876} />
            <GenreTag genre="Jazz" count={654} />
            <GenreTag genre="Classical" count={432} />
            <GenreTag genre="R&B" count={321} />
            <GenreTag genre="Country" count={298} />
            <GenreTag genre="Metal" count={276} />
            <GenreTag genre="Pop" count={1432} />
            <GenreTag genre="Indie" count={987} />
            <GenreTag genre="Folk" count={543} />
            <GenreTag genre="Soul" count={321} />
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-24">
          <h2 className="text-3xl font-mono font-bold text-center mb-12">
            How Beesides Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Rate & Review</h3>
              <p className="opacity-70">
                Rate albums on a 10-point scale and write detailed reviews to
                share your thoughts with the community.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <ListMusicIcon size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Create Collections</h3>
              <p className="opacity-70">
                Organize albums into personal collections and lists that you can
                share with friends or keep private.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Follow Curators</h3>
              <p className="opacity-70">
                Connect with users who share your taste and discover new music
                through their recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-24">
          <h2 className="text-3xl font-mono font-bold text-center mb-3">
            Break the Algorithm Loop
          </h2>
          <p className="text-center opacity-70 max-w-2xl mx-auto mb-12">
            Streaming services keep you listening to the same types of music.
            Beesides helps you discover truly new sounds.
          </p>
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 p-4 border-b border-gray-200 bg-gray-100">
              <div className="col-span-1 font-bold">Feature</div>
              <div className="col-span-1 font-bold text-center">Beesides</div>
              <div className="col-span-1 font-bold text-center">
                Streaming Services
              </div>
            </div>
            {comparisonFeatures.map((feature, index) => (
              <div
                key={index}
                className="grid grid-cols-3 p-4 border-b border-gray-200"
              >
                <div className="col-span-1">{feature.name}</div>
                <div className="col-span-1 flex justify-center">
                  {feature.beesides ? (
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckIcon size={16} className="text-green-600" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <XIcon size={16} className="text-red-600" />
                    </div>
                  )}
                </div>
                <div className="col-span-1 flex justify-center">
                  {feature.streaming ? (
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckIcon size={16} className="text-green-600" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <XIcon size={16} className="text-red-600" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mb-24 bg-gray-900 text-white rounded-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Start your music journey today
                </h2>
                <p className="opacity-80 mb-6">
                  Join thousands of music enthusiasts who are discovering their
                  next favorite albums through Beesides.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white rounded-full">
                      <CheckIcon size={16} className="text-black" />
                    </div>
                    <p className="text-sm">Rate and review your favorite albums</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white rounded-full">
                      <CheckIcon size={16} className="text-black" />
                    </div>
                    <p className="text-sm">
                      Create and share personalized collections
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white rounded-full">
                      <CheckIcon size={16} className="text-black" />
                    </div>
                    <p className="text-sm">
                      Connect with your favorite streaming service
                    </p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <form className="bg-white p-6 rounded-xl">
                  <h3 className="text-black font-bold text-xl mb-4">
                    Create your account
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        placeholder="Your name"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        placeholder="you@example.com"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                      />
                    </div>
                    <button className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-bold">
                      Get Started
                    </button>
                    <p className="text-xs text-center text-gray-500">
                      By signing up, you agree to our Terms of Service and
                      Privacy Policy
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* Testimonials */}
        <div className="mb-24">
          <h2 className="text-3xl font-mono font-bold text-center mb-3">
            What our users say
          </h2>
          <p className="text-center opacity-70 max-w-2xl mx-auto mb-12">
            Discover how Beesides has transformed the way people find and enjoy
            music
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold">{testimonial.author}</p>
                    <p className="text-sm opacity-70">{testimonial.role}</p>
                  </div>
                </div>
                <p className="italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
        {/* Email Capture (Simplified) */}
        <div className="text-center max-w-xl mx-auto py-12">
          <h2 className="text-3xl font-bold mb-4">
            Ready to discover your next favorite album?
          </h2>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-bold text-center"
          >
            Join Beesides Now
          </Link>
        </div>
      </div>
    </Layout>
  );
}
