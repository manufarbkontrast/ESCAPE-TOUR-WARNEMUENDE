# Escape Tour Zustand Stores

This directory contains the global state management stores for the Escape Tour game app, built with Zustand v5.

## Stores

### `gameStore.ts`
Main game state management with localStorage persistence.

**State:**
- `session`: Current game session data (GameSession | null)
- `stationProgress`: Array of completed station progress records
- `isInitialized`: Flag indicating store hydration status

**Actions:**
- `startSession(session)`: Initialize a new game session
- `updateProgress(updates)`: Update session fields (points, station index, location, etc.)
- `pauseSession()`: Pause the active session
- `resumeSession()`: Resume a paused session (calculates pause duration)
- `completeStation(progress)`: Record station completion and add points
- `useHint()`: Increment hint usage counter
- `skipPuzzle()`: Increment puzzle skip counter
- `completeSession(totalPoints)`: Mark session as completed
- `setSession(session)`: Manually set session state
- `clearSession()`: Reset store to initial state

**Persistence:**
Stored in localStorage under key `escape-tour-game`.

### `locationStore.ts`
GPS/Geolocation tracking with proximity detection.

**State:**
- `userLocation`: Current user position with accuracy and timestamp
- `watchId`: Active geolocation watcher ID
- `isTracking`: Whether location tracking is active
- `error`: Error message from geolocation API

**Actions:**
- `startWatching()`: Begin GPS tracking with high accuracy
- `stopWatching()`: Stop GPS tracking and clear watcher
- `checkProximity(target, radiusMeters)`: Check if user is within radius of target location
- `setLocation(location)`: Manually update location
- `setError(error)`: Set error state

**Features:**
- Haversine formula for accurate distance calculations
- High accuracy mode enabled by default
- Automatic error handling for permission, timeout, and unavailability

### `audioStore.ts`
Audio playback state management.

**State:**
- `currentTrack`: Currently playing primary track (ambient/voice)
- `volume`: Global volume level (0-1)
- `isMuted`: Mute toggle state
- `isPlaying`: Playback status
- `activeTracks`: Array of all currently active tracks

**Actions:**
- `playAmbient(id, url, loop)`: Play ambient background audio
- `playEffect(id, url)`: Play sound effect (non-looping)
- `playVoice(id, url)`: Play voice narration (replaces other voice tracks)
- `stopAll()`: Stop all audio playback
- `stopTrack(id)`: Stop specific track by ID
- `setVolume(volume)`: Set volume (0-1, clamped)
- `toggleMute()`: Toggle mute state
- `setIsPlaying(isPlaying)`: Update playback status
- `setCurrentTrack(track)`: Set current track
- `addActiveTrack(track)`: Add track to active list
- `removeActiveTrack(id)`: Remove track from active list

**Track Types:**
- `ambient`: Background music/atmosphere (only one active at a time)
- `effect`: Sound effects (multiple can play simultaneously)
- `voice`: Narration/dialogue (only one active at a time)

## Usage

```typescript
import { useGameStore, useLocationStore, useAudioStore } from '@/stores'

// In a component
function GameComponent() {
  const session = useGameStore(state => state.session)
  const startSession = useGameStore(state => state.startSession)

  const userLocation = useLocationStore(state => state.userLocation)
  const startTracking = useLocationStore(state => state.startWatching)

  const playAmbient = useAudioStore(state => state.playAmbient)
  const volume = useAudioStore(state => state.volume)

  // ... component logic
}
```

## Type Safety

All stores use strict TypeScript types with:
- Readonly interfaces for immutability
- Type imports from `@escape-tour/shared`
- Proper generic constraints
- No mutation of state objects

## Installation

Stores require these dependencies:
```bash
npm install zustand
```

Shared types:
```bash
# Already included via workspace dependency
@escape-tour/shared
```
