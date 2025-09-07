import React, { useMemo } from 'react';
import { RiUser3Line, RiUser3Fill } from 'react-icons/ri';

/**
 * ActiveUsersIndicator
 * A component to display the number of active users in real-time
 * 
 * Props:
 * - activeUsers: Array of active user objects
 * - maxVisible: Maximum number of user avatars to show (default: 3)
 */
const ActiveUsersIndicator = ({ activeUsers, maxVisible = 3 }) => {
  const visibleUsers = useMemo(() => {
    return activeUsers.slice(0, maxVisible);
  }, [activeUsers, maxVisible]);

  const remainingCount = useMemo(() => {
    return Math.max(0, activeUsers.length - maxVisible);
  }, [activeUsers, maxVisible]);

  const getInitials = (userId) => {
    return userId.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (index) => {
    const colors = [
      'bg-emerald-500',
      'bg-blue-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-indigo-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {visibleUsers.map((user, index) => (
          <div
            key={user.id}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-neutral-900 ${getAvatarColor(index)}`}
            title={`Active user: ${user.id.substring(0, 8)}...`}
          >
            {getInitials(user.id)}
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-neutral-700 text-neutral-300 border-2 border-neutral-900"
            title={`+${remainingCount} more active users`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
      
      {activeUsers.length > 0 && (
        <div className="text-xs text-neutral-400">
          {activeUsers.length === 1 ? '1 active' : `${activeUsers.length} active`}
        </div>
      )}
    </div>
  );
};

export default ActiveUsersIndicator;