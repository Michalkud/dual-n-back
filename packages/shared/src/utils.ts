import { Mode, StreamType, CONSONANTS, SHAPES, COLORS, PITCH_FREQUENCIES } from './types';

/**
 * Get the streams for a given mode
 */
export function getStreamsForMode(mode: Mode): StreamType[] {
  switch (mode) {
    case Mode.DUAL:
      return [StreamType.VISUAL_POSITION, StreamType.AUDIO_LETTER];
    case Mode.QUAD:
      return [StreamType.VISUAL_POSITION, StreamType.AUDIO_LETTER, StreamType.COLOR_BLINK, StreamType.PITCH_TONE];
    case Mode.PENTA:
      return [StreamType.VISUAL_POSITION, StreamType.AUDIO_LETTER, StreamType.COLOR_BLINK, StreamType.PITCH_TONE, StreamType.SHAPE];
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}

/**
 * Get a random consonant
 */
export function getRandomConsonant(): string {
  return CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];
}

/**
 * Get a random shape
 */
export function getRandomShape(): string {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)];
}

/**
 * Get a random color
 */
export function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

/**
 * Get a random pitch frequency
 */
export function getRandomPitchFrequency(): number {
  return PITCH_FREQUENCIES[Math.floor(Math.random() * PITCH_FREQUENCIES.length)];
}

/**
 * Get a random position (0-8 for 3x3 grid)
 */
export function getRandomPosition(): number {
  return Math.floor(Math.random() * 9);
}

/**
 * Calculate accuracy for a stream
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return correct / total;
}

/**
 * Check if n-level should be promoted based on accuracy
 */
export function shouldPromote(accuracies: number[], threshold: number = 0.8): boolean {
  return accuracies.every(acc => acc >= threshold);
}

/**
 * Check if n-level should be demoted based on accuracy
 */
export function shouldDemote(accuracies: number[], threshold: number = 0.6): boolean {
  return accuracies.some(acc => acc < threshold);
}

/**
 * Format time in milliseconds to readable string
 */
export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 