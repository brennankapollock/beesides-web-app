import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { AlbumCard } from "../components/AlbumCard";
import { AlbumListItem } from "../components/AlbumListItem";
import { ViewToggle } from "../components/ViewToggle";
import { useViewMode } from "../hooks/useViewMode";
import { CreateCollectionModal } from "../components/CreateCollectionModal";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { useParams, Link } from "react-router-dom";
// Icons import
import {
  Edit as EditIcon,
  Settings as SettingsIcon,
  ListMusic as ListMusicIcon,
  Star as StarIcon,
  BarChart2 as BarChart2Icon,
  User as UserIcon,
  Plus as PlusIcon,
} from "lucide-react";

// User interface to properly type user data
interface User {
  id?: string;
  name?: string;
  username?: string;
  avatar?: string | null;
  created_at?: string;
  joinDate?: string;
  bio?: string;
  stats?: {
    ratings: number;
    reviews: number;
    lists: number;
    followers: number;
    following: number;
  };
}

// Define Album type to match the one used in AlbumCard and other components
interface Album {
  id: number;
  title: string;
  artist: string;
  cover: string;
  rating?: number;
  genre?: string;
  releaseDate?: string;
}

export function Profile() {
  const [activeTab, setActiveTab] = useState("collection");
  const [viewMode, setViewMode] = useViewMode("grid");
  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] =
    useState(false);
  const [isLoading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<User | null>(null);
  const { currentUser, loading: authLoading } = useAuth();
  const { username } = useParams<{ username: string }>();

  // Create a ref to track if max loading time has been reached
  const loadingTimeoutRef = React.useRef<boolean>(false);

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading && !loadingTimeoutRef.current) {
      const timer = setTimeout(() => {
        console.log(
          "Profile loading timed out after 2 seconds, forcing render"
        );
        loadingTimeoutRef.current = true;
        setLoading(false);

        // If we have current user, use it even if profile data hasn't loaded
        if (username === "me" && currentUser) {
          console.log("Using current user data after timeout");
          setProfileData({
            ...currentUser,
            joinDate: `Member since ${new Date(
              currentUser.created_at || Date.now()
            ).getFullYear()}`,
          });
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, username, currentUser]);

  // If profileData is null but currentUser is available and not loading, fallback to currentUser (for '/profile/me')
  useEffect(() => {
    if (!isLoading && !profileData && username === "me" && currentUser) {
      setProfileData({
        ...currentUser,
        joinDate: `Member since ${new Date(
          currentUser.created_at || Date.now()
        ).getFullYear()}`,
      });
    }
  }, [isLoading, profileData, username, currentUser]);

  console.log("Profile page - render:", {
    routeUsername: username,
    currentUser: currentUser?.username,
    authLoading,
    pageLoading: isLoading,
    hasTimedOut: loadingTimeoutRef.current,
  });

  // Handle special paths and redirect if needed
  useEffect(() => {
    // Check if we need to handle the 'me' path
    if (username === "me") {
      console.log("Special 'me' path detected in Profile:", {
        authLoading,
        hasCurrentUser: !!currentUser,
        username: currentUser?.username,
        isAuthenticated: !!currentUser,
      });

      // If we have the user data, use it immediately
      if (currentUser) {
        console.log("Setting profile data for 'me' path from currentUser");
        setProfileData({
          ...currentUser,
          joinDate: `Member since ${new Date(
            currentUser.created_at || Date.now()
          ).getFullYear()}`,
        });
        setLoading(false);
      }
      // If still loading auth data, just wait
      else if (authLoading) {
        console.log("Still loading auth data for 'me' path");
      }
      // If done loading but no user, something is wrong
      else if (!authLoading && !currentUser) {
        setProfileData(null); // Explicitly clear profileData
        setLoading(false);
        console.log("No authenticated user found for 'me' path");
      }
    } else if (username === "guest" && !authLoading && !currentUser) {
      console.log("Invalid 'guest' username in URL and user not authenticated");
    }

    // Add a timeout to prevent infinite loading state
    const timer = setTimeout(() => {
      if (isLoading && username === "me") {
        console.log(
          "Profile loading timed out after 2 seconds, setting default values"
        );
        setLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [username, currentUser, authLoading, isLoading]);

  // User profile to display - either the current user or the profile being viewed
  const user: User = profileData || {
    name: "User",
    username: username || "user",
    avatar: null,
    joinDate: "Loading...",
    bio: "Loading profile information...",
    stats: {
      ratings: 0,
      reviews: 0,
      lists: 0,
      followers: 0,
      following: 0,
    },
  };

  // Fetch profile data
  useEffect(() => {
    // Skip fetch during auth loading for the "me" path
    if (username === "me" && authLoading) {
      console.log(
        "Auth is still loading for 'me' path, delaying profile fetch"
      );
      return;
    }

    // Skip fetching if we already have profile data from the "me" path
    if (username === "me" && !authLoading && currentUser && profileData) {
      console.log("Already have profile data for 'me' path, skipping fetch");
      return;
    }

    // Skip fetch for "me" path if no user (should redirect to login)
    if (username === "me" && !authLoading && !currentUser) {
      console.log(
        "No authenticated user for 'me' path, skipping fetch (should redirect)"
      );
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);

        console.log("Fetching profile data for:", {
          urlUsername: username,
          currentUsername: currentUser?.username,
          isMePath: username === "me",
          authLoading,
        });

        // If we're looking at the current user's profile, use the currentUser data
        if (
          currentUser &&
          (username === "me" || !username || username === currentUser.username)
        ) {
          console.log(
            "Using current user data for profile:",
            currentUser.username
          );
          setProfileData({
            ...currentUser,
            joinDate: `Member since ${new Date(
              currentUser.created_at || Date.now()
            ).getFullYear()}`,
          });
        } else if (username && username !== "me" && username !== "guest") {
          // Otherwise, fetch the profile based on the username in the URL
          console.log("Fetching profile data from database for:", username);
          const { data, error } = await supabase
            .from("user_stats")
            .select("*")
            .eq("username", username)
            .single();

          if (error) {
            console.error("Error fetching profile data:", error);
            throw error;
          }

          if (data) {
            console.log("Profile data fetched successfully:", data.username);
            setProfileData({
              name: data.name,
              username: data.username,
              avatar: data.avatar_url,
              joinDate: `Member since ${new Date(
                data.created_at || Date.now()
              ).getFullYear()}`,
              bio: data.bio || "No bio available",
              stats: {
                ratings: data.ratings_count || 0,
                reviews: data.reviews_count || 0,
                lists: data.collections_count || 0,
                followers: data.followers_count || 0,
                following: data.following_count || 0,
              },
            });
          } else {
            console.log("No profile data found for username:", username);
          }
        } else {
          console.log("Invalid username or path, skipping fetch:", username);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username, currentUser, authLoading, profileData]);
  // State for user's albums and collections
  const [albums, setAlbums] = useState<Album[]>([]);
  const [collections, setCollections] = useState<
    Array<{
      id: string | number;
      title: string;
      itemCount: number;
      coverImages: string[];
    }>
  >([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(true);

  // Fetch user's rated albums
  useEffect(() => {
    const fetchUserRatedAlbums = async () => {
      if (!user.username) return;

      try {
        setLoadingAlbums(true);

        // Get albums this user has rated
        const { data, error } = await supabase
          .from("ratings")
          .select(
            `
            album_id,
            rating,
            albums!inner(
              id,
              title,
              cover_url,
              release_date,
              artists!inner(name)
            )
          `
          )
          .eq("user_id", profileData?.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;

        if (data) {
          // Transform the data to match our component requirements
          const formattedAlbums = data.map((item) => {
            // Define explicit types for the data structure
            type AlbumData = {
              id?: string;
              title?: string;
              cover_url?: string;
              release_date?: string;
              artists?: Array<{ name?: string }> | { name?: string };
            };

            // Handle albums as either an object or array
            const albumData: AlbumData = Array.isArray(item.albums)
              ? item.albums[0] || {}
              : item.albums || {};

            // Extract artist name with proper type handling
            let artistName = "";
            if (albumData.artists) {
              if (
                Array.isArray(albumData.artists) &&
                albumData.artists.length > 0
              ) {
                artistName = albumData.artists[0]?.name || "";
              } else if (
                typeof albumData.artists === "object" &&
                "name" in albumData.artists
              ) {
                artistName = albumData.artists.name || "";
              }
            }

            return {
              id: item.album_id,
              title: albumData.title || "",
              artist: artistName,
              cover: albumData.cover_url || "",
              rating: item.rating || 0,
              releaseDate: albumData.release_date
                ? new Date(albumData.release_date).getFullYear().toString()
                : "",
            };
          });

          setAlbums(formattedAlbums);
        }
      } catch (error) {
        console.error("Error fetching user albums:", error);
      } finally {
        setLoadingAlbums(false);
      }
    };

    fetchUserRatedAlbums();
  }, [user.username, profileData?.id]);

  // Fetch user's collections
  useEffect(() => {
    const fetchUserCollections = async () => {
      if (!user.username) return;

      try {
        setLoadingCollections(true);

        // Get collections from our collection_details view
        const { data, error } = await supabase
          .from("collection_details")
          .select("*")
          .eq("user_username", user.username)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          // Transform the data to match our component requirements
          const formattedCollections = data.map((collection) => ({
            id: collection.id,
            title: collection.name,
            itemCount: collection.album_count,
            coverImages: collection.cover_images?.slice(0, 3) || [],
          }));

          setCollections(formattedCollections);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoadingCollections(false);
      }
    };

    fetchUserCollections();
  }, [user.username]);
  const handleCreateCollection = async (collection: {
    name: string;
    description: string;
    isPrivate: boolean;
    albums: Album[];
  }) => {
    try {
      if (!currentUser?.id) {
        alert("You must be logged in to create a collection");
        return;
      }

      // Create the collection in Supabase
      const { data: collectionData, error: collectionError } = await supabase
        .from("collections")
        .insert({
          user_id: currentUser.id,
          name: collection.name,
          description: collection.description,
          is_private: collection.isPrivate,
        })
        .select();

      if (collectionError) throw collectionError;

      // Add albums to the collection
      if (
        collection.albums.length > 0 &&
        collectionData &&
        collectionData[0]?.id
      ) {
        const collectionAlbums = collection.albums.map((album) => ({
          collection_id: collectionData[0].id,
          album_id: String(album.id), // Ensure album_id is a string
        }));

        const { error: albumsError } = await supabase
          .from("collection_albums")
          .insert(collectionAlbums);

        if (albumsError) throw albumsError;
      }

      // Add the new collection to our local state
      const newCollection = {
        id: collectionData && collectionData[0] ? collectionData[0].id : "",
        title: collection.name,
        itemCount: collection.albums.length,
        coverImages: collection.albums.slice(0, 3).map((album) => album.cover),
      };

      setCollections((prev) => [newCollection, ...prev]);

      // Show success message
      alert("Collection created successfully!");
    } catch (error) {
      console.error("Error creating collection:", error);
      alert("Failed to create collection. Please try again.");
    }
  };
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-20 md:px-6 lg:px-8">
        {/* Profile Header */}
        {isLoading ? (
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8 mb-8 flex justify-center items-center min-h-[200px]">
            <p>Loading profile information...</p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8 mb-8">
            <div className="md:flex gap-8 items-center">
              {" "}
              <div className="mb-6 md:mb-0 flex justify-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-black flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name ? user.name.charAt(0) : "?"}
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">
                      {user?.name || "User"}
                    </h1>
                    <p className="text-sm opacity-70">
                      @{user?.username || "username"} · {user?.joinDate || ""}
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
                <p className="mb-6">{user?.bio || "No bio available"}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                  <div className="text-center">
                    <p className="text-xl font-bold">
                      {user?.stats?.ratings || 0}
                    </p>
                    <p className="text-sm opacity-70">Ratings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">
                      {user?.stats?.reviews || 0}
                    </p>
                    <p className="text-sm opacity-70">Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">
                      {user?.stats?.lists || 0}
                    </p>
                    <p className="text-sm opacity-70">Lists</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">
                      {user?.stats?.followers || 0}
                    </p>
                    <p className="text-sm opacity-70">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">
                      {user?.stats?.following || 0}
                    </p>
                    <p className="text-sm opacity-70">Following</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex overflow-x-auto border-b">
            <button
              onClick={() => setActiveTab("collection")}
              className={`px-4 py-2 font-medium whitespace-nowrap ${
                activeTab === "collection"
                  ? "border-b-2 border-black"
                  : "opacity-70"
              }`}
            >
              <span className="flex items-center gap-2">
                <ListMusicIcon size={18} />
                Collection
              </span>
            </button>
            <button
              onClick={() => setActiveTab("ratings")}
              className={`px-4 py-2 font-medium whitespace-nowrap ${
                activeTab === "ratings"
                  ? "border-b-2 border-black"
                  : "opacity-70"
              }`}
            >
              <span className="flex items-center gap-2">
                <StarIcon size={18} />
                Ratings
              </span>
            </button>
            <button
              onClick={() => setActiveTab("lists")}
              className={`px-4 py-2 font-medium whitespace-nowrap ${
                activeTab === "lists" ? "border-b-2 border-black" : "opacity-70"
              }`}
            >
              <span className="flex items-center gap-2">
                <BarChart2Icon size={18} />
                Lists
              </span>
            </button>
            <button
              onClick={() => setActiveTab("followers")}
              className={`px-4 py-2 font-medium whitespace-nowrap ${
                activeTab === "followers"
                  ? "border-b-2 border-black"
                  : "opacity-70"
              }`}
            >
              <span className="flex items-center gap-2">
                <UserIcon size={18} />
                Followers
              </span>
            </button>
          </div>
        </div>
        {/* Tab Content */}
        {activeTab === "collection" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Collection ({albums.length})
              </h2>
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

            {loadingAlbums ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading albums...</p>
              </div>
            ) : albums.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <StarIcon size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">No rated albums yet</p>
                {currentUser && currentUser.username === user.username && (
                  <p className="text-sm text-gray-400 mt-1">
                    Start rating albums to build your collection
                  </p>
                )}
              </div>
            ) : (
              <div
                className={`transition-all duration-300 ${
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-4 gap-6"
                    : "space-y-4"
                }`}
              >
                {albums.map((album) => (
                  <Link key={album.id} to={`/album/${album.id}`}>
                    {viewMode === "grid" ? (
                      <AlbumCard album={album} />
                    ) : (
                      <AlbumListItem album={album} />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "lists" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Collections ({collections.length})
              </h2>
              {currentUser && currentUser.username === user.username && (
                <button
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
                  onClick={() => setIsCreateCollectionModalOpen(true)}
                >
                  <PlusIcon size={18} />
                  <span>Create Collection</span>
                </button>
              )}
            </div>

            {loadingCollections ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading collections...</p>
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <ListMusicIcon
                  size={32}
                  className="mx-auto mb-2 text-gray-400"
                />
                <p className="text-gray-500">No collections yet</p>
                {currentUser && currentUser.username === user.username && (
                  <p className="text-sm text-gray-400 mt-1">
                    Create your first collection to organize your favorite
                    albums
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-16">
                        <div className="relative w-16 h-16">
                          {collection.coverImages &&
                          collection.coverImages.length > 0 ? (
                            <>
                              <img
                                src={collection.coverImages[0]}
                                alt=""
                                className="absolute top-0 left-0 w-12 h-12 rounded-md object-cover border border-white"
                              />
                              {collection.coverImages.length > 1 && (
                                <img
                                  src={collection.coverImages[1]}
                                  alt=""
                                  className="absolute bottom-0 right-0 w-12 h-12 rounded-md object-cover border border-white"
                                />
                              )}
                            </>
                          ) : (
                            <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center">
                              <ListMusicIcon
                                size={24}
                                className="text-gray-400"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{collection.title}</h3>
                        <p className="text-sm opacity-70">
                          {collection.itemCount} albums
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                            {user.username}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={isCreateCollectionModalOpen}
        onClose={() => setIsCreateCollectionModalOpen(false)}
        onSubmit={handleCreateCollection}
      />
    </Layout>
  );
}
