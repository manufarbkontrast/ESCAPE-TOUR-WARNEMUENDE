import { create } from 'zustand'

type AudioTrackType = 'ambient' | 'effect' | 'voice'

interface AudioTrack {
  readonly id: string
  readonly type: AudioTrackType
  readonly url: string
  readonly loop: boolean
}

interface AudioState {
  readonly currentTrack: AudioTrack | null
  readonly volume: number
  readonly isMuted: boolean
  readonly isPlaying: boolean
  readonly activeTracks: readonly AudioTrack[]
}

interface AudioActions {
  readonly playAmbient: (id: string, url: string, loop?: boolean) => void
  readonly playEffect: (id: string, url: string) => void
  readonly playVoice: (id: string, url: string) => void
  readonly stopAll: () => void
  readonly stopTrack: (id: string) => void
  readonly setVolume: (volume: number) => void
  readonly toggleMute: () => void
  readonly setIsPlaying: (isPlaying: boolean) => void
  readonly setCurrentTrack: (track: AudioTrack | null) => void
  readonly addActiveTrack: (track: AudioTrack) => void
  readonly removeActiveTrack: (id: string) => void
}

type AudioStore = AudioState & AudioActions

const DEFAULT_VOLUME = 0.7

const initialState: AudioState = {
  currentTrack: null,
  volume: DEFAULT_VOLUME,
  isMuted: false,
  isPlaying: false,
  activeTracks: [],
}

const clampVolume = (value: number): number => {
  return Math.max(0, Math.min(1, value))
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  ...initialState,

  playAmbient: (id: string, url: string, loop = true) => {
    const track: AudioTrack = {
      id,
      type: 'ambient',
      url,
      loop,
    }

    set((state) => {
      const filteredTracks = state.activeTracks.filter(
        (t) => t.type !== 'ambient'
      )

      return {
        currentTrack: track,
        isPlaying: true,
        activeTracks: [...filteredTracks, track],
      }
    })
  },

  playEffect: (id: string, url: string) => {
    const track: AudioTrack = {
      id,
      type: 'effect',
      url,
      loop: false,
    }

    set((state) => ({
      activeTracks: [...state.activeTracks, track],
    }))
  },

  playVoice: (id: string, url: string) => {
    const track: AudioTrack = {
      id,
      type: 'voice',
      url,
      loop: false,
    }

    set((state) => {
      const filteredTracks = state.activeTracks.filter(
        (t) => t.type !== 'voice'
      )

      return {
        currentTrack: track,
        isPlaying: true,
        activeTracks: [...filteredTracks, track],
      }
    })
  },

  stopAll: () => {
    set({
      currentTrack: null,
      isPlaying: false,
      activeTracks: [],
    })
  },

  stopTrack: (id: string) => {
    set((state) => {
      const filteredTracks = state.activeTracks.filter((t) => t.id !== id)
      const shouldUpdateCurrent = state.currentTrack?.id === id

      return {
        activeTracks: filteredTracks,
        currentTrack: shouldUpdateCurrent ? null : state.currentTrack,
        isPlaying: shouldUpdateCurrent
          ? filteredTracks.length > 0
          : state.isPlaying,
      }
    })
  },

  setVolume: (volume: number) => {
    set({
      volume: clampVolume(volume),
    })
  },

  toggleMute: () => {
    set((state) => ({
      isMuted: !state.isMuted,
    }))
  },

  setIsPlaying: (isPlaying: boolean) => {
    set({
      isPlaying,
    })
  },

  setCurrentTrack: (track: AudioTrack | null) => {
    set({
      currentTrack: track,
    })
  },

  addActiveTrack: (track: AudioTrack) => {
    set((state) => ({
      activeTracks: [...state.activeTracks, track],
    }))
  },

  removeActiveTrack: (id: string) => {
    set((state) => ({
      activeTracks: state.activeTracks.filter((t) => t.id !== id),
    }))
  },
}))
