// Web Audio synthesizer for tactile game-show sound effects
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('quizclash_muted') === 'true';
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('quizclash_muted', this.muted);
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // AudioContext might be blocked before first user gesture
    }
  }

  playClick() {
    this.playTone(600, 'triangle', 0.05, 0.08);
  }

  playCorrect() {
    if (this.muted) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.18, 0.12), i * 70);
      });
    } catch {}
  }

  playWrong() {
    if (this.muted) return;
    try {
      this.init();
      [300, 220].forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'sawtooth', 0.25, 0.08), i * 120);
      });
    } catch {}
  }

  playTick() {
    this.playTone(880, 'sine', 0.04, 0.03);
  }

  playFreeze() {
    if (this.muted) return;
    try {
      this.init();
      [800, 600, 400, 200].forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'square', 0.1, 0.05), i * 60);
      });
    } catch {}
  }

  playFanfare() {
    if (this.muted) return;
    try {
      this.init();
      [523.25, 523.25, 523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const delay = i < 3 ? i * 100 : 300 + (i - 3) * 150;
        setTimeout(() => this.playTone(freq, 'triangle', 0.3, 0.15), delay);
      });
    } catch {}
  }
}

export const sounds = new SoundEngine();
