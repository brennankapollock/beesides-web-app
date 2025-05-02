import React from 'react';
import { Link } from './Link';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, SearchIcon, CompassIcon, UserIcon, XIcon, LibraryIcon, TrendingUpIcon, HeartIcon, SettingsIcon, ListMusicIcon, MessageCircleIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { logger } from '../utils/logger';
import { SignOutButton } from './SignOutButton';
interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    username: string;
    isLoading?: boolean;
  };
}
export function Navigation({
  isOpen,
  onClose,
  currentUser
}: NavigationProps) {
  const navigate = useNavigate();
  
  const handleMenuClose = () => {
    logger.debug("Closing menu", {
      category: 'navigation',
      data: { action: 'close_menu' }
    });
    onClose();
  };
  // Always show profile link in navigation - it will redirect to login if needed
  const showProfileLink = true;
  
  logger.debug("Navigation rendering", {
    category: 'navigation',
    data: {
      username: currentUser.username || "not set",
      isLoading: !!currentUser.isLoading,
      showProfileLink
    }
  });

  // Base links that are always shown
  const baseLinks = [
    {
      name: 'Home',
      to: '/',
      icon: <HomeIcon size={20} />
    }, 
    {
      name: 'Discover',
      to: '/discover',
      icon: <CompassIcon size={20} />
    }, 
    {
      name: 'Search',
      to: '/search',
      icon: <SearchIcon size={20} />
    }
  ];
  
  // Add profile link
  const links = [...baseLinks, {
    name: 'Profile',
    to: '/profile/me', // Use a standard path that will be handled properly
    icon: <UserIcon size={20} />
  }];
  const menuLinks = [{
    name: 'Library',
    to: '/library',
    icon: <LibraryIcon size={20} />
  }, {
    name: 'Trending',
    to: '/trending',
    icon: <TrendingUpIcon size={20} />
  }, {
    name: 'Lists',
    to: '/lists',
    icon: <ListMusicIcon size={20} />
  }, {
    name: 'Messages',
    to: '/messages',
    icon: <MessageCircleIcon size={20} />
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
      <div className={`fixed right-4 top-[72px] w-[280px] bg-white rounded-xl shadow-lg border transform transition-all duration-200 z-50 
        ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <div className="p-3 grid grid-cols-2 gap-2">
          {links.map(link => <Link key={link.name} to={link.to} className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-xl transition-colors" onClick={onClose}>
              <div className="p-2 bg-black text-white rounded-full">
                {link.icon}
              </div>
              <span className="text-xs">{link.name}</span>
            </Link>)}
        </div>
        <div className="border-t px-2 py-3">
          <div className="grid grid-cols-2 gap-2">
            {/* Regular menu items */}
            {menuLinks.map(link => (
              <Link 
                key={link.name} 
                to={link.to} 
                className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-xl transition-colors" 
                onClick={handleMenuClose}
              >
                <div className="p-2 bg-gray-100 rounded-full">{link.icon}</div>
                <span className="text-xs">{link.name}</span>
              </Link>
            ))}
            
            {/* Sign Out Button */}
            <SignOutButton onSuccess={handleMenuClose} />
          </div>
        </div>
      </div>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={onClose} />}
    </>;
}