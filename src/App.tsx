import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Home } from "./pages/Home";
import { Discover } from "./pages/Discover";
import { Album } from "./pages/Album";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Search } from "./pages/Search";
import { OnboardingFlow } from "./pages/OnboardingFlow";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import { supabase } from "./lib/supabase";
import { logger } from "./utils/logger";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

// Component that sets up real-time subscriptions
function RealtimeSubscriptions() {
  useEffect(() => {
    // Set up subscriptions to tables
    const albumSubscription = supabase
      .channel("album_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "albums",
        },
        () => {
          logger.debug("Albums table changed, invalidating queries", {
            category: "realtime",
            data: { table: "albums" },
          });
          queryClient.invalidateQueries({ queryKey: ["albums"] });
        }
      )
      .subscribe();

    const ratingsSubscription = supabase
      .channel("rating_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "album_ratings",
        },
        () => {
          logger.debug("Ratings table changed, invalidating queries", {
            category: "realtime",
            data: { table: "album_ratings" },
          });
          queryClient.invalidateQueries({ queryKey: ["ratings"] });
        }
      )
      .subscribe();

    const reviewsSubscription = supabase
      .channel("review_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reviews",
        },
        () => {
          logger.debug("Reviews table changed, invalidating queries", {
            category: "realtime",
            data: { table: "reviews" },
          });
          queryClient.invalidateQueries({ queryKey: ["reviews"] });
        }
      )
      .subscribe();

    const collectionsSubscription = supabase
      .channel("collection_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collections",
        },
        () => {
          logger.debug("Collections table changed, invalidating queries", {
            category: "realtime",
            data: { table: "collections" },
          });
          queryClient.invalidateQueries({ queryKey: ["collections"] });
        }
      )
      .subscribe();

    const followersSubscription = supabase
      .channel("follower_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "followers",
        },
        () => {
          logger.debug("Followers table changed, invalidating queries", {
            category: "realtime",
            data: { table: "followers" },
          });
          queryClient.invalidateQueries({ queryKey: ["following"] });
          queryClient.invalidateQueries({ queryKey: ["stats"] });
        }
      )
      .subscribe();

    // Clean up subscriptions on unmount
    return () => {
      supabase.removeChannel(albumSubscription);
      supabase.removeChannel(ratingsSubscription);
      supabase.removeChannel(reviewsSubscription);
      supabase.removeChannel(collectionsSubscription);
      supabase.removeChannel(followersSubscription);
    };
  }, []);

  return null;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealtimeSubscriptions />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/discover"
              element={
                <PrivateRoute>
                  <Discover />
                </PrivateRoute>
              }
            />
            <Route path="/search" element={<Search />} />
            <Route path="/album/:id" element={<Album />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/onboarding"
              element={
                <PrivateRoute>
                  <OnboardingFlow />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/:username"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
