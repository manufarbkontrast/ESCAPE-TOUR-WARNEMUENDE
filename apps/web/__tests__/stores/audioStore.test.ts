/**
 * Tests for audioStore — audio playback, track management, volume control
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useAudioStore } from '@/stores/audioStore'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('audioStore', () => {
  beforeEach(() => {
    // Reset to initial state
    useAudioStore.getState().stopAll()
    useAudioStore.setState({ volume: 0.7, isMuted: false })
  })

  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------

  describe('initial state', () => {
    it('should have no current track', () => {
      expect(useAudioStore.getState().currentTrack).toBeNull()
    })

    it('should default volume to 0.7', () => {
      expect(useAudioStore.getState().volume).toBe(0.7)
    })

    it('should not be muted', () => {
      expect(useAudioStore.getState().isMuted).toBe(false)
    })

    it('should not be playing', () => {
      expect(useAudioStore.getState().isPlaying).toBe(false)
    })

    it('should have empty active tracks', () => {
      expect(useAudioStore.getState().activeTracks).toEqual([])
    })
  })

  // -----------------------------------------------------------------------
  // playAmbient
  // -----------------------------------------------------------------------

  describe('playAmbient', () => {
    it('should set current track and start playing', () => {
      useAudioStore.getState().playAmbient('waves', '/audio/waves.mp3')

      const state = useAudioStore.getState()
      expect(state.currentTrack).toEqual({
        id: 'waves',
        type: 'ambient',
        url: '/audio/waves.mp3',
        loop: true,
      })
      expect(state.isPlaying).toBe(true)
    })

    it('should default loop to true', () => {
      useAudioStore.getState().playAmbient('waves', '/audio/waves.mp3')

      expect(useAudioStore.getState().currentTrack!.loop).toBe(true)
    })

    it('should allow loop override to false', () => {
      useAudioStore.getState().playAmbient('waves', '/audio/waves.mp3', false)

      expect(useAudioStore.getState().currentTrack!.loop).toBe(false)
    })

    it('should add track to active tracks', () => {
      useAudioStore.getState().playAmbient('waves', '/audio/waves.mp3')

      expect(useAudioStore.getState().activeTracks).toHaveLength(1)
      expect(useAudioStore.getState().activeTracks[0].id).toBe('waves')
    })

    it('should replace previous ambient track', () => {
      useAudioStore.getState().playAmbient('waves', '/audio/waves.mp3')
      useAudioStore.getState().playAmbient('harbor', '/audio/harbor.mp3')

      const state = useAudioStore.getState()
      expect(state.activeTracks).toHaveLength(1)
      expect(state.activeTracks[0].id).toBe('harbor')
      expect(state.currentTrack!.id).toBe('harbor')
    })

    it('should not replace non-ambient tracks', () => {
      useAudioStore.getState().playEffect('click', '/audio/click.mp3')
      useAudioStore.getState().playAmbient('waves', '/audio/waves.mp3')

      const state = useAudioStore.getState()
      expect(state.activeTracks).toHaveLength(2)
    })
  })

  // -----------------------------------------------------------------------
  // playEffect
  // -----------------------------------------------------------------------

  describe('playEffect', () => {
    it('should add effect track to active tracks', () => {
      useAudioStore.getState().playEffect('click', '/audio/click.mp3')

      const tracks = useAudioStore.getState().activeTracks
      expect(tracks).toHaveLength(1)
      expect(tracks[0]).toEqual({
        id: 'click',
        type: 'effect',
        url: '/audio/click.mp3',
        loop: false,
      })
    })

    it('should not set current track or isPlaying', () => {
      useAudioStore.getState().playEffect('click', '/audio/click.mp3')

      expect(useAudioStore.getState().currentTrack).toBeNull()
      expect(useAudioStore.getState().isPlaying).toBe(false)
    })

    it('should allow multiple effects simultaneously', () => {
      useAudioStore.getState().playEffect('click', '/audio/click.mp3')
      useAudioStore.getState().playEffect('ding', '/audio/ding.mp3')

      expect(useAudioStore.getState().activeTracks).toHaveLength(2)
    })
  })

  // -----------------------------------------------------------------------
  // playVoice
  // -----------------------------------------------------------------------

  describe('playVoice', () => {
    it('should set current track and start playing', () => {
      useAudioStore.getState().playVoice('narrator', '/audio/intro.mp3')

      const state = useAudioStore.getState()
      expect(state.currentTrack).toEqual({
        id: 'narrator',
        type: 'voice',
        url: '/audio/intro.mp3',
        loop: false,
      })
      expect(state.isPlaying).toBe(true)
    })

    it('should replace previous voice track', () => {
      useAudioStore.getState().playVoice('intro', '/audio/intro.mp3')
      useAudioStore.getState().playVoice('outro', '/audio/outro.mp3')

      const state = useAudioStore.getState()
      expect(state.activeTracks.filter((t) => t.type === 'voice')).toHaveLength(
        1,
      )
      expect(state.currentTrack!.id).toBe('outro')
    })

    it('should not replace ambient or effect tracks', () => {
      useAudioStore.getState().playAmbient('waves', '/audio/waves.mp3')
      useAudioStore.getState().playEffect('click', '/audio/click.mp3')
      useAudioStore.getState().playVoice('narrator', '/audio/intro.mp3')

      expect(useAudioStore.getState().activeTracks).toHaveLength(3)
    })
  })

  // -----------------------------------------------------------------------
  // stopAll / stopTrack
  // -----------------------------------------------------------------------

  describe('stopAll', () => {
    it('should clear all tracks and stop playing', () => {
      useAudioStore.getState().playAmbient('waves', '/audio/waves.mp3')
      useAudioStore.getState().playEffect('click', '/audio/click.mp3')
      useAudioStore.getState().stopAll()

      const state = useAudioStore.getState()
      expect(state.currentTrack).toBeNull()
      expect(state.isPlaying).toBe(false)
      expect(state.activeTracks).toEqual([])
    })
  })

  describe('stopTrack', () => {
    it('should remove track by ID', () => {
      useAudioStore.getState().playEffect('click', '/audio/click.mp3')
      useAudioStore.getState().playEffect('ding', '/audio/ding.mp3')
      useAudioStore.getState().stopTrack('click')

      const tracks = useAudioStore.getState().activeTracks
      expect(tracks).toHaveLength(1)
      expect(tracks[0].id).toBe('ding')
    })

    it('should clear currentTrack when stopping the current track', () => {
      useAudioStore.getState().playAmbient('waves', '/audio/waves.mp3')
      useAudioStore.getState().stopTrack('waves')

      expect(useAudioStore.getState().currentTrack).toBeNull()
    })

    it('should set isPlaying to false when no tracks remain after stopping current', () => {
      useAudioStore.getState().playAmbient('waves', '/audio/waves.mp3')
      useAudioStore.getState().stopTrack('waves')

      expect(useAudioStore.getState().isPlaying).toBe(false)
    })

    it('should keep isPlaying true when other tracks remain after stopping current', () => {
      useAudioStore.getState().playAmbient('waves', '/audio/waves.mp3')
      useAudioStore.getState().playEffect('click', '/audio/click.mp3')
      useAudioStore.getState().stopTrack('waves')

      const state = useAudioStore.getState()
      expect(state.currentTrack).toBeNull()
      expect(state.isPlaying).toBe(true)
    })

    it('should not affect currentTrack when stopping a non-current track', () => {
      useAudioStore.getState().playAmbient('waves', '/audio/waves.mp3')
      useAudioStore.getState().playEffect('click', '/audio/click.mp3')
      useAudioStore.getState().stopTrack('click')

      expect(useAudioStore.getState().currentTrack!.id).toBe('waves')
      expect(useAudioStore.getState().isPlaying).toBe(true)
    })
  })

  // -----------------------------------------------------------------------
  // Volume controls
  // -----------------------------------------------------------------------

  describe('setVolume', () => {
    it('should set volume to the given value', () => {
      useAudioStore.getState().setVolume(0.5)

      expect(useAudioStore.getState().volume).toBe(0.5)
    })

    it('should clamp volume to 0 minimum', () => {
      useAudioStore.getState().setVolume(-0.5)

      expect(useAudioStore.getState().volume).toBe(0)
    })

    it('should clamp volume to 1 maximum', () => {
      useAudioStore.getState().setVolume(1.5)

      expect(useAudioStore.getState().volume).toBe(1)
    })

    it('should handle boundary values', () => {
      useAudioStore.getState().setVolume(0)
      expect(useAudioStore.getState().volume).toBe(0)

      useAudioStore.getState().setVolume(1)
      expect(useAudioStore.getState().volume).toBe(1)
    })
  })

  describe('toggleMute', () => {
    it('should toggle mute from false to true', () => {
      useAudioStore.getState().toggleMute()

      expect(useAudioStore.getState().isMuted).toBe(true)
    })

    it('should toggle mute from true to false', () => {
      useAudioStore.getState().toggleMute()
      useAudioStore.getState().toggleMute()

      expect(useAudioStore.getState().isMuted).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // Direct state setters
  // -----------------------------------------------------------------------

  describe('setIsPlaying', () => {
    it('should set isPlaying', () => {
      useAudioStore.getState().setIsPlaying(true)
      expect(useAudioStore.getState().isPlaying).toBe(true)

      useAudioStore.getState().setIsPlaying(false)
      expect(useAudioStore.getState().isPlaying).toBe(false)
    })
  })

  describe('setCurrentTrack', () => {
    it('should set current track', () => {
      const track = {
        id: 'test',
        type: 'ambient' as const,
        url: '/audio/test.mp3',
        loop: true,
      }
      useAudioStore.getState().setCurrentTrack(track)

      expect(useAudioStore.getState().currentTrack).toEqual(track)
    })

    it('should allow clearing current track', () => {
      useAudioStore.getState().setCurrentTrack({
        id: 'test',
        type: 'ambient' as const,
        url: '/audio/test.mp3',
        loop: true,
      })
      useAudioStore.getState().setCurrentTrack(null)

      expect(useAudioStore.getState().currentTrack).toBeNull()
    })
  })

  describe('addActiveTrack', () => {
    it('should add track to active tracks', () => {
      const track = {
        id: 'manual',
        type: 'effect' as const,
        url: '/audio/manual.mp3',
        loop: false,
      }
      useAudioStore.getState().addActiveTrack(track)

      expect(useAudioStore.getState().activeTracks).toContainEqual(track)
    })
  })

  describe('removeActiveTrack', () => {
    it('should remove track by ID', () => {
      const track = {
        id: 'removeme',
        type: 'effect' as const,
        url: '/audio/removeme.mp3',
        loop: false,
      }
      useAudioStore.getState().addActiveTrack(track)
      useAudioStore.getState().removeActiveTrack('removeme')

      expect(useAudioStore.getState().activeTracks).toEqual([])
    })

    it('should only remove the matching track', () => {
      useAudioStore.getState().addActiveTrack({
        id: 'keep',
        type: 'effect' as const,
        url: '/audio/keep.mp3',
        loop: false,
      })
      useAudioStore.getState().addActiveTrack({
        id: 'remove',
        type: 'effect' as const,
        url: '/audio/remove.mp3',
        loop: false,
      })
      useAudioStore.getState().removeActiveTrack('remove')

      expect(useAudioStore.getState().activeTracks).toHaveLength(1)
      expect(useAudioStore.getState().activeTracks[0].id).toBe('keep')
    })
  })
})
