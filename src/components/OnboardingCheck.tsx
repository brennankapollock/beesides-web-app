import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface OnboardingCheckProps {
  children: React.ReactNode;
}

/**
 * Component that checks if a user has completed onboarding
 * If not, redirects them to the onboarding flow
 */
export function OnboardingCheck({ children }: OnboardingCheckProps) {
  const { currentUser, isAuthenticated } = useAuth();

  // If the user is not authenticated, simply render the children
  // No need to force them through onboarding if they're not logged in
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Check if the user has completed onboarding
  // This is a simple check that looks for activity in their stats
  // In a real implementation, you might have a specific flag on the user profile
  const hasCompletedOnboarding =
    currentUser?.stats &&
    (currentUser.stats.ratings > 0 ||
      currentUser.stats.reviews > 0 ||
      currentUser.stats.collections > 0 ||
      currentUser.stats.following > 0);

  // If they haven't completed onboarding, redirect them
  if (isAuthenticated && !hasCompletedOnboarding) {
    console.log("User needs to complete onboarding, redirecting...");
    return <Navigate to="/onboarding" replace />;
  }

  // Otherwise, render the children
  return <>{children}</>;
}
