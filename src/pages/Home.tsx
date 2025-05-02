import React, { useEffect } from "react";
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
  const genres = [
    {
      id: 1,
      name: "Classic",
    },
    {
      id: 2,
      name: "90s",
    },
    {
      id: 3,
      name: "New",
    },
    {
      id: 4,
      name: "Instrumental",
    },
    {
      id: 5,
      name: "Jazz",
    },
    {
      id: 6,
      name: "Electronic",
    },
  ];
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
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h1 className="text-4xl md:text-6xl font-mono font-bold mb-6">
            Beesides
          </h1>
          <p className="text-lg md:text-xl opacity-80 mb-8">
            Discover your next favorite album through people, not algorithms
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-bold text-center"
            >
              Join Now
            </Link>
            <Link
              to="/discover"
              className="px-8 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Explore Music
            </Link>
          </div>
        </div>
        {/* Problem-Solution Sections */}
        <div className="space-y-32 mb-32">
          {/* Problem 1 */}
          <div className="md:flex items-center gap-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-mono font-bold mb-6">
                Tired of the same recommendations?
              </h2>
              <p className="text-lg mb-6 opacity-80">
                Streaming platforms keep suggesting the same artists based on
                your listening history. Beesides breaks the algorithm loop with
                community-driven recommendations from people who share your
                unique taste in music.
              </p>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-black rounded-full">
                  <CheckIcon size={18} className="text-white" />
                </div>
                <p>Discover music from real people, not algorithms</p>
              </div>
            </div>
            <div className="md:w-1/2 bg-gray-50 p-8 rounded-2xl">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop"
                  alt="People discussing music"
                  className="rounded-lg w-full"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg max-w-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop"
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Sarah recommended:</p>
                      <p className="text-sm">
                        "If you liked 'The Suffering', you'll love 'Midnight
                        Tales'"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Problem 2 */}
          <div className="md:flex items-center gap-12 flex-row-reverse">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-mono font-bold mb-6">
                Want to remember albums you've enjoyed?
              </h2>
              <p className="text-lg mb-6 opacity-80">
                We've all had that moment: "What was that album I loved last
                year?" Beesides creates your personal music journal where you
                can rate, review, and catalog every album you listen to,
                building your musical identity over time.
              </p>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-black rounded-full">
                  <CheckIcon size={18} className="text-white" />
                </div>
                <p>
                  Build your musical identity with detailed ratings and reviews
                </p>
              </div>
            </div>
            <div className="md:w-1/2 bg-gray-50 p-8 rounded-2xl">
              <div className="relative">
                <div className="bg-white rounded-xl shadow-lg p-5">
                  <div className="flex gap-4 mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1599719500956-d158a3abd461?q=80&w=2070&auto=format&fit=crop"
                      alt="Album cover"
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-bold">The Suffering</h3>
                      <p className="text-sm opacity-70">Emily Bryan</p>
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((star) => (
                            <StarIcon
                              key={star}
                              size={14}
                              className="fill-black"
                            />
                          ))}
                          <StarIcon size={14} className="stroke-black" />
                        </div>
                        <span className="ml-2 text-sm font-bold">9.0</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-sm">
                      "This album completely changed my perspective on modern
                      classic music. The production quality is outstanding."
                    </p>
                    <p className="text-xs opacity-70 mt-2">
                      Reviewed on March 15, 2024
                    </p>
                  </div>
                </div>
                <div className="absolute -top-4 -left-4 bg-white p-2 rounded-lg shadow-md">
                  <ListMusicIcon size={24} />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white p-2 rounded-lg shadow-md">
                  <StarIcon size={24} />
                </div>
              </div>
            </div>
          </div>
          {/* Problem 3 */}
          <div className="md:flex items-center gap-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-mono font-bold mb-6">
                Looking for music beyond algorithms?
              </h2>
              <p className="text-lg mb-6 opacity-80">
                Streaming platforms optimize for engagement, not discovery.
                Beesides creates connections between music enthusiasts who share
                their genuine passion and knowledge, helping you discover hidden
                gems that would otherwise remain buried.
              </p>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-black rounded-full">
                  <CheckIcon size={18} className="text-white" />
                </div>
                <p>Connect with music enthusiasts who share your taste</p>
              </div>
            </div>
            <div className="md:w-1/2 bg-gray-50 p-8 rounded-2xl">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <UserIcon size={20} />
                  <p className="font-bold">
                    Follow curators with similar taste
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-3 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-gray-200 mx-auto mb-2 overflow-hidden">
                        <img
                          src={`https://images.unsplash.com/photo-${
                            1500648767791 + i
                          }-00173eea3a1e?q=80&w=1974&auto=format&fit=crop`}
                          alt={`Curator ${i}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-center text-sm font-bold">Alex K.</p>
                      <p className="text-center text-xs opacity-70">
                        Jazz, Electronic
                      </p>
                    </div>
                  ))}
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm font-bold mb-1">
                    Alex's "Hidden Gems" Collection
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {[1, 2, 3, 4].map((i) => (
                      <img
                        key={i}
                        src={albums[i - 1].cover}
                        alt={`Album ${i}`}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                    ))}
                    <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">+12</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* App Mockup Section */}
        <div className="mb-32">
          <h2 className="text-3xl font-mono font-bold text-center mb-12">
            See Beesides in action
          </h2>
          <div className="relative bg-gray-50 rounded-2xl p-8 md:p-12 overflow-hidden">
            <div className="md:w-3/4 mx-auto">
              <img
                src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974&auto=format&fit=crop"
                alt="App interface"
                className="rounded-xl shadow-2xl"
              />
              {/* Feature Callouts */}
              <div className="absolute top-1/4 -left-4 md:left-12 bg-white p-3 rounded-lg shadow-lg max-w-[200px] transform -translate-y-1/2">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-black rounded-full flex-shrink-0">
                    <StarIcon size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Detailed Rating System</p>
                    <p className="text-xs opacity-70">
                      Rate albums on a 10-point scale with nuanced reviews
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute top-2/3 right-4 md:right-12 bg-white p-3 rounded-lg shadow-lg max-w-[200px]">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-black rounded-full flex-shrink-0">
                    <ListMusicIcon size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Curated Collections</p>
                    <p className="text-xs opacity-70">
                      Discover themed collections from music enthusiasts
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-8 md:bottom-12 left-4 md:left-1/4 bg-white p-3 rounded-lg shadow-lg max-w-[200px]">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-black rounded-full flex-shrink-0">
                    <PlayIcon size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Seamless Listening</p>
                    <p className="text-xs opacity-70">
                      Connect with your favorite streaming services
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Metrics Section */}
        <div className="mb-32">
          <h2 className="text-3xl font-mono font-bold text-center mb-3">
            Join thousands who have discovered
          </h2>
          <p className="text-center opacity-70 max-w-2xl mx-auto mb-12">
            Beesides is helping music enthusiasts around the world break out of
            their bubbles and discover new sounds every day.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <p className="text-4xl font-bold mb-2">14,000+</p>
              <p className="opacity-70">New artists discovered</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <p className="text-4xl font-bold mb-2">250,000+</p>
              <p className="opacity-70">Albums rated</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <p className="text-4xl font-bold mb-2">50,000+</p>
              <p className="opacity-70">Active users</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <p className="text-4xl font-bold mb-2">8,500+</p>
              <p className="opacity-70">Curated collections</p>
            </div>
          </div>
        </div>
        {/* Comparison Table */}
        <div className="mb-32">
          <h2 className="text-3xl font-mono font-bold text-center mb-12">
            How Beesides Compares
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 border-b-2"></th>
                  <th className="p-4 border-b-2 text-center">
                    <span className="font-mono font-bold text-xl">
                      Beesides
                    </span>
                  </th>
                  <th className="p-4 border-b-2 text-center">
                    <span className="opacity-70">Traditional Streaming</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-50" : ""}
                  >
                    <td className="p-4 font-medium">{feature.name}</td>
                    <td className="p-4 text-center">
                      {feature.beesides ? (
                        <CheckIcon
                          size={24}
                          className="mx-auto text-green-600"
                        />
                      ) : (
                        <XIcon size={24} className="mx-auto text-red-500" />
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {feature.streaming ? (
                        <CheckIcon
                          size={24}
                          className="mx-auto text-green-600"
                        />
                      ) : (
                        <XIcon size={24} className="mx-auto text-red-500" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Sign Up Form */}
        <div className="mb-32">
          <div className="bg-black text-white rounded-2xl p-8 md:p-12">
            <div className="md:flex items-center gap-8">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-3xl font-mono font-bold mb-4">
                  Start your music discovery journey
                </h2>
                <p className="opacity-80 mb-6">
                  Join thousands of music enthusiasts who are expanding their
                  musical horizons every day. Sign up now and get personalized
                  recommendations based on your taste.
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1 bg-white rounded-full">
                    <CheckIcon size={16} className="text-black" />
                  </div>
                  <p className="text-sm">
                    Free to join, no credit card required
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-white rounded-full">
                    <CheckIcon size={16} className="text-black" />
                  </div>
                  <p className="text-sm">
                    Connect with your favorite streaming service
                  </p>
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
