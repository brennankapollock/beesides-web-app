import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Hook to handle redirection after authentication.
 * This is particularly useful for the registration flow where we want
 * to redirect to onboarding after successful registration and authentication.
 */
export function useRedirectAfterAuth() {
  const { isAuthenticated, loading, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("useRedirectAfterAuth hook initialized", {
      path: location.pathname,
      isAuthenticated,
      isLoading: loading,
      userId: currentUser?.id,
      timestamp: new Date().toISOString()
    });
  }, []);

  useEffect(() => {
    const shouldRedirectToOnboarding = () => {
      // Check URL params or session storage for flags indicating fresh registration
      const urlParams = new URLSearchParams(window.location.search);
      const isRedirectedFromSignup = urlParams.has('from') && urlParams.get('from') === 'signup';
      const needsOnboarding = sessionStorage.getItem('needs_onboarding') === 'true';
      
      console.log("Checking redirect conditions:", {
        currentPath: location.pathname,
        isRedirectedFromSignup,
        urlParams: Object.fromEntries(urlParams.entries()),
        needsOnboardingFlag: needsOnboarding,
        shouldRedirect: isRedirectedFromSignup || needsOnboarding
      });
      
      return isRedirectedFromSignup || needsOnboarding;
    };
    
    // Only proceed if authentication is complete (not loading) and user is authenticated
    if (!loading && isAuthenticated) {
      console.log("Auth state ready for redirect check:", {
        isAuthenticated,
        userId: currentUser?.id,
        username: currentUser?.username,
        currentPath: location.pathname
      });
      
      // Check if we need to redirect to onboarding
      if (shouldRedirectToOnboarding()) {
        console.log('Redirect condition met, redirecting authenticated user to onboarding flow');
        sessionStorage.removeItem('needs_onboarding');
        navigate('/onboarding', { replace: true });
        console.log('Navigation to onboarding triggered');
      } else {
        console.log('No redirect needed, user can stay on current page');
      }
    }
  }, [isAuthenticated, loading, navigate, location.pathname, currentUser]);
}
