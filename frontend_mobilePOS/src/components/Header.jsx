import { useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { BellIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const location = useLocation();
  const { storeInfo } = useStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract the current page name from the URL path
  const getPageName = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    return path.charAt(1).toUpperCase() + path.slice(2);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-gradient-to-br from-navy via-blue-600/80 to-blue-500/50 
      backdrop-blur-2xl shadow-[0_4px_20px_rgba(4,146,194,0.1),inset_0_0_0.5px_rgba(255,255,255,0.2)] 
      border-b border-gray-200/30">
      
      <div className="max-w-screen-2xl mx-auto px-6 py-2.5 flex items-center justify-between">
        {/* Logo + Page Heading */}
        <div className="flex items-center gap-4">
          {storeInfo?.logo ? (
            <img 
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${storeInfo.logo.replace(/^\/+|\/+$/g, '')}`} 
              alt={storeInfo.name || 'Store Logo'} 
              className="h-8 w-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 flex items-center justify-center text-white text-sm font-medium';
                fallback.textContent = storeInfo.name ? storeInfo.name.charAt(0).toUpperCase() : 'S';
                e.target.parentNode.insertBefore(fallback, e.target.nextSibling);
              }}
            />
          ) : (
            <div className="text-xl font-bold text-blue-600/90">
              {storeInfo?.name?.charAt(0) || 'POS'}
            </div>
          )}
          <div className="h-5 w-px bg-gray-300/40"></div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-[#0b27b1] via-cyan-500 to-blue-400 
            bg-clip-text text-transparent tracking-tight drop-shadow-[0_1px_1px_rgba(4,146,194,0.25)]">
            {getPageName()}
          </h1>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-5">
          {/* Notification Button - 3D / Embossed */}
          <button className="relative p-2 rounded-xl bg-gradient-to-br from-white via-blue-600/10 to-blue-600/20 
            shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(4,146,194,0.2)] 
            border border-white/30 text-blue-600/90 hover:shadow-[0_4px_10px_rgba(4,146,194,0.3)] 
            transition-all duration-300 active:translate-y-px">
            <BellIcon className="h-5 w-5 text-[#0b27b1]" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 shadow-md animate-pulse"></span>
          </button>

          {/* Profile Button - 3D / Embossed */}
          <div 
            ref={dropdownRef}
            className="flex items-center gap-3 px-3 py-1.5 bg-gradient-to-br from-white via-blue-600/10 to-blue-600/20 
            rounded-full shadow-[inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-2px_-2px_4px_rgba(4,146,194,0.2)] 
            border border-white/30 backdrop-blur-md cursor-pointer hover:shadow-md transition duration-300 group active:translate-y-[1px]"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#0b27b1] via-cyan-500 to-blue-400 text-white text-xs font-bold flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]">
              {storeInfo?.name?.charAt(0) || 'M'}
            </div>

            <div className="flex flex-col leading-tight">
              <div className="flex items-center text-sm font-medium text-[#0b27b1]">
                Manager
                <ChevronDownIcon className="ml-1 h-4 w-4 text-blue-600/60 group-hover:text-blue-600/90 transition" />
              </div>
              <span className="text-[11px] text-[#0b27b1]">Abcde</span>
            </div>

            {/* Dropdown menu */}
            {showDropdown && (
              <div className="absolute right-0 top-12 mt-1 w-48 bg-white/95 rounded-xl shadow-lg py-1 z-50 backdrop-blur-lg border border-gray-100/50 overflow-hidden">
                <a
                  href="#"
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDropdown(false);
                  }}
                >
                  Your Profile
                </a>
                <a
                  href="#"
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDropdown(false);
                  }}
                >
                  Settings
                </a>
                <div className="border-t border-gray-100 my-1"></div>
                <a
                  href="#"
                  className="block px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/80 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDropdown(false);
                    // Handle sign out here
                  }}
                >
                  Sign out
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}