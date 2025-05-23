import React, { useState, useEffect, useMemo } from "react";
import { MenuIcon, PlusIcon } from "lucide-react";
import { Navigation } from "./Navigation";
import { Link } from "./Link";
import { BottomSheetNavigation } from "./BottomSheetNavigation";
import { AuthButton } from "./AuthButton";
import { useAuth } from "../hooks/useAuth";
import { QuickAddModal } from "./QuickAddModal";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const { currentUser, isAuthenticated, loading } = useAuth();

  // Add logging to debug auth state in Layout
  useEffect(() => {
    console.log("Layout component - auth state:", {
      isAuthenticated,
      isLoading: loading,
      hasCurrentUser: !!currentUser,
      userId: currentUser?.id,
      username: currentUser?.username,
      email: currentUser?.email,
      timestamp: new Date().toISOString(),
    });
  }, [isAuthenticated, currentUser, loading]);

  // Better handling of navigation user state to prevent "guest" profile
  const userForNavigation = useMemo(() => {
    if (loading) {
      console.log("Auth still loading, using temporary placeholder");
      // During loading, return null or a special flag to indicate loading state
      return { username: "", isLoading: true };
    }

    if (currentUser && isAuthenticated) {
      console.log(
        "Using authenticated user for navigation:",
        currentUser.username
      );
      return { ...currentUser, isLoading: false };
    }

    console.log("No authenticated user, using guest mode");
    return { username: "guest", isLoading: false };
  }, [currentUser, isAuthenticated, loading]);

  console.log("Layout rendering with user:", {
    navigationUsername: userForNavigation.username || "not set",
    isAuthenticated,
    isLoading: loading,
    hasCurrentUser: !!currentUser,
  });
  const handleQuickAddSubmit = (review: {
    albumId: number;
    rating: number;
    title: string;
    content: string;
  }) => {
    // In a real app, this would send the review to an API
    console.log("Review submitted:", review);
    // Show a success message
    alert("Your review has been published!");
  };
  return (
    <div className="bg-white text-black min-h-screen font-mono">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4 md:px-6 lg:px-8">
          <Link to="/" className="text-xl font-bold tracking-tight">
            BEESIDES
          </Link>
          <div className="flex gap-4 items-center">
            {!loading && currentUser && (
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="p-2 rounded-lg bg-black text-white hover:bg-gray-900 transition-colors"
                aria-label="Quick add review"
              >
                <PlusIcon size={18} />
              </button>
            )}
            <AuthButton />
            <button
              className="p-2 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <MenuIcon size={18} />
            </button>
          </div>
        </div>
      </header>
      <main className="relative">{children}</main>
      <Navigation
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentUser={userForNavigation}
      />
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={handleQuickAddSubmit}
      />
    </div>
  );
}
