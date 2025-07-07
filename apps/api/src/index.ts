import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { initializeWebSocket } from './services/websocket';
import { gameEngine } from './services/gameEngine';

// Routes
import { authRoutes } from './routes/auth';
import { sessionRoutes } from './routes/sessions';
import { statsRoutes } from './routes/stats';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize WebSocket service
const wsService = initializeWebSocket(server);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws://localhost:*", "wss://localhost:*"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    websocket: {
      connectedClients: wsService.getConnectedClients(),
      activeGames: wsService.getActiveGames()
    },
    gameEngine: {
      totalSessions: gameEngine.getSessionStats('').totalSessions,
      activeSessions: gameEngine.getSessionStats('').activeSessions
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/stats', statsRoutes);

// Game Engine API endpoints
app.post('/api/game/start', (req, res) => {
  try {
    const { mode, nLevel, blockSize, isi } = req.body;
    
    const session = gameEngine.createSession({
      mode,
      nLevel: nLevel || 2,
      blockSize: blockSize || 20,
      isi: isi || 2.5
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        config: session.config,
        totalTrials: session.stimuli.length
      }
    });
  } catch (error) {
    logger.error('Failed to start game session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start game session'
    });
  }
});

app.get('/api/game/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = gameEngine.getSession(sessionId);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  const stats = gameEngine.getSessionStats(sessionId);
  
  res.json({
    success: true,
    data: {
      session: {
        id: session.id,
        config: session.config,
        currentTrial: session.currentTrial,
        isActive: session.isActive,
        totalTrials: session.stimuli.length
      },
      stats: stats.session
    }
  });
});

app.post('/api/game/session/:sessionId/end', (req, res) => {
  const { sessionId } = req.params;
  const success = gameEngine.endSession(sessionId);
  
  if (!success) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  const stats = gameEngine.getSessionStats(sessionId);
  
  res.json({
    success: true,
    data: {
      message: 'Session ended successfully',
      stats: stats.session
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Clean up game engine sessions
    gameEngine.cleanupSessions(0); // Clean all sessions
    
    logger.info('Cleanup completed, exiting process');
    process.exit(0);
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
server.listen(PORT, () => {
  logger.info(`Dual N-Back API server started on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    websocket: 'enabled',
    gameEngine: 'initialized'
  });
});

export default app; 