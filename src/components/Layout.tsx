import React, { useState } from 'react';
import { MenuIcon, UserIcon } from 'lucide-react';
import { Navigation } from './Navigation';
import { Link } from './Link';
export function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // This would typically come from authentication context
  const currentUser = {
    username: 'johndoe'
  };
  return <div className="bg-white text-black min-h-screen font-mono">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4 md:px-6 lg:px-8">
          <Link to="/" className="text-xl font-bold tracking-tight">
            BEESIDES
          </Link>
          <div className="flex gap-4">
            <Link to={`/profile/${currentUser.username}`} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" aria-label="Your profile">
              <UserIcon size={18} />
            </Link>
            <button className="p-2 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              <MenuIcon size={18} />
            </button>
          </div>
        </div>
      </header>
      <main className="relative">{children}</main>
      <Navigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} currentUser={currentUser} />
    </div>;
}