import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, currentUser } = useAuth();
  const location = useLocation();
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    // Log authentication state for debugging
    console.log("PrivateRoute initialized:", {
      path: location.pathname,
      isAuthenticated,
      isLoading: loading,
      userId: currentUser?.id,
      username: currentUser?.username,
      email: currentUser?.email,
      timestamp: new Date().toISOString(),
    });
  }, [
    location.pathname,
    isAuthenticated,
    loading,
    currentUser?.id,
    currentUser?.username,
    currentUser?.email,
  ]);

  // Log changes to auth state
  useEffect(() => {
    console.log("PrivateRoute auth state changed:", {
      path: location.pathname,
      isAuthenticated,
      isLoading: loading,
      userId: currentUser?.id,
      username: currentUser?.username,
      timestamp: new Date().toISOString(),
    });
  }, [isAuthenticated, loading, currentUser, location.pathname]);

  // Log navigation changes
  useEffect(() => {
    console.log("PrivateRoute path changed:", {
      newPath: location.pathname,
      isAuthenticated,
      username: currentUser?.username,
      timestamp: new Date().toISOString(),
    });
  }, [location.pathname, isAuthenticated, currentUser?.username]);

  // Create a ref to track if we should show loading state
  const loadingTimeoutRef = React.useRef<boolean>(false);

  // Handle visibility change events
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      console.log(
        `Page visibility changed: ${isVisible ? "visible" : "hidden"}`
      );
      setPageVisible(isVisible);

      // Reset the loading timeout when page becomes visible again
      if (isVisible) {
        loadingTimeoutRef.current = true;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Use effect to set a timeout on loading state
  useEffect(() => {
    // If we're loading, start a timeout to hide the loader after a delay
    if (loading && !loadingTimeoutRef.current) {
      const timer = setTimeout(() => {
        console.log(
          "PrivateRoute loading timed out after 1 second, proceeding with render"
        );
        loadingTimeoutRef.current = true;
      }, 1000); // Reduced to 1 second for better UX

      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Display loading state, but only if we haven't timed out yet and the page is visible
  // If page is not visible, we'll skip showing the loader to prevent getting stuck
  if (loading && !loadingTimeoutRef.current && pageVisible) {
    console.log(
      "PrivateRoute showing loading state for path:",
      location.pathname
    );

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading account information...</p>
        </div>
      </div>
    );
  }

  // If we're loading but timed out, or if auth is available, proceed with rendering

  // Check if this is a new user coming from registration going to onboarding
  // In that case, we want to be more permissive
  const comingFromRegistration =
    sessionStorage.getItem("registration_complete") === "true";
  const needsOnboarding = sessionStorage.getItem("needs_onboarding") === "true";
  const isOnboardingPath = location.pathname === "/onboarding";

  // Add more detailed debug logging
  const authDebugInfo = {
    comingFromRegistration,
    needsOnboarding,
    isOnboardingPath,
    sessionStorageKeys: Object.keys(sessionStorage),
    location: location.pathname + location.search,
    isAuthenticated,
    isLoading: loading,
    hasCurrentUser: !!currentUser,
    userId: currentUser?.id,
    timestamp: new Date().toISOString(),
  };

  console.log("PrivateRoute detailed debug info:", authDebugInfo);

  // Add a check to see if auth state is still loading before redirecting
  // This prevents redirection when auth is in progress
  if (!isAuthenticated && !loading) {
    // Special case for onboarding flow - if they have registration flags set, allow them through
    if (isOnboardingPath && (comingFromRegistration || needsOnboarding)) {
      console.log(
        "PrivateRoute: Allowing access to onboarding for new user",
        authDebugInfo
      );
      // Let them proceed to onboarding
    } else {
      console.log(
        "PrivateRoute redirecting unauthenticated user from:",
        location.pathname,
        "to /login",
        authDebugInfo
      );
      return <Navigate to="/login" replace />;
    }
  }

  // If we get here, either:
  // 1. User is authenticated
  // 2. Auth is still loading but we've timed out the loader UI (we'll still allow content to render)
  console.log(
    "PrivateRoute rendering protected content for:",
    location.pathname,
    { isAuthenticated, isLoading: loading }
  );
  return <>{children}</>;
}
