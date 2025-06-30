import { z } from 'zod';

// Game Modes
export enum Mode {
  DUAL = 'DUAL',
  QUAD = 'QUAD',
  PENTA = 'PENTA'
}

// Stimulus Stream Types
export enum StreamType {
  VISUAL_POSITION = 'visualPosition',
  AUDIO_LETTER = 'audioLetter',
  COLOR_BLINK = 'colorBlink',
  PITCH_TONE = 'pitchTone',
  SHAPE = 'shape'
}

// Game Configuration
export interface GameConfig {
  mode: Mode;
  nLevel: number;
  speed: number; // ISI in seconds, 1.5-3.5
  streams: StreamType[];
}

// Stimulus Packet (from spec section 10)
export interface StimulusPacket {
  index: number;
  visualPos: number; // 0-8 (3x3 grid)
  audioLetter: string; // consonant
  color: string; // hex color
  pitchHz?: number; // frequency when in Quad/Penta
  shape?: string; // shape when in Penta
  timestamp?: number; // When stimulus should be presented
}

// User Response
export interface UserResponse {
  streamType: StreamType;
  isMatch: boolean;
  reactionTimeMs: number;
  timestamp: number;
  trialIndex: number; // Which trial this response is for
}

// Trial Data
export interface Trial {
  id: string;
  sessionId: string;
  index: number;
  nLevel: number;
  
  // Visual Position Stream
  isMatchPos: boolean;
  correctPos: boolean;
  reactionPosMs: number;
  
  // Audio Letter Stream
  isMatchLet: boolean;
  correctLet: boolean;
  reactionLetMs: number;
  
  // Color Blink Stream (Quad/Penta)
  isMatchColor?: boolean;
  correctColor?: boolean;
  reactionColorMs?: number;
  
  // Pitch Tone Stream (Quad/Penta)
  isMatchPitch?: boolean;
  correctPitch?: boolean;
  reactionPitchMs?: number;
  
  // Shape Stream (Penta only)
  isMatchShape?: boolean;
  correctShape?: boolean;
  reactionShapeMs?: number;
}

// Session Data
export interface Session {
  id: string;
  userId?: string;
  mode: Mode;
  nStart: number;
  nEnd: number;
  startTime: Date;
  endTime: Date;
  trials: Trial[];
}

// User Data
export interface User {
  id: string;
  email: string;
  password: string;
  sessions: Session[];
  createdAt: Date;
}

// Progress Statistics
export interface ProgressData {
  date: string;
  mode: Mode;
  n: number;
  accuracy: number;
}

// WebSocket Events
export enum WSEvent {
  STIMULUS = 'stimulus',
  USER_RESPONSE = 'userResponse',
  SCORE_UPDATE = 'scoreUpdate',
  BLOCK_END = 'blockEnd',
  SESSION_START = 'sessionStart',
  SESSION_END = 'sessionEnd'
}

// WebSocket Message Types
export interface WSMessage {
  event: WSEvent;
  data: any;
  timestamp: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Validation Schemas using Zod
export const GameConfigSchema = z.object({
  mode: z.nativeEnum(Mode),
  nLevel: z.number().min(1).max(10),
  speed: z.number().min(1.5).max(3.5),
  streams: z.array(z.nativeEnum(StreamType))
});

export const StimulusPacketSchema = z.object({
  index: z.number(),
  visualPos: z.number().min(0).max(8),
  audioLetter: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  pitchHz: z.number().optional(),
  shape: z.string().optional()
});

export const UserResponseSchema = z.object({
  streamType: z.nativeEnum(StreamType),
  isMatch: z.boolean(),
  reactionTimeMs: z.number().min(0),
  timestamp: z.number(),
  trialIndex: z.number()
});

// Constants
export const CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z'];

export const SHAPES = ['▲', '■', '●', '◆', '★', '✚', '⬟', '⬣'];

export const COLORS = [
  '#f4e842', // Yellow
  '#e842f4', // Magenta
  '#42f4e8', // Cyan
  '#f44242', // Red
  '#42f442', // Green
  '#4242f4', // Blue
  '#f4a542', // Orange
  '#a542f4'  // Purple
];

// Musical notes (C4-C5, 8 notes)
export const PITCH_FREQUENCIES = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  349.23, // F4
  392.00, // G4
  440.00, // A4
  493.88, // B4
  523.25  // C5
];

// Game Settings
export const DEFAULT_BLOCK_SIZE = 20;
export const DEFAULT_ISI = 2.5; // seconds
export const MIN_ISI = 1.5;
export const MAX_ISI = 3.5;
export const PROMOTION_THRESHOLD = 0.8; // 80%
export const DEMOTION_THRESHOLD = 0.6; // 60% 