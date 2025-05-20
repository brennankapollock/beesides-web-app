import { useAuth } from "../hooks/useAuth";
import { Link } from "./Link";
import { useEffect, useState } from "react";

export function AuthButton() {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const [stableAuthState, setStableAuthState] = useState<{
    isAuthenticated: boolean;
    isLoading: boolean;
  }>({ isAuthenticated: false, isLoading: true });
  
  // Use effect to stabilize the auth state and prevent flickering
  useEffect(() => {
    // Only update the stable state when the new state differs from the current state
    const newState = { isAuthenticated: isAuthenticated, isLoading: loading };
    if (
      stableAuthState.isAuthenticated !== newState.isAuthenticated ||
      stableAuthState.isLoading !== newState.isLoading
    ) {
      setStableAuthState(newState);
    }
  }, [isAuthenticated, loading]);
  
  // During initial load, show nothing to prevent flickering
  if (stableAuthState.isLoading) {
    return (
      <div className="flex gap-2 opacity-0">
        <div className="px-4 py-2 rounded-lg">Sign in</div>
        <div className="px-4 py-2 rounded-lg">Sign up</div>
      </div>
    );
  }
  
  // Don't show auth buttons when user is authenticated
  if (stableAuthState.isAuthenticated) {
    return null;
  }
  
  // Show auth buttons when user is definitely not authenticated
  return (
    <div className="flex gap-2">
      <Link
        to="/login"
        className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        Sign in
      </Link>
      <Link
        to="/register"
        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
      >
        Sign up
      </Link>
    </div>
  );
}
