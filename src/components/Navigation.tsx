import React from 'react';
import { Link } from './Link';
import { HomeIcon, SearchIcon, CompassIcon, UserIcon, XIcon, LibraryIcon, TrendingUpIcon, HeartIcon, SettingsIcon } from 'lucide-react';
interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    username: string;
  };
}
export function Navigation({
  isOpen,
  onClose,
  currentUser
}: NavigationProps) {
  const links = [{
    name: 'Home',
    to: '/',
    icon: <HomeIcon size={20} />
  }, {
    name: 'Discover',
    to: '/discover',
    icon: <CompassIcon size={20} />
  }, {
    name: 'Search',
    to: '/search',
    icon: <SearchIcon size={20} />
  }, {
    name: 'Profile',
    to: `/profile/${currentUser.username}`,
    icon: <UserIcon size={20} />
  }];
  const menuLinks = [{
    name: 'Home',
    to: '/',
    icon: <HomeIcon size={20} />
  }, {
    name: 'Discover',
    to: '/discover',
    icon: <CompassIcon size={20} />
  }, {
    name: 'Search',
    to: '/search',
    icon: <SearchIcon size={20} />
  }, {
    name: 'Profile',
    to: `/profile/${currentUser.username}`,
    icon: <UserIcon size={20} />
  }, {
    name: 'Library',
    to: '/library',
    icon: <LibraryIcon size={20} />
  }, {
    name: 'Trending',
    to: '/trending',
    icon: <TrendingUpIcon size={20} />
  }, {
    name: 'Favorites',
    to: '/favorites',
    icon: <HeartIcon size={20} />
  }, {
    name: 'Settings',
    to: '/settings',
    icon: <SettingsIcon size={20} />
  }];
  return <>
      {/* Mobile Navigation */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30 md:hidden">
        <div className="flex gap-1 bg-black text-white p-2 rounded-full shadow-lg">
          {links.map(link => <Link key={link.name} to={link.to} className="p-3 hover:bg-gray-800 rounded-full transition-colors flex items-center justify-center">
              {link.icon}
            </Link>)}
        </div>
      </div>
      {/* Desktop Navigation */}
      <div className="hidden md:block fixed left-6 top-1/2 transform -translate-y-1/2 z-30">
        <div className="flex flex-col gap-2 bg-black text-white p-3 rounded-full shadow-lg">
          {links.map(link => <Link key={link.name} to={link.to} className="p-3 hover:bg-gray-800 rounded-full transition-colors flex items-center justify-center tooltip-right" aria-label={link.name}>
              {link.icon}
            </Link>)}
        </div>
      </div>
      {/* Dropdown Menu */}
      <div className={`fixed inset-0 bg-black/90 z-50 text-white transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-2xl font-bold">Menu</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors" aria-label="Close menu">
              <XIcon size={24} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {menuLinks.map(link => <Link key={link.name} to={link.to} className="flex items-center gap-3 p-4 hover:bg-gray-800 rounded-lg transition-colors" onClick={onClose}>
                <span className="p-2 bg-gray-700 rounded-lg">{link.icon}</span>
                <span className="font-medium">{link.name}</span>
              </Link>)}
          </div>
          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2">Join our community</h3>
                <p className="opacity-70 max-w-md">
                  Get exclusive access to new features, early releases, and
                  community events.
                </p>
              </div>
              <Link to="/signup" className="px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors" onClick={onClose}>
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>;
}