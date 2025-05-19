import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useContext } from "react";
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
import AuthCallback from "./pages/AuthCallback";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthContext } from "./contexts/AuthContextTypes";
import { PrivateRoute } from "./components/PrivateRoute";
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
    // Placeholder for Appwrite real-time subscriptions
    logger.info(
      "RealtimeSubscriptions: Placeholder for Appwrite real-time integration.",
      { category: "realtime" }
    );

    // Clean up subscriptions on component unmount
    return () => {
      logger.info("RealtimeSubscriptions: Cleanup placeholder.", {
        category: "realtime",
      });
    };
  }, []);

  return null; // This component doesn't render anything
}

// Component that initializes and maintains auth state
function AuthStateInitializer() {
  const { checkAuthStatus, loading } = useContext(AuthContext);

  useEffect(() => {
    // Check auth status on initial load
    const initializeAuth = async () => {
      logger.info("Initializing auth state on app startup", { category: "auth" });
      try {
        await checkAuthStatus();
        logger.info("Auth state initialized successfully", { category: "auth" });
      } catch (error) {
        logger.error("Failed to initialize auth state", {
          category: "auth",
          data: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    };

    initializeAuth();

    // Set up event listener for when the app regains focus
    const handleFocus = () => {
      logger.info("Window focused, refreshing auth state", { category: "auth" });
      checkAuthStatus().catch(error => {
        logger.error("Failed to refresh auth state on focus", {
          category: "auth",
          data: { error: error instanceof Error ? error.message : String(error) },
        });
      });
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkAuthStatus]);

  return null; // This component doesn't render anything
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <RealtimeSubscriptions />
          <AuthStateInitializer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/search" element={<Search />} />
            <Route path="/album/:id" element={<Album />} />

            {/* Private Routes */}
            <Route
              path="/discover"
              element={
                <PrivateRoute>
                  <Discover />
                </PrivateRoute>
              }
            />
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
