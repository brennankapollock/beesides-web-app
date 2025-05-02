import { useAuth } from "../hooks/useAuth";
import { Link } from "./Link";
import { useEffect } from "react";

export function AuthButton() {
  const { currentUser, isAuthenticated, loading } = useAuth();
  
  // Add debugging logs to trace auth state in UI
  useEffect(() => {
    console.log("AuthButton component - auth state:", {
      isAuthenticated,
      isLoading: loading,
      hasCurrentUser: !!currentUser,
      userId: currentUser?.id,
      username: currentUser?.username,
      email: currentUser?.email,
      timestamp: new Date().toISOString()
    });
  }, [isAuthenticated, currentUser, loading]);
  
  console.log("AuthButton rendering with:", { 
    isAuthenticated, 
    hasCurrentUser: !!currentUser,
    username: currentUser?.username,
    isLoading: loading
  });
  
  // Don't render anything while loading to prevent flash of wrong UI
  if (loading) {
    console.log("AuthButton: Auth state is loading, not rendering buttons yet");
    return null;
  }
  
  if (isAuthenticated && currentUser) {
    console.log("AuthButton: User is authenticated, not showing sign in buttons");
    return null; // Don't show anything when user is signed in
  }
  
  console.log("AuthButton: User is NOT authenticated, showing sign in buttons");
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
