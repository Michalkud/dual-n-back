import { Session, SessionSummary } from './game';

export interface User {
  id: string;
  email: string;
  username?: string;
  createdAt: string;
  lastLoginAt?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  dataSync: boolean;
  analytics: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// API Request/Response Types
export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface SyncSessionRequest {
  session: Session;
}

export interface SyncSessionResponse {
  sessionId: string;
  synced: boolean;
  conflicts?: string[];
}

export interface GetSessionsResponse {
  sessions: Session[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ExportDataResponse {
  format: 'csv' | 'json';
  data: string;
  filename: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: {
    timestamp: string;
    version: string;
  };
}