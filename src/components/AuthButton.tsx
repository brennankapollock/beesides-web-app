import { useAuth } from "../hooks/useAuth";
import { Link } from "./Link";
export function AuthButton() {
  const { currentUser, isAuthenticated } = useAuth();
  if (isAuthenticated && currentUser) {
    return null; // Don't show anything when user is signed in
  }
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
