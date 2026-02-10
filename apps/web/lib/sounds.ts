/**
 * Web Audio API sound effects.
 * Generates synthetic sounds without external audio files.
 */

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioContext) {
    try {
      audioContext = new AudioContext()
    } catch {
      return null
    }
  }

  return audioContext
}

/**
 * Play an ascending double-tone for correct answers.
 * 440Hz → 880Hz, pleasant "ding-ding" sound.
 */
export function playSuccessSound(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime

  // First tone (440Hz)
  const osc1 = ctx.createOscillator()
  const gain1 = ctx.createGain()
  osc1.type = 'sine'
  osc1.frequency.value = 440
  gain1.gain.setValueAtTime(0.3, now)
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
  osc1.connect(gain1)
  gain1.connect(ctx.destination)
  osc1.start(now)
  osc1.stop(now + 0.3)

  // Second tone (880Hz, slightly delayed)
  const osc2 = ctx.createOscillator()
  const gain2 = ctx.createGain()
  osc2.type = 'sine'
  osc2.frequency.value = 880
  gain2.gain.setValueAtTime(0, now + 0.15)
  gain2.gain.linearRampToValueAtTime(0.3, now + 0.2)
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
  osc2.connect(gain2)
  gain2.connect(ctx.destination)
  osc2.start(now + 0.15)
  osc2.stop(now + 0.5)
}

/**
 * Play a short low tone for wrong answers.
 * 200Hz, 150ms duration.
 */
export function playErrorSound(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'square'
  osc.frequency.value = 200
  gain.gain.setValueAtTime(0.15, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.15)
}
