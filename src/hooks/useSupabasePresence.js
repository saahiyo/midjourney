import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * useSupabasePresence
 * A custom hook for managing user presence and showing active users
 * 
 * Features:
 * - Track active users in real-time
 * - Show user presence indicators
 * - Handle user join/leave events
 * - Clean up presence tracking on unmount
 */
export const useSupabasePresence = (roomId = 'generations-room') => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [presenceError, setPresenceError] = useState(null);
  const channelRef = useRef(null);
  const presenceRef = useRef({});
  const userIdRef = useRef(null);

  // Generate a unique user ID for this session
  const generateUserId = useCallback(() => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get or create user ID
  const getUserId = useCallback(() => {
    if (!userIdRef.current) {
      userIdRef.current = generateUserId();
    }
    return userIdRef.current;
  }, [generateUserId]);

  // Handle presence changes
  const handlePresenceChange = useCallback((payload) => {
    const { newPresences, leftPresences } = payload;

    // Update presence tracking
    const newPresenceRef = { ...presenceRef.current };

    // Remove users who left
    leftPresences.forEach(presence => {
      delete newPresenceRef[presence.key];
    });

    // Add or update new presences
    newPresences.forEach(presence => {
      newPresenceRef[presence.key] = {
        id: presence.key,
        ...presence.presence,
        lastSeen: Date.now()
      };
    });

    presenceRef.current = newPresenceRef;

    // Convert to array and filter out current user
    const users = Object.values(newPresenceRef)
      .filter(user => user.id !== getUserId())
      .sort((a, b) => b.lastSeen - a.lastSeen);

    setActiveUsers(users);
  }, [getUserId]);

  // Clean up old presence records (older than 30 seconds)
  const cleanupOldPresences = useCallback(() => {
    const now = Date.now();
    const newPresenceRef = { ...presenceRef.current };

    Object.keys(newPresenceRef).forEach(key => {
      if (now - newPresenceRef[key].lastSeen > 30000) {
        delete newPresenceRef[key];
      }
    });

    presenceRef.current = newPresenceRef;

    // Convert to array and filter out current user
    const users = Object.values(newPresenceRef)
      .filter(user => user.id !== getUserId())
      .sort((a, b) => b.lastSeen - a.lastSeen);

    setActiveUsers(users);
  }, [getUserId]);

  // Setup presence tracking
  const setupPresenceTracking = useCallback(async () => {
    if (!supabase) {
      setPresenceError('Supabase client not available');
      return;
    }

    try {
      // Clean up existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const userId = getUserId();
      const channel = supabase
        .channel(`presence-${roomId}`)
        .on('presence', { event: 'sync' }, () => {
          console.log('Presence sync completed');
          setIsTracking(true);
        })
        .on('presence', { event: 'join' }, handlePresenceChange)
        .on('presence', { event: 'leave' }, handlePresenceChange)
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Set initial presence
            await channel.track({
              status: 'active',
              joinedAt: Date.now(),
              userAgent: navigator.userAgent.substring(0, 100)
            });
            setIsTracking(true);
            setPresenceError(null);
          } else {
            setIsTracking(false);
            setPresenceError('Failed to connect to presence channel');
          }
        });

      channelRef.current = channel;

      // Start cleanup interval
      const cleanupInterval = setInterval(cleanupOldPresences, 10000);
      
      return () => {
        clearInterval(cleanupInterval);
      };
    } catch (error) {
      console.error('Failed to setup presence tracking:', error);
      setPresenceError(error.message);
      setIsTracking(false);
    }
  }, [roomId, getUserId, handlePresenceChange, cleanupOldPresences]);

  // Clean up presence tracking
  const cleanupPresenceTracking = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.untrack();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setIsTracking(false);
    setActiveUsers([]);
    setPresenceError(null);
  }, []);

  // Setup and cleanup on mount/unmount
  useEffect(() => {
    setupPresenceTracking();

    return () => {
      cleanupPresenceTracking();
    };
  }, [setupPresenceTracking, cleanupPresenceTracking]);

  // Update presence periodically
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(async () => {
        if (channelRef.current) {
          await channelRef.current.track({
            status: 'active',
            lastSeen: Date.now()
          });
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isTracking]);

  return {
    activeUsers,
    isTracking,
    presenceError,
    getUserCount: activeUsers.length,
    isUserActive: (userId) => activeUsers.some(user => user.id === userId),
    setupPresenceTracking,
    cleanupPresenceTracking
  };
};