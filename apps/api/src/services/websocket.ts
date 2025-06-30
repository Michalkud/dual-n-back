import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { 
  WSEvent, 
  WSMessage, 
  Mode, 
  StreamType,
  UserResponse,
  StimulusPacket,
  DEFAULT_BLOCK_SIZE,
  DEFAULT_ISI 
} from '@dual-n-back/shared';
import { gameEngine, GameEngineConfig } from './gameEngine';
import { logger } from '../utils/logger';

export interface ConnectedClient {
  id: string;
  sessionId?: string;
  isInGame: boolean;
  currentTrial: number;
}

export class WebSocketService {
  private io: Server;
  private clients: Map<string, ConnectedClient> = new Map();
  private gameTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(server: HTTPServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    logger.info('WebSocket service initialized');
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);
      
      // Register client
      this.clients.set(socket.id, {
        id: socket.id,
        isInGame: false,
        currentTrial: 0
      });

      // Handle game start
      socket.on('startGame', (config: { mode: Mode; nLevel: number }) => {
        this.handleStartGame(socket.id, config);
      });

      // Handle user responses
      socket.on('userResponse', (response: UserResponse) => {
        this.handleUserResponse(socket.id, response);
      });

      // Handle pause/resume
      socket.on('pauseGame', () => {
        this.handlePauseGame(socket.id);
      });

      socket.on('resumeGame', () => {
        this.handleResumeGame(socket.id);
      });

