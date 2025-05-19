import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logger } from "../utils/logger";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuthStatus, isLoading, currentUser } = useAuth();

  useEffect(() => {
    logger.info("AuthCallback: Component mounted, checking auth status.", {
      category: "auth",
    });
    // The AuthContext's useEffect should handle fetching the user.
    // This component primarily ensures the user is redirected once auth state is known.

    // Immediately try to re-check auth status if not already loading
    if (!isLoading && !currentUser) {
      checkAuthStatus().catch((err) => {
        logger.error("AuthCallback: Error during explicit checkAuthStatus", {
          category: "auth",
          error: err,
        });
        // Navigate to login on failure, as Appwrite might have failed to set the session
        // or the redirect happened with an error.
        navigate("/login");
      });
    }
  }, [checkAuthStatus, isLoading, currentUser, navigate]);

  useEffect(() => {
    if (!isLoading) {
      if (currentUser) {
        logger.info("AuthCallback: User found, redirecting to home.", {
          category: "auth",
          userId: currentUser.id,
        });
        navigate("/"); // Or to a dashboard, or intended URL
      } else {
        // If still no user after checkAuthStatus might have run,
        // and not loading, there might have been an issue.
        // The earlier effect's catch block might also handle this.
        logger.warn(
          "AuthCallback: No user found after loading, redirecting to login.",
          { category: "auth" }
        );
        // navigate('/login'); // Avoid navigating twice if the first useEffect's catch already did.
        // Consider if this is needed or if the first useEffect is sufficient.
      }
    }
  }, [currentUser, isLoading, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <h1>Authenticating...</h1>
      {/* You could add a spinner here */}
    </div>
  );
};

export default AuthCallback;
