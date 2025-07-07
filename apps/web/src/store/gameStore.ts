import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';
import { 
  Mode, 
  StreamType, 
  StimulusPacket, 
  UserResponse, 
  WSEvent, 
  WSMessage 
} from '@dual-n-back/shared';

export interface GameSession {
  id: string;
  mode: Mode;
  nLevel: number;
  currentTrial: number;
  totalTrials: number;
  isActive: boolean;
  isPaused: boolean;
  startTime: number;
}

export interface GameStats {
  visual: number;
  audio: number;
  combined: number;
}

export interface GameState {
  // Connection state
  socket: Socket | null;
  isConnected: boolean;
  
  // Game session
  session: GameSession | null;
  
  // Current stimulus
  currentStimulus: StimulusPacket | null;
  stimulusStartTime: number;
  
  // Game configuration
  nLevel: number;
  mode: Mode;
  
  // Performance tracking
  accuracy: GameStats;
  recentResponses: UserResponse[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  feedbackMessage: string | null;
  
  // Game grid state (for visual position)
  gridHighlight: number | null; // Position 0-8 or null
  
  // Audio state
  isPlayingAudio: boolean;
  currentAudioLetter: string | null;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  startGame: (config: { mode: Mode; nLevel: number }) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  submitResponse: (streamType: StreamType, isMatch: boolean) => void;
  clearError: () => void;
  clearFeedback: () => void;
  setGridHighlight: (position: number | null) => void;
  setAudioState: (isPlaying: boolean, letter?: string) => void;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    socket: null,
    isConnected: false,
    session: null,
    currentStimulus: null,
    stimulusStartTime: 0,
    nLevel: 2,
    mode: Mode.DUAL,
    accuracy: { visual: 0, audio: 0, combined: 0 },
    recentResponses: [],
    isLoading: false,
    error: null,
    feedbackMessage: null,
    gridHighlight: null,
    isPlayingAudio: false,
    currentAudioLetter: null,

    // Actions
    connect: () => {
      const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      socket.on('connect', () => {
        console.log('Connected to server:', socket.id);
        set({ isConnected: true, error: null });
      });

      socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        set({ 
          isConnected: false, 
          session: null,
          currentStimulus: null,
          gridHighlight: null,
          isPlayingAudio: false,
          currentAudioLetter: null
        });
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        set({ 
          error: `Connection failed: ${error.message}`,
          isConnected: false 
        });
      });

      // Handle WebSocket messages
      socket.on('message', (message: WSMessage) => {
        const state = get();
        
        switch (message.event) {
          case WSEvent.SESSION_START:
            set({
              session: {
                id: message.data.sessionId,
                mode: message.data.config.mode,
                nLevel: message.data.config.nLevel,
                currentTrial: 0,
                totalTrials: message.data.totalTrials,
                isActive: true,
                isPaused: false,
                startTime: Date.now()
              },
              isLoading: false,
              error: null,
              feedbackMessage: 'Game started! Get ready...'
            });
            break;

          case WSEvent.STIMULUS:
            const stimulus = message.data as StimulusPacket;
            set({
              currentStimulus: stimulus,
              stimulusStartTime: Date.now(),
              gridHighlight: stimulus.visualPos,
              currentAudioLetter: stimulus.audioLetter,
              isPlayingAudio: true
            });
            
            // Play audio for the letter
            state.setAudioState(true, stimulus.audioLetter);
            
            // Clear visual highlight after a short duration
            setTimeout(() => {
              set({ gridHighlight: null });
            }, 500);
            
            // Stop audio playing state after duration
            setTimeout(() => {
              set({ isPlayingAudio: false });
            }, 400);
            break;

          case WSEvent.SCORE_UPDATE:
            set({
              accuracy: message.data.accuracy,
              session: state.session ? {
                ...state.session,
                currentTrial: message.data.trial
              } : null
            });
            break;

          case WSEvent.BLOCK_END:
            set({
              accuracy: message.data.accuracy,
              feedbackMessage: `Block completed! Visual: ${(message.data.accuracy.visual * 100).toFixed(1)}%, Audio: ${(message.data.accuracy.audio * 100).toFixed(1)}%`,
              session: state.session ? {
                ...state.session,
                isActive: false
              } : null
            });
            break;

          case WSEvent.SESSION_END:
            set({
              session: null,
              currentStimulus: null,
              gridHighlight: null,
              isPlayingAudio: false,
              currentAudioLetter: null,
              feedbackMessage: message.data.accuracy ? 
                `Session complete! Final accuracy: ${(message.data.accuracy.combined * 100).toFixed(1)}%` :
                'Session ended'
            });
            break;

          default:
            console.warn('Unknown WebSocket event:', message.event);
        }
      });

