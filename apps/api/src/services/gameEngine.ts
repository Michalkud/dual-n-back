import { 
  Mode, 
  GameConfig, 
  StimulusPacket, 
  UserResponse, 
  Trial, 
  Session,
  StreamType,
  getRandomPosition,
  getRandomConsonant,
  DEFAULT_BLOCK_SIZE,
  DEFAULT_ISI,
  PROMOTION_THRESHOLD,
  DEMOTION_THRESHOLD
} from '@dual-n-back/shared';
import { generateUUID } from '@dual-n-back/shared';
import { logger } from '../utils/logger';

export interface GameEngineConfig {
  mode: Mode;
  nLevel: number;
  blockSize: number;
  isi: number; // Inter-stimulus interval in seconds
}

export interface GameSession {
  id: string;
  config: GameEngineConfig;
  stimuli: StimulusPacket[];
  responses: UserResponse[];
  currentTrial: number;
  isActive: boolean;
  startTime: number;
  endTime?: number;
}

export class GameEngine {
  private sessions: Map<string, GameSession> = new Map();

  /**
   * Create a new game session
   */
  createSession(config: GameEngineConfig): GameSession {
    const sessionId = generateUUID();
    const stimuli = this.generateStimuliSequence(config);
    
    const session: GameSession = {
      id: sessionId,
      config,
      stimuli,
      responses: [],
      currentTrial: 0,
      isActive: true,
      startTime: Date.now()
    };

    this.sessions.set(sessionId, session);
    logger.info(`Created game session ${sessionId} with config:`, config);
    
    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): GameSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Process user response for a trial
   */
  processResponse(sessionId: string, response: UserResponse): {
    success: boolean;
    accuracy?: { visual: number; audio: number; combined: number };
    isSessionComplete?: boolean;
    nextStimulus?: StimulusPacket;
    error?: string;
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (!session.isActive) {
      return { success: false, error: 'Session is not active' };
    }

    // Add response to session
    session.responses.push(response);
    session.currentTrial++;

    logger.debug(`Processed response for session ${sessionId}, trial ${session.currentTrial}:`, response);

    // Check if session is complete
    if (session.currentTrial >= session.config.blockSize) {
      session.isActive = false;
      session.endTime = Date.now();
      
      const accuracy = this.calculateAccuracy(session);
      logger.info(`Session ${sessionId} completed with accuracy:`, accuracy);
      
      return {
        success: true,
        accuracy,
        isSessionComplete: true
      };
    }

    // Get next stimulus
    const nextStimulus = session.stimuli[session.currentTrial];
    const accuracy = this.calculateAccuracy(session);

    return {
      success: true,
      accuracy,
      nextStimulus,
      isSessionComplete: false
    };
  }

  /**
   * End a session manually
   */
  endSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.isActive = false;
    session.endTime = Date.now();
    logger.info(`Session ${sessionId} ended manually`);
    
