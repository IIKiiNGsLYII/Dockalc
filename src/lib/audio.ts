// Audio feedback synthesis using Web Audio API with multiple Personality Packs
export type SoundProfile =
  | 'default'
  | 'cherry-blue'
  | 'thoccy'
  | 'chiptune'
  | 'typewriter'
  | 'piano';

class SoundFX {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  setMuted(isMuted: boolean) {
    this.muted = isMuted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Main sound dispatcher supporting multiple sound personality packs
   */
  playKeyClick(
    volume: number = 0.25,
    type: 'num' | 'op' | 'fn' | 'equal' | 'clear' = 'num',
    profile: SoundProfile = 'default',
    keyLabel?: string
  ) {
    if (this.muted || volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      switch (profile) {
        case 'cherry-blue':
          this.playCherryBlue(ctx, volume, type);
          break;
        case 'thoccy':
          this.playThoccy(ctx, volume, type);
          break;
        case 'chiptune':
          this.playChiptune(ctx, volume, type);
          break;
        case 'typewriter':
          this.playTypewriter(ctx, volume, type);
          break;
        case 'piano':
          this.playPiano(ctx, volume, type, keyLabel);
          break;
        case 'default':
        default:
          this.playDefault(ctx, volume, type);
          break;
      }
    } catch {
      // Audio playback failed or blocked by browser policy
    }
  }

  // 1. Modern Default Click
  private playDefault(
    ctx: AudioContext,
    volume: number,
    type: 'num' | 'op' | 'fn' | 'equal' | 'clear'
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    let freq = 1200;
    let duration = 0.025;

    switch (type) {
      case 'num':
        freq = 800;
        duration = 0.02;
        break;
      case 'op':
        freq = 1100;
        duration = 0.03;
        break;
      case 'fn':
        freq = 1400;
        duration = 0.03;
        break;
      case 'equal':
        freq = 1600;
        duration = 0.045;
        break;
      case 'clear':
        freq = 450;
        duration = 0.04;
        break;
    }

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + duration);

    const effectiveVol = Math.max(0.01, Math.min(1, volume * 0.3));
    gain.gain.setValueAtTime(effectiveVol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  // 2. Cherry MX Blue (Crisp dual-click with metallic transient)
  private playCherryBlue(
    ctx: AudioContext,
    volume: number,
    type: 'num' | 'op' | 'fn' | 'equal' | 'clear'
  ) {
    const now = ctx.currentTime;
    const effectiveVol = Math.max(0.01, Math.min(1, volume * 0.35));

    // Transient click 1 (high click)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(3200, now);
    osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.008);
    gain1.gain.setValueAtTime(effectiveVol, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.008);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.008);