      set({ socket });
    },

    disconnect: () => {
      const { socket } = get();
      if (socket) {
        socket.disconnect();
        set({ 
          socket: null, 
          isConnected: false, 
          session: null,
          currentStimulus: null,
          gridHighlight: null,
          isPlayingAudio: false,
          currentAudioLetter: null
        });
      }
    },

    startGame: (config: { mode: Mode; nLevel: number }) => {
      const { socket } = get();
      if (!socket || !socket.connected) {
        set({ error: 'Not connected to server' });
        return;
      }

      set({ 
        isLoading: true, 
        error: null, 
        mode: config.mode, 
        nLevel: config.nLevel,
        recentResponses: [],
        accuracy: { visual: 0, audio: 0, combined: 0 }
      });

      socket.emit('startGame', config);
    },

    pauseGame: () => {
      const { socket, session } = get();
      if (!socket || !session) return;

      socket.emit('pauseGame');
      set({
        session: session ? { ...session, isPaused: true } : null,
        feedbackMessage: 'Game paused'
      });
    },

    resumeGame: () => {
      const { socket, session } = get();
      if (!socket || !session) return;

      socket.emit('resumeGame');
      set({
        session: session ? { ...session, isPaused: false } : null,
        feedbackMessage: 'Game resumed'
      });
    },

    endGame: () => {
      const { socket } = get();
      if (!socket) return;

      socket.emit('endGame');
      set({
        feedbackMessage: 'Ending game...'
      });
    },

    submitResponse: (streamType: StreamType, isMatch: boolean) => {
      const { socket, session, stimulusStartTime, currentStimulus } = get();
      if (!socket || !session || !currentStimulus) return;

      const reactionTime = Date.now() - stimulusStartTime;
      
      const response: UserResponse = {
        streamType,
        isMatch,
        reactionTimeMs: reactionTime,
        timestamp: Date.now(),
        trialIndex: currentStimulus.index
      };

      // Add to recent responses for local tracking
      set(state => ({
        recentResponses: [...state.recentResponses.slice(-19), response] // Keep last 20
      }));

      // Send to server
      socket.emit('userResponse', response);

      // Provide immediate feedback
      const feedbackType = streamType === StreamType.VISUAL_POSITION ? 'Visual' : 'Audio';
      const responseText = isMatch ? 'Match' : 'No match';
      set({ 
        feedbackMessage: `${feedbackType}: ${responseText} (${reactionTime}ms)` 
      });

      // Clear feedback after 1 second
      setTimeout(() => {
        set({ feedbackMessage: null });
      }, 1000);
    },

    clearError: () => set({ error: null }),
    clearFeedback: () => set({ feedbackMessage: null }),
    
    setGridHighlight: (position: number | null) => {
      set({ gridHighlight: position });
    },

    setAudioState: (isPlaying: boolean, letter?: string) => {
      set({ 
        isPlayingAudio: isPlaying,
        currentAudioLetter: letter || null
      });
    }
  }))
);

// Subscribe to session changes for logging
useGameStore.subscribe(
  (state) => state.session,
  (session, previousSession) => {
    if (session && !previousSession) {
      console.log('Game session started:', session);
    } else if (!session && previousSession) {
      console.log('Game session ended:', previousSession);
    }
  }
);

// Subscribe to stimulus changes for debugging
useGameStore.subscribe(
  (state) => state.currentStimulus,
  (stimulus) => {
    if (stimulus) {
      console.log('New stimulus:', stimulus);
    }
  }
); 