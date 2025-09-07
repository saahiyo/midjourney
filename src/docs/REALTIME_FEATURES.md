# Supabase Realtime Features

This document describes the Realtime features implemented in the Midjourney application using Supabase Realtime.

## Overview

The application now supports Realtime updates for:
- New generation notifications
- Generation deletion notifications
- Active user presence tracking

## Features Implemented

### 1. Realtime Generation Updates

**File**: `src/hooks/useSupabaseRealtime.js`

The `useSupabaseRealtime` hook provides Realtime subscription capabilities for the `generations` table.

**Features**:
- Subscribes to all changes (INSERT, UPDATE, DELETE) in the `generations` table
- Handles connection status monitoring
- Automatic reconnection on connection loss
- Clean up on component unmount

**Usage**:
```javascript
const { isConnected, connectionError, setupRealtimeSubscription } = useSupabaseRealtime(
  onGenerationCreated,
  onGenerationDeleted
);
```

### 2. Realtime Presence Tracking

**File**: `src/hooks/useSupabasePresence.js`

The `useSupabasePresence` hook tracks active users in real-time.

**Features**:
- Tracks user presence in a shared room
- Shows active user avatars
- Handles user join/leave events
- Automatic cleanup of inactive users (older than 30 seconds)
- Unique user ID generation for each session

**Usage**:
```javascript
const { activeUsers, isTracking, getUserCount } = useSupabasePresence('generations-room');
```

### 3. Active Users Indicator

**File**: `src/components/ActiveUsersIndicator.jsx`

A visual component that displays active users with avatars and count.

**Features**:
- Shows user avatars with initials
- Displays count of active users
- Handles overflow with "+N" indicator
- Color-coded avatars for different users

**Usage**:
```javascript
<ActiveUsersIndicator activeUsers={activeUsers} maxVisible={3} />
```

### 4. Integration in Generations Page

**File**: `src/pages/Generations.jsx`

The Generations page has been updated to include Realtime features:

- Realtime subscription for generation changes
- Presence tracking for active users
- Toast notifications for Realtime updates
- Live connection status indicators

## Realtime Events

### Generation Events

When a new generation is created:
- Automatically appears in all connected clients
- Shows a toast notification
- Updates the generation list in real-time

When a generation is deleted:
- Automatically removed from all connected clients
- Shows a toast notification
- Updates the generation count in real-time

### Presence Events

When users join/leave:
- Active user list updates in real-time
- User avatars appear/disappear
- Connection status is displayed

## Testing

**File**: `src/utils/testRealtime.js`

Utility functions to test Realtime functionality:

```javascript
// Test Realtime subscription
await testRealtimeSubscription();

// Test Realtime presence
await testRealtimePresence();

// Run all tests
await runAllRealtimeTests();
```

## Environment Setup

### Supabase Configuration

1. Enable Realtime in your Supabase project:
   - Go to your Supabase dashboard
   - Navigate to Realtime settings
   - Enable Realtime for the `generations` table

2. Ensure RLS (Row Level Security) policies allow:
   - SELECT operations for all users
   - INSERT/UPDATE/DELETE operations as needed

### Required Environment Variables

Make sure these are set in your `.env.local` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Performance Considerations

1. **Connection Management**: The hooks automatically manage connections and clean up when components unmount.

2. **Event Handling**: Events are debounced and handled efficiently to prevent performance issues.

3. **Presence Cleanup**: Inactive users are automatically cleaned up after 30 seconds.

4. **Reconnection Logic**: Automatic reconnection with exponential backoff on connection loss.

## Error Handling

The Realtime system includes comprehensive error handling:
- Connection errors are displayed to users
- Failed subscriptions are retried automatically
- Graceful degradation when Realtime is unavailable

## Browser Compatibility

The Realtime features work in all modern browsers that support:
- WebSocket connections
- ES6+ JavaScript features
- CSS Grid and Flexbox

## Troubleshooting

### Common Issues

1. **Realtime not working**:
   - Check Supabase project settings
   - Verify RLS policies
   - Ensure environment variables are set correctly

2. **Connection errors**:
   - Check internet connection
   - Verify Supabase project is online
   - Check browser console for error messages

3. **Presence not updating**:
   - Ensure the room ID is consistent
   - Check user permissions
   - Verify Supabase Realtime is enabled

### Debug Mode

Enable debug logging by setting:
```javascript
// In browser console
window.supabase.realtime.setDebug(true);
```

## Future Enhancements

1. **Real-time Chat**: Add chat functionality for users to communicate while generating images.

2. **Collaborative Generation**: Allow multiple users to work on the same generation.

3. **Live Progress Updates**: Show generation progress in real-time across all connected clients.

4. **User Profiles**: Display user information alongside their active status.

5. **Notification System**: Enhanced notifications for specific events.