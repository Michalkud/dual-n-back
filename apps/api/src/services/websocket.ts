import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

export function setupWebSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Handle game session join
    socket.on('join-game', (sessionId: string) => {
      socket.join(`game-${sessionId}`);
      logger.info(`Client ${socket.id} joined game session ${sessionId}`);
    });

    // Handle user response to stimulus
    socket.on('user-response', (data) => {
      logger.debug(`User response from ${socket.id}:`, data);
      // TODO: Process user response and update game state
    });

    // Handle game start
    socket.on('start-game', (gameConfig) => {
      logger.info(`Game started by ${socket.id}:`, gameConfig);
      // TODO: Initialize game engine and start sending stimuli
    });

    // Handle game pause
    socket.on('pause-game', () => {
      logger.info(`Game paused by ${socket.id}`);
      // TODO: Pause game engine
    });

    // Handle game end
    socket.on('end-game', () => {
      logger.info(`Game ended by ${socket.id}`);
      // TODO: Stop game engine and save session data
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to Dual N-Back server',
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  logger.info('WebSocket server initialized');
} 