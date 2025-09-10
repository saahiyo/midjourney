import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function UserProfile() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, signOut } = useAuth();
  const dropdownRef = useRef(null);

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isDropdownOpen}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-medium">
          {user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="text-sm text-neutral-300 hidden md:inline">
          {user?.email?.split('@')[0] || 'User'}
        </span>
        <i className={`ri-arrow-down-s-line text-neutral-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-neutral-900 rounded-lg shadow-lg border border-neutral-800 z-50 animate-fadeIn">
          <div className="p-4 border-b border-neutral-800">
            <p className="text-sm font-medium text-neutral-300">
              {user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-neutral-500">Free Account</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <i className="ri-logout-box-line mr-2"></i>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
