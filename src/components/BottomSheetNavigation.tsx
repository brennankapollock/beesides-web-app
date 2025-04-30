import React, { useEffect, useState, useRef } from 'react';
import { Link } from './Link';
import { HomeIcon, SearchIcon, CompassIcon, UserIcon, LibraryIcon, TrendingUpIcon, HeartIcon, SettingsIcon, ChevronUpIcon, PlusIcon, ListMusicIcon, MessageCircleIcon } from 'lucide-react';
interface BottomSheetNavigationProps {
  currentUser: {
    username: string;
  };
}
export function BottomSheetNavigation({
  currentUser
}: BottomSheetNavigationProps) {
  const [sheetPosition, setSheetPosition] = useState<'closed' | 'peek' | 'half' | 'full'>('closed');
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isButtonExpanded, setIsButtonExpanded] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  // Primary navigation links
  const primaryLinks = [{
    name: 'Home',
    to: '/',
    icon: <HomeIcon size={24} />
  }, {
    name: 'Discover',
    to: '/discover',
    icon: <CompassIcon size={24} />
  }, {
    name: 'Search',
    to: '/search',
    icon: <SearchIcon size={24} />
  }, {
    name: 'Profile',
    to: `/profile/${currentUser.username}`,
    icon: <UserIcon size={24} />
  }];
  // Secondary navigation links
  const secondaryLinks = [{
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
    name: 'Lists',
    to: '/lists',
    icon: <ListMusicIcon size={20} />
  }, {
    name: 'Messages',
    to: '/messages',
    icon: <MessageCircleIcon size={20} />
  }, {
    name: 'Settings',
    to: '/settings',
    icon: <SettingsIcon size={20} />
  }];
  // Check if on desktop
  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkIfDesktop();
    window.addEventListener('resize', checkIfDesktop);
    return () => {
      window.removeEventListener('resize', checkIfDesktop);
    };
  }, []);
  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };
  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      setCurrentY(e.touches[0].clientY);
    }
  };
  // Handle touch end
  const handleTouchEnd = () => {
    if (isDragging) {
      const deltaY = currentY - startY;
      if (sheetPosition === 'closed' || sheetPosition === 'peek') {
        if (deltaY < -50) {
          // Swiped up significantly
          setSheetPosition('half');
        } else if (deltaY > 50) {
          // Swiped down significantly
          setSheetPosition('closed');
        } else {
          // Small movement, return to previous state
          setSheetPosition(sheetPosition === 'closed' ? 'closed' : 'peek');
        }
      } else if (sheetPosition === 'half') {
        if (deltaY < -50) {
          // Swiped up significantly from half
          setSheetPosition('full');
        } else if (deltaY > 50) {
          // Swiped down significantly from half
          setSheetPosition('peek');
        } else {
          // Small movement, stay at half
          setSheetPosition('half');
        }
      } else if (sheetPosition === 'full') {
        if (deltaY > 50) {
          // Swiped down significantly from full
          setSheetPosition('half');
        } else {
          // Small movement or upward, stay full
          setSheetPosition('full');
        }
      }
      setIsDragging(false);
    }
  };
  // Toggle sheet position on pull tab click
  const toggleSheet = () => {
    if (sheetPosition === 'closed') {
      setSheetPosition('peek');
    } else if (sheetPosition === 'peek') {
      setSheetPosition('half');
    } else if (sheetPosition === 'half') {
      setSheetPosition('full');
    } else {
      setSheetPosition('closed');
    }
  };
  // Get sheet position styles
  const getSheetStyle = () => {
    if (isDragging) {
      const deltaY = currentY - startY;
      let translateY = 0;
      if (sheetPosition === 'closed') {
        translateY = Math.max(0, -deltaY);
      } else if (sheetPosition === 'peek') {
        translateY = 'calc(100% - 80px - ' + Math.max(-100, Math.min(0, deltaY)) + 'px)';
      } else if (sheetPosition === 'half') {
        translateY = 'calc(50% + ' + Math.max(-100, Math.min(100, deltaY)) + 'px)';
      } else {
        translateY = Math.max(0, Math.min(50, deltaY)) + '%';
      }
      return {
        transform: `translateY(${translateY})`
      };
    }
    if (sheetPosition === 'closed') {
      return {
        transform: 'translateY(100%)'
      };
    } else if (sheetPosition === 'peek') {
      return {
        transform: 'translateY(calc(100% - 80px))'
      };
    } else if (sheetPosition === 'half') {
      return {
        transform: 'translateY(50%)'
      };
    } else {
      return {
        transform: 'translateY(0)'
      };
    }
  };
  // Toggle desktop floating button
  const toggleDesktopButton = () => {
    setIsButtonExpanded(!isButtonExpanded);
  };
  // Handle link click on mobile
  const handleLinkClick = () => {
    setSheetPosition('closed');
  };
  // Handle link click on desktop
  const handleDesktopLinkClick = () => {
    setIsButtonExpanded(false);
  };
  if (isDesktop) {
    return <div className="fixed bottom-6 right-6 z-50">
        {isButtonExpanded ? <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 w-80 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Navigation</h3>
                <button onClick={toggleDesktopButton} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronUpIcon size={20} />
                </button>
              </div>
              <div className="flex justify-between mb-6">
                {primaryLinks.map(link => <Link key={link.name} to={link.to} className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-xl transition-colors" onClick={handleDesktopLinkClick}>
                    <div className="p-2 bg-black text-white rounded-full">
                      {link.icon}
                    </div>
                    <span className="text-xs">{link.name}</span>
                  </Link>)}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {secondaryLinks.map(link => <Link key={link.name} to={link.to} className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-xl transition-colors" onClick={handleDesktopLinkClick}>
                    <div className="p-2 bg-gray-100 rounded-full">
                      {link.icon}
                    </div>
                    <span className="text-xs">{link.name}</span>
                  </Link>)}
              </div>
            </div>
          </div> : null}
        <button onClick={toggleDesktopButton} className="p-4 bg-black text-white rounded-full shadow-lg hover:bg-gray-900 transition-all hover:scale-105">
          {isButtonExpanded ? <ChevronUpIcon size={24} /> : <PlusIcon size={24} />}
        </button>
      </div>;
  }
  return <>
      <div ref={sheetRef} className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 transition-transform duration-300 ease-out ${isDragging ? '' : 'transition-bounce'}`} style={getSheetStyle()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {/* Pull Tab */}
        <div className="absolute top-0 left-0 right-0 flex justify-center -translate-y-1/2" onClick={toggleSheet}>
          <div className="w-12 h-6 bg-white rounded-full shadow flex items-center justify-center cursor-pointer">
            <div className="w-6 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </div>
        <div className="px-6 pt-6 pb-8">
          {/* Primary Navigation */}
          <div className="flex justify-between mb-8">
            {primaryLinks.map(link => <Link key={link.name} to={link.to} className="flex flex-col items-center gap-1" onClick={handleLinkClick}>
                <div className="p-3 bg-black text-white rounded-full">
                  {link.icon}
                </div>
                <span className="text-xs font-medium">{link.name}</span>
              </Link>)}
          </div>
          {/* Secondary Navigation */}
          <div className="grid grid-cols-3 gap-4">
            {secondaryLinks.map(link => <Link key={link.name} to={link.to} className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-xl transition-colors" onClick={handleLinkClick}>
                <div className="p-2 bg-gray-100 rounded-full">{link.icon}</div>
                <span className="text-xs">{link.name}</span>
              </Link>)}
          </div>
        </div>
      </div>
    </>;
}