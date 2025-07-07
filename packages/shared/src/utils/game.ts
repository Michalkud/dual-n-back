import { Trial, SessionSummary, StreamType } from '../types';
import { SCORING, CONSONANTS } from '../constants';

export function calculateAccuracy(trials: Trial[]): number {
  if (trials.length === 0) return 0;
  
  const correctTrials = trials.filter(trial => 
    trial.userAction?.correct === true
  ).length;
  
  return correctTrials / trials.length;
}

export function calculateScore(trials: Trial[]): number {
  let score = 0;
  let currentStreak = 0;
  
  for (const trial of trials) {
    if (!trial.userAction) continue;
    
    if (trial.userAction.correct) {
      score += SCORING.correct;
      currentStreak++;
      // Apply streak multiplier
      const streakBonus = Math.min(
        currentStreak * SCORING.streakMultiplier,
        SCORING.maxStreakMultiplier
      );
      score += Math.floor(streakBonus);
    } else if (trial.userAction.reacted) {
      // False alarm
      score += SCORING.falseAlarm;
      currentStreak = 0;
    } else {
      // Miss
      score += SCORING.miss;
      currentStreak = 0;
    }
  }
  
  return Math.max(0, score);
}

export function calculateStreakMultiplier(streak: number): number {
  return Math.min(
    1 + (streak * SCORING.streakMultiplier),
    SCORING.maxStreakMultiplier
  );
}

export function shouldIncreaseN(recentTrials: Trial[]): boolean {
  if (recentTrials.length < 3) return false;
  
  const lastThree = recentTrials.slice(-3);
  return lastThree.every(trial => trial.userAction?.correct === true);
}

export function shouldDecreaseN(recentTrials: Trial[], threshold: number = 0.6, windowSize: number = 20): boolean {
  if (recentTrials.length < windowSize) return false;
  
  const window = recentTrials.slice(-windowSize);
  const accuracy = calculateAccuracy(window);
  
  return accuracy < threshold;
}

export function generateSessionSummary(trials: Trial[]): SessionSummary {
  const totalTrials = trials.length;
  const correctResponses = trials.filter(t => t.userAction?.correct === true).length;
  const falseAlarms = trials.filter(t => t.userAction?.reacted === true && t.userAction?.correct === false).length;
  const misses = trials.filter(t => t.userAction?.reacted === false).length;
  
  const accuracy = calculateAccuracy(trials);
  const finalScore = calculateScore(trials);
  
  const reactedTrials = trials.filter(t => t.userAction?.reactionTime);
  const averageReactionTime = reactedTrials.length > 0 
    ? reactedTrials.reduce((sum, t) => sum + (t.userAction?.reactionTime || 0), 0) / reactedTrials.length
    : 0;
  
  const maxN = Math.max(...trials.map(t => t.n), 0);
  
  return {
    totalTrials,
    correctResponses,
    falseAlarms,
    misses,
    accuracy,
    averageReactionTime,
    maxN,
    finalScore,
  };
}

export function generateTrialId(): string {
  return `trial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function isNBackMatch(currentStimulus: any, previousStimuli: any[], n: number): boolean {
  if (previousStimuli.length < n) return false;
  
  const targetStimulus = previousStimuli[previousStimuli.length - n];
  return currentStimulus.value === targetStimulus.value;
}

export function getActiveStreams(mode: 'dual' | 'quad' | 'penta'): StreamType[] {
  switch (mode) {
    case 'dual':
      return [StreamType.POSITION, StreamType.LETTER];
    case 'quad':
      return [StreamType.POSITION, StreamType.LETTER, StreamType.COLOR, StreamType.TONE];
    case 'penta':
      return [StreamType.POSITION, StreamType.LETTER, StreamType.COLOR, StreamType.TONE, StreamType.SHAPE];
    default:
      return [StreamType.POSITION, StreamType.LETTER];
  }
}

export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
}

export function formatAccuracy(accuracy: number): string {
  return `${Math.round(accuracy * 100)}%`;
}

export function getRandomPosition(): number {
  return Math.floor(Math.random() * 9); // 0-8 for 3x3 grid
}

export function getRandomConsonant(): string {
  const index = Math.floor(Math.random() * CONSONANTS.length);
  return CONSONANTS[index];
}

export function generateUUID(): string {
  // Simple UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}