    // Actuation tactile click 2 (slightly metallic body)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    const baseFreq = type === 'equal' ? 2400 : type === 'clear' ? 900 : 1800;
    osc2.frequency.setValueAtTime(baseFreq, now + 0.004);
    osc2.frequency.exponentialRampToValueAtTime(400, now + 0.022);
    gain2.gain.setValueAtTime(effectiveVol * 0.8, now + 0.004);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.004);
    osc2.stop(now + 0.022);
  }

  // 3. Thoccy Tactile (Deep acoustic wooden thock)
  private playThoccy(
    ctx: AudioContext,
    volume: number,
    type: 'num' | 'op' | 'fn' | 'equal' | 'clear'
  ) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);

    const baseFreq = type === 'equal' ? 320 : type === 'clear' ? 140 : 220;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.038);

    const effectiveVol = Math.max(0.01, Math.min(1, volume * 0.45));
    gain.gain.setValueAtTime(effectiveVol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 4. 8-Bit Chiptune (Retro Arcade blips & boops)
  private playChiptune(
    ctx: AudioContext,
    volume: number,
    type: 'num' | 'op' | 'fn' | 'equal' | 'clear'
  ) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';

    let freq = 440;
    let duration = 0.04;

    switch (type) {
      case 'num':
        freq = 523.25; // C5
        duration = 0.035;
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.setValueAtTime(freq * 1.5, now + 0.018);
        break;
      case 'op':
        freq = 659.25; // E5
        duration = 0.05;
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.setValueAtTime(freq * 1.25, now + 0.025);
        break;
      case 'equal':
        // Mario coin style jump
        duration = 0.12;
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.05); // E6
        break;
      case 'clear':
        // Downward sweep
        duration = 0.08;
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
        break;
      case 'fn':
      default:
        freq = 783.99; // G5
        duration = 0.04;
        osc.frequency.setValueAtTime(freq, now);
        break;
    }

    const effectiveVol = Math.max(0.01, Math.min(1, volume * 0.25));
    gain.gain.setValueAtTime(effectiveVol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  // 5. Vintage Typewriter (Realistic old-school mechanical cast-iron thud, carriage return ratchet, brass bell)
  private playTypewriter(
    ctx: AudioContext,
    volume: number,
    type: 'num' | 'op' | 'fn' | 'equal' | 'clear'
  ) {
    const now = ctx.currentTime;
    const effectiveVol = Math.max(0.01, Math.min(1, volume * 0.45));

    if (type === 'equal') {
      // Authentic Vintage Typewriter Brass End-of-Line Bell Ping ("Dinggg!")
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2489.02, now); // D#7 vintage bell ring
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(4978.03, now); // High chime harmonic

      // Strike tap transient
      const tapOsc = ctx.createOscillator();
      const tapGain = ctx.createGain();
      tapOsc.type = 'triangle';
      tapOsc.frequency.setValueAtTime(3200, now);
      tapGain.gain.setValueAtTime(effectiveVol * 0.4, now);
      tapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
      tapOsc.connect(tapGain);
      tapGain.connect(ctx.destination);
      tapOsc.start(now);
      tapOsc.stop(now + 0.015);

      // Long resonant decay for brass bell
      gain.gain.setValueAtTime(effectiveVol * 0.75, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + 0.65);
      oscHarmonic.stop(now + 0.65);
      return;
    }

    if (type === 'clear') {
      // Authentic Carriage Return: ratcheting mechanical teeth clicks followed by carriage stop chunk
      const clickTimes = [0, 0.035, 0.07, 0.105, 0.14];
      clickTimes.forEach((delay, idx) => {
        const t = now + delay;
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'sawtooth';
        clickOsc.frequency.setValueAtTime(1400 - idx * 120, t);
        clickGain.gain.setValueAtTime(effectiveVol * 0.45, t);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.start(t);
        clickOsc.stop(t + 0.02);
      });

      // Heavy metal carriage stop thud at the end
      const stopT = now + 0.18;
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'triangle';
      thudOsc.frequency.setValueAtTime(140, stopT);
      thudOsc.frequency.exponentialRampToValueAtTime(50, stopT + 0.08);
      thudGain.gain.setValueAtTime(effectiveVol * 0.6, stopT);
      thudGain.gain.exponentialRampToValueAtTime(0.0001, stopT + 0.08);
      thudOsc.connect(thudGain);
      thudGain.connect(ctx.destination);
      thudOsc.start(stopT);
      thudOsc.stop(stopT + 0.08);
      return;
    }

    // Heavy Vintage Mechanical Key Strike: Dual impulse (sharp steel typebar clack + heavy iron frame thud)
    // 1. Steel Typebar Strike (high snappy transient with bandpass filter)
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    const snapFilter = ctx.createBiquadFilter();
    snapFilter.type = 'bandpass';
    snapFilter.frequency.setValueAtTime(type === 'op' ? 1750 : 1350, now);
    snapFilter.Q.setValueAtTime(4.0, now);

    snapOsc.type = 'sawtooth';
    snapOsc.frequency.setValueAtTime(type === 'op' ? 1200 : 920, now);
    snapGain.gain.setValueAtTime(effectiveVol * 0.6, now);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    snapOsc.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.022);

    // 2. Heavy Cast-Iron Chassis Platen Thud (low-frequency resonance)
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(220, now + 0.004);
    bodyOsc.frequency.exponentialRampToValueAtTime(85, now + 0.05);

    bodyGain.gain.setValueAtTime(effectiveVol * 0.5, now + 0.004);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(now + 0.004);
    bodyOsc.stop(now + 0.055);
  }

  // 6. Musical Piano (Keys 0-9 strictly mapped to notes A through G + 3 higher notes: A4 -> C6)
  private playPiano(
    ctx: AudioContext,
    volume: number,
    type: 'num' | 'op' | 'fn' | 'equal' | 'clear',
    keyLabel?: string
  ) {
    const now = ctx.currentTime;
    const effectiveVol = Math.max(0.01, Math.min(1, volume * 0.4));

    // Musical Piano Scale: 0 -> A4, 1 -> B4, 2 -> C5, 3 -> D5, 4 -> E5, 5 -> F5, 6 -> G5, 7 -> A5, 8 -> B5, 9 -> C6
    const PIANO_NOTE_MAP: Record<string, number> = {
      '0': 440.00, // A4
      '1': 493.88, // B4
      '2': 523.25, // C5
      '3': 587.33, // D5
      '4': 659.25, // E5
      '5': 698.46, // F5
      '6': 783.99, // G5
      '7': 880.00, // A5
      '8': 987.77, // B5
      '9': 1046.50, // C6
      '.': 1174.66, // D6
    };

    const playTone = (freq: number, duration: number, volFactor: number = 1.0, startDelay: number = 0) => {
      const t = now + startDelay;
      // Fundamental oscillator
      const osc1 = ctx.createOscillator();
      // Overtone harmonic oscillator for rich grand piano timbre
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, t);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, t);

      const toneVol = effectiveVol * volFactor;
      gain.gain.setValueAtTime(toneVol, t);
      // Piano hammer attack + natural decay
      gain.gain.exponentialRampToValueAtTime(toneVol * 0.6, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + duration);
      osc2.stop(t + duration);
    };

    if (type === 'equal') {
      // Grand Piano Triumphant Resolution Chord (C5 - G5 - C6 arpeggio)
      playTone(523.25, 0.45, 0.7, 0);
      playTone(783.99, 0.50, 0.65, 0.04);
      playTone(1046.50, 0.60, 0.8, 0.08);
      return;
    }

    if (type === 'clear') {
      // Deep bass release chord (A2 + E3)
      playTone(110.0, 0.25, 0.6, 0);
      playTone(164.81, 0.25, 0.5, 0.02);
      return;
    }

    if (type === 'op') {
      // Harmonious intervals for operators
      if (keyLabel === '+' || keyLabel === 'add') {
        playTone(523.25, 0.22, 0.6); // C5
        playTone(659.25, 0.22, 0.5); // E5 Major 3rd
      } else if (keyLabel === '-' || keyLabel === 'sub') {
        playTone(587.33, 0.22, 0.6); // D5
        playTone(698.46, 0.22, 0.5); // F5 Minor 3rd
      } else if (keyLabel === '×' || keyLabel === '*' || keyLabel === 'mul') {
        playTone(659.25, 0.22, 0.6); // E5
        playTone(783.99, 0.22, 0.5); // G5 Minor 3rd
      } else {
        playTone(523.25, 0.22, 0.55); // C5
        playTone(783.99, 0.22, 0.55); // G5 Perfect 5th
      }
      return;
    }

    // Numbers 0 through 9 mapped A4 through C6
    if (keyLabel && PIANO_NOTE_MAP[keyLabel]) {
      const targetFreq = PIANO_NOTE_MAP[keyLabel];
      playTone(targetFreq, 0.28, 0.75);
      return;
    }

    // Default piano note if key label unspecified
    playTone(523.25, 0.22, 0.65);
  }

  // Celebratory Chime Arpeggio
  playVictoryChime(volume: number = 0.25) {
    if (this.muted || volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime + idx * 0.07;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(
          Math.max(0.01, Math.min(1, volume * 0.35)),
          now + 0.015
        );
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch {
      // Audio fallback
    }
  }

  vibrate(duration: number | number[] = 15) {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(duration);
      } catch {
        // Vibration not supported or blocked
      }
    }
  }
}

export const soundFX = new SoundFX();
