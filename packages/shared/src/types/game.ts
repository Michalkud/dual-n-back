export type StreamType = 'position' | 'color' | 'shape' | 'tone' | 'letter';

export interface Stimulus {
  id: string;
  type: StreamType;
  value: number | string;
  timestamp: number;
}

export interface Trial {
  trialId: string;
  stream: StreamType;
  n: number;
  stimulus: Stimulus;
  timestamp: number;
  userAction?: {
    reacted: boolean;
    correct: boolean;
    reactionTime?: number;
  };
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  currentN: number;
  currentTrial: number;
  score: number;
  streak: number;
  accuracy: number;
  session: Session;
}

export interface Session {
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  trials: Trial[];
  settingsSnapshot: GameSettings;
  summary?: SessionSummary;
}

export interface SessionSummary {
  totalTrials: number;
  correctResponses: number;
  falseAlarms: number;
  misses: number;
  accuracy: number;
  averageReactionTime: number;
  maxN: number;
  finalScore: number;
}

export interface GameSettings {
  mode: 'dual' | 'quad' | 'penta';
  activeStreams: StreamType[];
  stimulusDuration: number;
  interstimulusInterval: number;
  initialN: number;
  adaptiveThreshold: {
    increaseAccuracy: number;
    decreaseAccuracy: number;
    evaluationWindow: number;
  };
  audio: {
    enabled: boolean;
    volume: number;
    spatialAudio: boolean;
  };
  visual: {
    theme: 'light' | 'dark';
    colorblindMode: boolean;
    highContrast: boolean;
  };
  accessibility: {
    screenReader: boolean;
    keyboardOnly: boolean;
    reducedMotion: boolean;
  };
}

export interface GameConfig {
  performance: {
    targetFPS: number;
    maxFrameTime: number;
    maxMemoryUsage: number;
  };
  audio: {
    maxLatency: number;
    bufferSize: number;
  };
  visual: {
    gridSize: number;
    colorPalette: string[];
    shapes: string[];
  };
  stimuli: {
    toneFrequencies: number[];
    letterSet: string[];
  };
}