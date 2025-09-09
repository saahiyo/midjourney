import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function UserProfile() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
      >
        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-medium">
          {user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="text-sm text-neutral-300 hidden md:inline">
          {user?.email || 'User'}
        </span>
        <i className="ri-arrow-down-s-line text-neutral-400"></i>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-neutral-900 rounded-lg shadow-lg border border-neutral-800 z-50">
          <div className="p-4 border-b border-neutral-800">
            <p className="text-sm font-medium text-neutral-300">{user?.email}</p>
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