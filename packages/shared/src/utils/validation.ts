import { GameSettings, Session, Trial } from '../types';

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, with at least one letter and one number
  return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

export function validateGameSettings(settings: Partial<GameSettings>): boolean {
  if (settings.mode && !['dual', 'quad', 'penta'].includes(settings.mode)) {
    return false;
  }
  
  if (settings.stimulusDuration && (settings.stimulusDuration < 100 || settings.stimulusDuration > 5000)) {
    return false;
  }
  
  if (settings.interstimulusInterval && (settings.interstimulusInterval < 100 || settings.interstimulusInterval > 5000)) {
    return false;
  }
  
  if (settings.initialN && (settings.initialN < 1 || settings.initialN > 10)) {
    return false;
  }
  
  return true;
}

export function validateSession(session: Session): boolean {
  if (!session.sessionId || !session.startedAt) {
    return false;
  }
  
  if (!Array.isArray(session.trials)) {
    return false;
  }
  
  return session.trials.every(validateTrial);
}

export function validateTrial(trial: Trial): boolean {
  if (!trial.trialId || !trial.stream || typeof trial.n !== 'number' || !trial.stimulus) {
    return false;
  }
  
  if (trial.n < 1 || trial.n > 10) {
    return false;
  }
  
  if (!['position', 'color', 'shape', 'tone', 'letter'].includes(trial.stream)) {
    return false;
  }
  
  return true;
}

export function sanitizeString(str: string): string {
  return str.replace(/[<>\"'&]/g, '');
}

export function validateSessionId(sessionId: string): boolean {
  // UUID v4 format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
}