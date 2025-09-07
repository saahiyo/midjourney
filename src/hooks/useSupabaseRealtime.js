import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * useSupabaseRealtime
 * A custom hook for managing Supabase Realtime subscriptions
 * 
 * Features:
 * - Subscribe to new generations
 * - Subscribe to generation deletions
 * - Handle connection status
 * - Clean up subscriptions on unmount
 * - Provide real-time updates to components
 */
export const useSupabaseRealtime = (onGenerationCreated, onGenerationDeleted) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const subscriptionRef = useRef(null);
  const channelRef = useRef(null);

  // Handle Realtime events
  const handleRealtimeEvent = useCallback((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        if (newRecord && onGenerationCreated) {
          onGenerationCreated(newRecord);
        }
        break;
      
      case 'DELETE':
        if (oldRecord && onGenerationDeleted) {
          onGenerationDeleted(oldRecord);
        }
        break;
      
      case 'UPDATE':
        // Handle updates if needed in the future
        break;
      
      default:
        console.warn('Unhandled Realtime event type:', eventType);
    }
  }, [onGenerationCreated, onGenerationDeleted]);

  // Setup Realtime subscription
  const setupRealtimeSubscription = useCallback(async () => {
    if (!supabase) {
      setConnectionError('Supabase client not available');
      return;
    }

    try {
      // Clean up existing subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      // Create new channel for generations table
      const channel = supabase
        .channel('generations-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events: INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'generations'
          },
          handleRealtimeEvent
        )
        .on('status', (event) => {
          console.log('Realtime status:', event);
          setIsConnected(event === 'SUBSCRIBED');
        })
        .on('error', (error) => {
          console.error('Realtime error:', error);
          setConnectionError(error.message);
          setIsConnected(false);
        })
        .subscribe();

      channelRef.current = channel;
      setConnectionError(null);
    } catch (error) {
      console.error('Failed to setup Realtime subscription:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    }
  }, [handleRealtimeEvent]);

  // Clean up subscriptions
  const cleanupSubscription = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setIsConnected(false);
    setConnectionError(null);
  }, []);

  // Setup and cleanup on mount/unmount
  useEffect(() => {
    setupRealtimeSubscription();

    return () => {
      cleanupSubscription();
    };
  }, [setupRealtimeSubscription, cleanupSubscription]);

  // Reconnect if connection is lost
  useEffect(() => {
    if (!isConnected && !connectionError) {
      const reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect to Realtime...');
        setupRealtimeSubscription();
      }, 5000);

      return () => clearTimeout(reconnectTimer);
    }
  }, [isConnected, connectionError, setupRealtimeSubscription]);

  return {
    isConnected,
    connectionError,
    setupRealtimeSubscription,
    cleanupSubscription
  };
};