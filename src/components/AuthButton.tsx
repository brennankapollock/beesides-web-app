import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from './Link';
import { LogOutIcon, UserIcon } from 'lucide-react';
export function AuthButton() {
  const {
    currentUser,
    isAuthenticated,
    logout
  } = useAuth();
  if (isAuthenticated && currentUser) {
    return <div className="relative group">
        <Link to={`/profile/${currentUser.username}`} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" aria-label="Your profile">
          {currentUser.avatar ? <img src={currentUser.avatar} alt={currentUser.name} className="w-6 h-6 rounded-full" /> : <UserIcon size={18} />}
        </Link>
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-3 border-b">
            <p className="font-medium truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-500 truncate">
              @{currentUser.username}
            </p>
          </div>
          <Link to={`/profile/${currentUser.username}`} className="block px-4 py-2 hover:bg-gray-100 w-full text-left">
            Profile
          </Link>
          <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100 w-full text-left">
            Settings
          </Link>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600">
            <LogOutIcon size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </div>;
  }
  return <div className="flex gap-2">
      <Link to="/login" className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
        Sign in
      </Link>
      <Link to="/register" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors">
        Sign up
      </Link>
    </div>;
}