import { StreamType } from '../types';

export const GAME_MODES = {
  dual: ['position', 'letter'] as StreamType[],
  quad: ['position', 'letter', 'color', 'tone'] as StreamType[],
  penta: ['position', 'letter', 'color', 'tone', 'shape'] as StreamType[],
} as const;

export const DEFAULT_SETTINGS = {
  mode: 'dual' as const,
  stimulusDuration: 1000, // 1 second
  interstimulusInterval: 1000, // 1 second
  initialN: 2,
  adaptiveThreshold: {
    increaseAccuracy: 0.8, // 80% accuracy to increase N
    decreaseAccuracy: 0.6, // <60% accuracy to decrease N
    evaluationWindow: 20, // evaluate over last 20 trials
  },
  audio: {
    enabled: true,
    volume: 0.7,
    spatialAudio: false,
  },
  visual: {
    theme: 'light' as const,
    colorblindMode: false,
    highContrast: false,
  },
  accessibility: {
    screenReader: false,
    keyboardOnly: false,
    reducedMotion: false,
  },
};

export const PERFORMANCE_TARGETS = {
  targetFPS: 60,
  maxFrameTime: 16.67, // milliseconds
  maxMemoryUsage: 200, // MB on desktop
  maxMemoryUsageMobile: 120, // MB on mobile
  maxAudioLatency: 30, // milliseconds
};

export const VISUAL_CONFIG = {
  gridSize: 3,
  colorPalette: [
    '#E53E3E', // Red
    '#3182CE', // Blue
    '#38A169', // Green
    '#D69E2E', // Yellow
    '#805AD5', // Purple
    '#DD6B20', // Orange
    '#319795', // Teal
    '#E53E3E', // Pink
    '#4A5568', // Gray
  ],
  shapes: [
    'circle',
    'square',
    'triangle',
    'star',
    'hexagon',
    'pentagon',
    'heart',
    'diamond',
    'cross',
  ],
};

export const CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z'];

// Game flow constants
export const DEFAULT_BLOCK_SIZE = 20;
export const DEFAULT_ISI = 2.5; // Inter-stimulus interval in seconds
export const PROMOTION_THRESHOLD = 0.8; // 80% accuracy to increase N
export const DEMOTION_THRESHOLD = 0.5; // 50% accuracy to decrease N

export const AUDIO_CONFIG = {
  // MIDI note frequencies (C4 to D#5)
  toneFrequencies: [
    261.63, // C4
    277.18, // C#4
    293.66, // D4
    311.13, // D#4
    329.63, // E4
    349.23, // F4
    369.99, // F#4
    392.00, // G4
    415.30, // G#4
  ],
  // NATO alphabet
  letterSet: [
    'alpha',
    'bravo',
    'charlie',
    'delta',
    'echo',
    'foxtrot',
    'golf',
    'hotel',
    'india',
  ],
  bufferSize: 256,
};

export const INPUT_KEYS = {
  position: 'KeyV', // V for Visual
  letter: 'KeyA', // A for Audio
  color: 'KeyC', // C for Color
  tone: 'KeyP', // P for Pitch
  shape: 'KeyS', // S for Shape
} as const;

export const SCORING = {
  correct: 1,
  falseAlarm: -1,
  miss: 0,
  streakMultiplier: 0.1, // 10% bonus per streak
  maxStreakMultiplier: 2.0, // maximum 200% bonus
};

export const API_ENDPOINTS = {
  auth: {
    register: '/api/v1/auth/register',
    login: '/api/v1/auth/login',
    refresh: '/api/v1/auth/refresh',
    logout: '/api/v1/auth/logout',
  },
  sessions: {
    sync: '/api/v1/sessions',
    list: '/api/v1/sessions',
    export: '/api/v1/sessions/export',
  },
  user: {
    profile: '/api/v1/user/profile',
    preferences: '/api/v1/user/preferences',
  },
} as const;