    return true;
  }

  /**
   * Generate stimulus sequence for the session
   */
  private generateStimuliSequence(config: GameEngineConfig): StimulusPacket[] {
    const { blockSize, nLevel } = config;
    const stimuli: StimulusPacket[] = [];

    // Generate base sequences
    const visualSequence: number[] = [];
    const audioSequence: string[] = [];

    // Generate random sequences
    for (let i = 0; i < blockSize; i++) {
      visualSequence.push(getRandomPosition());
      audioSequence.push(getRandomConsonant());
    }

    // Inject matches based on n-level
    this.injectMatches(visualSequence, nLevel);
    this.injectMatches(audioSequence, nLevel);

    // Create stimulus packets
    for (let i = 0; i < blockSize; i++) {
      stimuli.push({
        index: i,
        visualPos: visualSequence[i],
        audioLetter: audioSequence[i],
        color: '#3B82F6', // Blue color for visual stimulus
        timestamp: Date.now() + (i * config.isi * 1000)
      });
    }

    logger.debug(`Generated ${blockSize} stimuli for n-level ${nLevel}`);
    return stimuli;
  }

  /**
   * Inject n-back matches into a sequence
   */
  private injectMatches<T>(sequence: T[], nLevel: number): void {
    const matchProbability = 0.3; // 30% chance of match
    
    for (let i = nLevel; i < sequence.length; i++) {
      if (Math.random() < matchProbability) {
        sequence[i] = sequence[i - nLevel];
      }
    }
  }

  /**
   * Calculate accuracy for current session
   */
  private calculateAccuracy(session: GameSession): { visual: number; audio: number; combined: number } {
    const { stimuli, responses, config } = session;
    const { nLevel } = config;

    let visualCorrect = 0;
    let audioCorrect = 0;
    let totalTrials = 0;

    // Analyze responses that can be evaluated (from n-level onwards)
    for (let i = nLevel; i < Math.min(responses.length, stimuli.length); i++) {
      const currentStimulus = stimuli[i];
      const previousStimulus = stimuli[i - nLevel];
      const response = responses.find(r => (r as any).trialIndex === i);

      if (!response) continue;

      totalTrials++;

      // Check visual match accuracy
      const isVisualMatch = currentStimulus.visualPos === previousStimulus.visualPos;
      const visualResponseCorrect = response.streamType === StreamType.POSITION ? 
        response.isMatch === isVisualMatch : 
        !isVisualMatch; // No response when no match is also correct

      if (visualResponseCorrect) visualCorrect++;

      // Check audio match accuracy  
      const isAudioMatch = currentStimulus.audioLetter === previousStimulus.audioLetter;
      const audioResponseCorrect = response.streamType === StreamType.LETTER ?
        response.isMatch === isAudioMatch :
        !isAudioMatch; // No response when no match is also correct

      if (audioResponseCorrect) audioCorrect++;
    }

    const visualAccuracy = totalTrials > 0 ? visualCorrect / totalTrials : 0;
    const audioAccuracy = totalTrials > 0 ? audioCorrect / totalTrials : 0;
    const combinedAccuracy = (visualAccuracy + audioAccuracy) / 2;

    return {
      visual: Math.round(visualAccuracy * 100) / 100,
      audio: Math.round(audioAccuracy * 100) / 100,
      combined: Math.round(combinedAccuracy * 100) / 100
    };
  }

  /**
   * Determine if n-level should be adjusted based on accuracy
   */
  suggestNLevelAdjustment(accuracy: { visual: number; audio: number; combined: number }): {
    action: 'promote' | 'demote' | 'maintain';
    newLevel?: number;
  } {
    const { visual, audio, combined } = accuracy;

    // Check for promotion (both streams above threshold)
    if (visual >= PROMOTION_THRESHOLD && audio >= PROMOTION_THRESHOLD) {
      return { action: 'promote' };
    }

    // Check for demotion (either stream below threshold)
    if (visual < DEMOTION_THRESHOLD || audio < DEMOTION_THRESHOLD) {
      return { action: 'demote' };
    }

    return { action: 'maintain' };
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId: string): {
    totalSessions: number;
    activeSessions: number;
    session?: {
      id: string;
      duration: number;
      trialsCompleted: number;
      accuracy: { visual: number; audio: number; combined: number };
    };
  } {
    const stats = {
      totalSessions: this.sessions.size,
      activeSessions: Array.from(this.sessions.values()).filter(s => s.isActive).length
    };

    const session = this.sessions.get(sessionId);
    if (session) {
      const duration = (session.endTime || Date.now()) - session.startTime;
      const accuracy = this.calculateAccuracy(session);

      return {
        ...stats,
        session: {
          id: session.id,
          duration,
          trialsCompleted: session.currentTrial,
          accuracy
        }
      };
    }

    return stats;
  }

  /**
   * Clean up old sessions (call periodically)
   */
  cleanupSessions(maxAge: number = 24 * 60 * 60 * 1000): number { // Default: 24 hours
    const cutoff = Date.now() - maxAge;
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const sessionAge = (session.endTime || Date.now()) - session.startTime;
      if (!session.isActive && session.startTime < cutoff) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} old game sessions`);
    }

    return cleaned;
  }
}

// Singleton instance
export const gameEngine = new GameEngine();

// Clean up sessions every hour
setInterval(() => {
  gameEngine.cleanupSessions();
}, 60 * 60 * 1000); 