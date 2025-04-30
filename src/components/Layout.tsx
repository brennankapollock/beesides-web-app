import React, { useState } from 'react';
import { MenuIcon } from 'lucide-react';
import { Navigation } from './Navigation';
import { Link } from './Link';
import { BottomSheetNavigation } from './BottomSheetNavigation';
import { AuthButton } from './AuthButton';
import { useAuth } from '../contexts/AuthContext';
export function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    currentUser
  } = useAuth();
  // Use the authenticated user or fallback to a default for components that need it
  const userForNavigation = currentUser || {
    username: 'guest'
  };
  return <div className="bg-white text-black min-h-screen font-mono">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4 md:px-6 lg:px-8">
          <Link to="/" className="text-xl font-bold tracking-tight">
            BEESIDES
          </Link>
          <div className="flex gap-4 items-center">
            <AuthButton />
            <button className="p-2 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              <MenuIcon size={18} />
            </button>
          </div>
        </div>
      </header>
      <main className="relative">{children}</main>
      <Navigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} currentUser={userForNavigation} />
      <BottomSheetNavigation currentUser={userForNavigation} />
    </div>;
}