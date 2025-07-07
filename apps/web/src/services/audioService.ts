import { CONSONANTS } from '@dual-n-back/shared';

export class AudioService {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private volume = 0.5;
  private letterBuffers: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.generateLetterSounds();
      this.isInitialized = true;
      console.log('Audio service initialized');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  /**
   * Generate synthetic audio for each consonant letter using Web Audio API
   */
  private async generateLetterSounds(): Promise<void> {
    if (!this.audioContext) return;

    for (const letter of CONSONANTS) {
      try {
        const buffer = await this.generateLetterSound(letter);
        this.letterBuffers.set(letter, buffer);
      } catch (error) {
        console.error(`Failed to generate sound for letter ${letter}:`, error);
      }
    }
  }

  /**
   * Generate a synthetic audio buffer for a specific letter
   * Uses different frequencies and characteristics for each consonant
   */
  private async generateLetterSound(letter: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.4; // 400ms duration
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Letter-specific frequency mappings for distinct sounds
    const letterFrequencies: { [key: string]: { fundamental: number; formants: number[] } } = {
      'B': { fundamental: 120, formants: [500, 1500, 2500] },
      'C': { fundamental: 180, formants: [800, 1800, 2800] },
      'D': { fundamental: 140, formants: [600, 1600, 2600] },
      'F': { fundamental: 200, formants: [900, 1900, 2900] },
      'G': { fundamental: 110, formants: [450, 1450, 2450] },
      'H': { fundamental: 250, formants: [1000, 2000, 3000] },
      'J': { fundamental: 160, formants: [700, 1700, 2700] },
      'K': { fundamental: 190, formants: [850, 1850, 2850] },
      'L': { fundamental: 130, formants: [550, 1550, 2550] },
      'M': { fundamental: 100, formants: [400, 1400, 2400] },
      'N': { fundamental: 150, formants: [650, 1650, 2650] },
      'P': { fundamental: 170, formants: [750, 1750, 2750] },
      'Q': { fundamental: 220, formants: [950, 1950, 2950] },
      'R': { fundamental: 120, formants: [500, 1300, 2100] },
      'S': { fundamental: 300, formants: [1200, 2400, 3600] },
      'T': { fundamental: 240, formants: [1000, 2000, 3200] },
      'V': { fundamental: 115, formants: [480, 1480, 2480] },
      'W': { fundamental: 90, formants: [350, 1000, 1800] },
      'X': { fundamental: 280, formants: [1100, 2200, 3300] },
      'Z': { fundamental: 260, formants: [1050, 2100, 3150] }
    };

    const freqData = letterFrequencies[letter] || { fundamental: 150, formants: [600, 1600, 2600] };

    // Generate the sound wave
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      // Envelope (attack-decay-sustain-release)
      let envelope = 1;
      const attackTime = 0.05;
      const decayTime = 0.1;
      const sustainLevel = 0.6;
      const releaseTime = 0.15;

      if (t < attackTime) {
        envelope = t / attackTime;
      } else if (t < attackTime + decayTime) {
        envelope = 1 - (1 - sustainLevel) * (t - attackTime) / decayTime;
      } else if (t < duration - releaseTime) {
        envelope = sustainLevel;
      } else {
        envelope = sustainLevel * (duration - t) / releaseTime;
      }

      // Add fundamental frequency
      sample += 0.4 * Math.sin(2 * Math.PI * freqData.fundamental * t);

      // Add formants for more realistic speech-like sounds
      for (let j = 0; j < freqData.formants.length; j++) {
        const formantFreq = freqData.formants[j];
        const formantAmp = 0.2 / (j + 1); // Diminishing amplitude for higher formants
        sample += formantAmp * Math.sin(2 * Math.PI * formantFreq * t);
      }

      // Add some noise for consonant characteristics
      const noiseLevel = 0.1;
      sample += noiseLevel * (Math.random() * 2 - 1);

      // Apply envelope and store
      data[i] = sample * envelope * 0.3; // Overall volume control
    }

    return buffer;
  }

  /**
   * Play a letter sound
   */
  async playLetter(letter: string): Promise<void> {
    if (!this.isInitialized || !this.audioContext || !this.letterBuffers.has(letter)) {
      console.warn(`Cannot play letter ${letter}: audio not ready`);
      return;
    }

    try {
      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const buffer = this.letterBuffers.get(letter);
      if (!buffer) return;

      // Create audio nodes
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      // Connect the nodes
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Set volume
      gainNode.gain.value = this.volume;

      // Play the sound
      source.start();

      console.log(`Playing letter: ${letter}`);
    } catch (error) {
      console.error(`Failed to play letter ${letter}:`, error);
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Check if audio is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.audioContext !== null && this.letterBuffers.size > 0;
  }

  /**
   * Initialize audio context (call this on user interaction to avoid autoplay restrictions)
   */
  async ensureInitialized(): Promise<void> {
    if (!this.isInitialized && this.audioContext?.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('Audio context resumed');
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.letterBuffers.clear();
    this.isInitialized = false;
  }
}

// Singleton instance
export const audioService = new AudioService();

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    audioService.dispose();
  });
} 