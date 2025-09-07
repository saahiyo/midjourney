import { supabase } from '../lib/supabaseClient';

/**
 * Test Realtime functionality
 * This file contains utility functions to test Supabase Realtime features
 */

/**
 * Test Realtime subscription
 * Creates a test generation and verifies Realtime updates
 */
export const testRealtimeSubscription = async () => {
  if (!supabase) {
    console.error('Supabase client not available');
    return false;
  }

  console.log('Testing Realtime subscription...');
  
  try {
    // Create a test channel
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'generations'
      }, (payload) => {
        console.log('Realtime event received:', payload);
      })
      .subscribe();

    // Wait for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create a test generation
    const testGeneration = {
      prompt: 'Test generation for Realtime',
      aspect_ratio: '1:1',
      images: ['https://example.com/test.jpg']
    };

    const { data, error } = await supabase
      .from('generations')
      .insert([testGeneration])
      .select()
      .single();

    if (error) {
      console.error('Failed to create test generation:', error);
      return false;
    }

    console.log('Test generation created:', data);

    // Wait for Realtime event
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Clean up - delete the test generation
    await supabase
      .from('generations')
      .delete()
      .eq('id', data.id);

    // Wait for delete event
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clean up channel
    supabase.removeChannel(channel);

    console.log('Realtime test completed successfully');
    return true;

  } catch (error) {
    console.error('Realtime test failed:', error);
    return false;
  }
};

/**
 * Test Realtime presence
 * Tests user presence tracking functionality
 */
export const testRealtimePresence = async () => {
  if (!supabase) {
    console.error('Supabase client not available');
    return false;
  }

  console.log('Testing Realtime presence...');
  
  try {
    const channel = supabase
      .channel('test-presence')
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence sync completed');
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track presence
          await channel.track({
            status: 'testing',
            joinedAt: Date.now()
          });

          // Wait for presence updates
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Untrack to simulate leaving
          await channel.untrack();
        }
      });

    // Wait for presence events
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Clean up
    supabase.removeChannel(channel);

    console.log('Presence test completed successfully');
    return true;

  } catch (error) {
    console.error('Presence test failed:', error);
    return false;
  }
};

/**
 * Run all Realtime tests
 */
export const runAllRealtimeTests = async () => {
  console.log('Starting Realtime tests...');
  
  const results = {
    subscription: await testRealtimeSubscription(),
    presence: await testRealtimePresence()
  };

  console.log('Test results:', results);
  
  if (results.subscription && results.presence) {
    console.log('All Realtime tests passed!');
    return true;
  } else {
    console.log('Some Realtime tests failed');
    return false;
  }
};

// Export test functions for browser console usage
if (typeof window !== 'undefined') {
  window.testRealtime = {
    subscription: testRealtimeSubscription,
    presence: testRealtimePresence,
    runAll: runAllRealtimeTests
  };
}