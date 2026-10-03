// Web Audio API Sound Synthesizer
// Provides realistic bell chime notifications without external file dependencies

let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioContextClass();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
};

/**
 * Plays a small, pleasant hotel desk bell / reception chime sound.
 * Triggered whenever a new booking is created or a user/customer registers.
 */
export const playBellSound = (): void => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Helper to synthesize a harmonic chime strike
    const createChimeStrike = (freq: number, strikeTime: number, decayDuration: number, peakVolume: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, strikeTime);

      // Instant attack
      gain.gain.setValueAtTime(0.0001, strikeTime);
      gain.gain.linearRampToValueAtTime(peakVolume, strikeTime + 0.012);
      // Resonant exponential decay
      gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + decayDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(strikeTime);
      osc.stop(strikeTime + decayDuration + 0.05);
    };

    // Tone 1: High crisp desk bell strike (F#5 ~739.99 Hz & C#6 ~1108.73 Hz)
    createChimeStrike(740, now, 0.65, 0.22);
    createChimeStrike(1480, now, 0.35, 0.08); // 1st harmonic overtone

    // Tone 2: Melodic second chime strike (A5 ~880 Hz & E6 ~1318.51 Hz) after 110ms
    createChimeStrike(880, now + 0.11, 0.85, 0.26);
    createChimeStrike(1760, now + 0.11, 0.45, 0.09); // overtone
  } catch (err) {
    console.warn('Bell sound playback deferred:', err);
  }
};
