import { describe, it, expect } from 'vitest'
import {
  createSessionToken,
  verifySessionToken,
  createDemoToken,
  isDemoToken,
} from '@/lib/utils/session-token'

describe('session-token', () => {
  describe('createSessionToken', () => {
    it('should produce a non-empty string with colon separator', () => {
      const token = createSessionToken('test-id')
      expect(token).toBeTruthy()
      expect(token).toContain(':')
      expect(token.startsWith('test-id:')).toBe(true)
    })

    it('should produce different signatures for different IDs', () => {
      const token1 = createSessionToken('id-1')
      const token2 = createSessionToken('id-2')
      const sig1 = token1.split(':')[1]
      const sig2 = token2.split(':')[1]
      expect(sig1).not.toBe(sig2)
    })

    it('should produce consistent tokens for the same ID', () => {
      const token1 = createSessionToken('same-id')
      const token2 = createSessionToken('same-id')
      expect(token1).toBe(token2)
    })
  })

  describe('verifySessionToken', () => {
    it('should return true for a valid token', () => {
      const token = createSessionToken('my-session')
      expect(verifySessionToken(token, 'my-session')).toBe(true)
    })

    it('should return false for a tampered signature', () => {
      const token = createSessionToken('my-session')
      const tampered = token.slice(0, -1) + 'X'
      expect(verifySessionToken(tampered, 'my-session')).toBe(false)
    })

    it('should return false for a wrong session ID', () => {
      const token = createSessionToken('session-a')
      expect(verifySessionToken(token, 'session-b')).toBe(false)
    })

    it('should return false for a token without colon', () => {
      expect(verifySessionToken('no-colon', 'test')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(verifySessionToken('', 'test')).toBe(false)
    })
  })

  describe('demo tokens', () => {
    it('should create a demo token', () => {
      const token = createDemoToken('demo-session-001')
      expect(token).toBe('demo-session-001:demo')
    })

    it('should identify demo tokens', () => {
      expect(isDemoToken('demo-session-001:demo')).toBe(true)
    })

    it('should not identify regular tokens as demo', () => {
      const token = createSessionToken('real-session')
      expect(isDemoToken(token)).toBe(false)
    })
  })
})