      // Handle game end
      socket.on('endGame', () => {
        this.handleEndGame(socket.id);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        this.handleDisconnect(socket.id);
      });
    });
  }

  private handleStartGame(clientId: string, config: { mode: Mode; nLevel: number }): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      // Create game engine configuration
      const gameConfig: GameEngineConfig = {
        mode: config.mode,
        nLevel: config.nLevel,
        blockSize: DEFAULT_BLOCK_SIZE,
        isi: DEFAULT_ISI
      };

      // Create game session
      const session = gameEngine.createSession(gameConfig);
      
      // Update client state
      client.sessionId = session.id;
      client.isInGame = true;
      client.currentTrial = 0;

      // Send session start event
      this.sendMessage(clientId, {
        event: WSEvent.SESSION_START,
        data: {
          sessionId: session.id,
          config: gameConfig,
          totalTrials: DEFAULT_BLOCK_SIZE
        },
        timestamp: Date.now()
      });

      // Start stimulus sequence
      this.startStimulusSequence(clientId, session.id);

      logger.info(`Game started for client ${clientId}, session ${session.id}`);
    } catch (error) {
      logger.error(`Failed to start game for client ${clientId}:`, error);
      this.sendMessage(clientId, {
        event: WSEvent.SESSION_END,
        data: { error: 'Failed to start game' },
        timestamp: Date.now()
      });
    }
  }

  private handleUserResponse(clientId: string, response: UserResponse): void {
    const client = this.clients.get(clientId);
    if (!client || !client.sessionId) return;

    try {
      const result = gameEngine.processResponse(client.sessionId, response);
      
      if (!result.success) {
        logger.error(`Failed to process response for client ${clientId}:`, result.error);
        return;
      }

      // Send score update
      if (result.accuracy) {
        this.sendMessage(clientId, {
          event: WSEvent.SCORE_UPDATE,
          data: {
            accuracy: result.accuracy,
            trial: client.currentTrial
          },
          timestamp: Date.now()
        });
      }

      // Check if session is complete
      if (result.isSessionComplete) {
        this.handleSessionComplete(clientId, client.sessionId, result.accuracy!);
      }

      logger.debug(`Processed response for client ${clientId}, trial ${client.currentTrial}`);
    } catch (error) {
      logger.error(`Error processing response for client ${clientId}:`, error);
    }
  }

  private handlePauseGame(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client || !client.sessionId) return;

    // Clear any running timers
    const timer = this.gameTimers.get(client.sessionId);
    if (timer) {
      clearTimeout(timer);
      this.gameTimers.delete(client.sessionId);
    }

    logger.info(`Game paused for client ${clientId}`);
  }

  private handleResumeGame(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client || !client.sessionId) return;

    // Resume stimulus sequence
    this.startStimulusSequence(clientId, client.sessionId);

    logger.info(`Game resumed for client ${clientId}`);
  }

  private handleEndGame(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client || !client.sessionId) return;

    // End the game session
    gameEngine.endSession(client.sessionId);
    
    // Clear timers
    const timer = this.gameTimers.get(client.sessionId);
    if (timer) {
      clearTimeout(timer);
      this.gameTimers.delete(client.sessionId);
    }

    // Update client state
    client.isInGame = false;
    client.sessionId = undefined;
    client.currentTrial = 0;

    // Send session end event
    this.sendMessage(clientId, {
      event: WSEvent.SESSION_END,
      data: { reason: 'Manual termination' },
      timestamp: Date.now()
    });

    logger.info(`Game ended for client ${clientId}`);
  }

  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      // End any active game session
      if (client.sessionId) {
        gameEngine.endSession(client.sessionId);
        
        // Clear timers
        const timer = this.gameTimers.get(client.sessionId);
        if (timer) {
          clearTimeout(timer);
          this.gameTimers.delete(client.sessionId);
        }
      }
      
      // Remove client from map
      this.clients.delete(clientId);
    }
  }

  private startStimulusSequence(clientId: string, sessionId: string): void {
    const session = gameEngine.getSession(sessionId);
    const client = this.clients.get(clientId);
    
    if (!session || !client) return;

    const sendNextStimulus = () => {
      if (client.currentTrial >= session.stimuli.length || !session.isActive) {
        return;
      }

      const stimulus = session.stimuli[client.currentTrial];
      
      // Send stimulus to client
      this.sendMessage(clientId, {
        event: WSEvent.STIMULUS,
        data: stimulus,
        timestamp: Date.now()
      });

      client.currentTrial++;

      // Schedule next stimulus
      if (client.currentTrial < session.stimuli.length) {
        const timer = setTimeout(sendNextStimulus, session.config.isi * 1000);
        this.gameTimers.set(sessionId, timer);
      }
    };

    // Start the sequence
    sendNextStimulus();
  }

  private handleSessionComplete(clientId: string, sessionId: string, accuracy: { visual: number; audio: number; combined: number }): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Get n-level adjustment suggestion
    const adjustment = gameEngine.suggestNLevelAdjustment(accuracy);
    
    // Send block end event
    this.sendMessage(clientId, {
      event: WSEvent.BLOCK_END,
      data: {
        accuracy,
        adjustment,
        sessionId
      },
      timestamp: Date.now()
    });

    // Update client state
    client.isInGame = false;
    client.sessionId = undefined;
    client.currentTrial = 0;

    // Send session end event
    this.sendMessage(clientId, {
      event: WSEvent.SESSION_END,
      data: { 
        reason: 'Completed successfully',
        accuracy,
        adjustment
      },
      timestamp: Date.now()
    });

    logger.info(`Session ${sessionId} completed for client ${clientId} with accuracy:`, accuracy);
  }

  private sendMessage(clientId: string, message: WSMessage): void {
    const socket = this.io.sockets.sockets.get(clientId);
    if (socket) {
      socket.emit('message', message);
    }
  }

  // Public methods for external use
  public getConnectedClients(): number {
    return this.clients.size;
  }

  public getActiveGames(): number {
    return Array.from(this.clients.values()).filter(client => client.isInGame).length;
  }

  public broadcastMessage(message: WSMessage): void {
    this.io.emit('message', message);
  }
}

let wsService: WebSocketService;

export const initializeWebSocket = (server: HTTPServer): WebSocketService => {
  wsService = new WebSocketService(server);
  return wsService;
};

export const getWebSocketService = (): WebSocketService => {
  if (!wsService) {
    throw new Error('WebSocket service not initialized');
  }
  return wsService;
}; 