import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { validateSession, generateSessionSummary } from '@dual-n-back/shared';

const router = Router();

// Validation schemas
const syncSessionSchema = z.object({
  session: z.object({
    sessionId: z.string(),
    startedAt: z.string(),
    endedAt: z.string().optional(),
    trials: z.array(z.object({
      trialId: z.string(),
      stream: z.enum(['position', 'color', 'shape', 'tone', 'letter']),
      n: z.number().int().min(1).max(10),
      stimulus: z.object({
        id: z.string(),
        type: z.string(),
        value: z.union([z.string(), z.number()]),
        timestamp: z.number(),
      }),
      timestamp: z.number(),
      userAction: z.object({
        reacted: z.boolean(),
        correct: z.boolean(),
        reactionTime: z.number().optional(),
      }).optional(),
    })),
    settingsSnapshot: z.object({
      mode: z.enum(['dual', 'quad', 'penta']),
      activeStreams: z.array(z.string()),
      stimulusDuration: z.number(),
      interstimulusInterval: z.number(),
      initialN: z.number(),
      adaptiveThreshold: z.object({
        increaseAccuracy: z.number(),
        decreaseAccuracy: z.number(),
        evaluationWindow: z.number(),
      }),
      audio: z.object({
        enabled: z.boolean(),
        volume: z.number(),
        spatialAudio: z.boolean(),
      }),
      visual: z.object({
        theme: z.enum(['light', 'dark']),
        colorblindMode: z.boolean(),
        highContrast: z.boolean(),
      }),
      accessibility: z.object({
        screenReader: z.boolean(),
        keyboardOnly: z.boolean(),
        reducedMotion: z.boolean(),
      }),
    }),
  }),
});

const getSessionsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Sync session endpoint
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { session } = syncSessionSchema.parse(req.body);

    // Validate session data
    if (!validateSession(session as any)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SESSION_DATA',
          message: 'Session data validation failed',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Check if session already exists
    const existingSession = await prisma.session.findUnique({
      where: { sessionId: session.sessionId },
    });

    if (existingSession) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'SESSION_EXISTS',
          message: 'Session already synced',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generate session summary
    const summary = generateSessionSummary(session.trials as any);
    const settings = session.settingsSnapshot;

    // Create session record
    const createdSession = await prisma.session.create({
      data: {
        sessionId: session.sessionId,
        userId: req.userId || null,
        startedAt: new Date(session.startedAt),
        endedAt: session.endedAt ? new Date(session.endedAt) : null,
        mode: settings.mode,
        
        // Settings snapshot
        stimulusDuration: settings.stimulusDuration,
        interstimulusInterval: settings.interstimulusInterval,
        initialN: settings.initialN,
        adaptiveThresholdInc: settings.adaptiveThreshold.increaseAccuracy,
        adaptiveThresholdDec: settings.adaptiveThreshold.decreaseAccuracy,
        adaptiveWindow: settings.adaptiveThreshold.evaluationWindow,
        audioEnabled: settings.audio.enabled,
        audioVolume: settings.audio.volume,
        spatialAudio: settings.audio.spatialAudio,
        theme: settings.visual.theme,
        colorblindMode: settings.visual.colorblindMode,
        highContrast: settings.visual.highContrast,
        screenReader: settings.accessibility.screenReader,
        keyboardOnly: settings.accessibility.keyboardOnly,
        reducedMotion: settings.accessibility.reducedMotion,
        
        // Summary data
        totalTrials: summary.totalTrials,
        correctResponses: summary.correctResponses,
        falseAlarms: summary.falseAlarms,
        misses: summary.misses,
        accuracy: summary.accuracy,
        averageReactionTime: summary.averageReactionTime,
        maxN: summary.maxN,
        finalScore: summary.finalScore,
      },
    });

    // Create trial records
    const trialData = session.trials.map(trial => ({
      trialId: trial.trialId,
      sessionId: createdSession.id,
      stream: trial.stream,
      n: trial.n,
      stimulusType: trial.stimulus.type,
      stimulusValue: String(trial.stimulus.value),
      timestamp: new Date(trial.timestamp),
      reacted: trial.userAction?.reacted || null,
      correct: trial.userAction?.correct || null,
      reactionTime: trial.userAction?.reactionTime || null,
    }));

    await prisma.trial.createMany({
      data: trialData,
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        synced: true,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get sessions endpoint
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page, limit, startDate, endDate } = getSessionsSchema.parse(req.query);

    const offset = (page - 1) * limit;
    
    // Build where clause
    const where: any = {
      userId: req.userId,
    };

    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) where.startedAt.gte = new Date(startDate);
      if (endDate) where.startedAt.lte = new Date(endDate);
    }

    // Get sessions with trials
    const sessions = await prisma.session.findMany({
      where,
      include: {
        trials: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { startedAt: 'desc' },
      skip: offset,
      take: limit,
    });

    // Get total count
    const total = await prisma.session.count({ where });

    // Transform data to match API schema
    const transformedSessions = sessions.map(session => ({
      sessionId: session.sessionId,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt?.toISOString(),
      trials: session.trials.map(trial => ({
        trialId: trial.trialId,
        stream: trial.stream,
        n: trial.n,
        stimulus: {
          id: trial.id,
          type: trial.stimulusType,
          value: trial.stimulusValue,
          timestamp: trial.timestamp.getTime(),
        },
        timestamp: trial.timestamp.getTime(),
        userAction: trial.reacted !== null ? {
          reacted: trial.reacted,
          correct: trial.correct,
          reactionTime: trial.reactionTime,
        } : undefined,
      })),
      settingsSnapshot: {
        mode: session.mode as 'dual' | 'quad' | 'penta',
        activeStreams: [] as string[], // Will be derived from mode
        stimulusDuration: session.stimulusDuration,
        interstimulusInterval: session.interstimulusInterval,
        initialN: session.initialN,
        adaptiveThreshold: {
          increaseAccuracy: session.adaptiveThresholdInc,
          decreaseAccuracy: session.adaptiveThresholdDec,
          evaluationWindow: session.adaptiveWindow,
        },
        audio: {
          enabled: session.audioEnabled,
          volume: session.audioVolume,
          spatialAudio: session.spatialAudio,
        },
        visual: {
          theme: session.theme as 'light' | 'dark',
          colorblindMode: session.colorblindMode,
          highContrast: session.highContrast,
        },
        accessibility: {
          screenReader: session.screenReader,
          keyboardOnly: session.keyboardOnly,
          reducedMotion: session.reducedMotion,
        },
      },
      summary: {
        totalTrials: session.totalTrials || 0,
        correctResponses: session.correctResponses || 0,
        falseAlarms: session.falseAlarms || 0,
        misses: session.misses || 0,
        accuracy: session.accuracy || 0,
        averageReactionTime: session.averageReactionTime || 0,
        maxN: session.maxN || 0,
        finalScore: session.finalScore || 0,
      },
    }));

    res.json({
      success: true,
      data: {
        sessions: transformedSessions,
        pagination: {
          page,
          limit,
          total,
          hasMore: offset + limit < total,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Export sessions as CSV
router.get('/export/csv', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.userId },
      include: {
        trials: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    // Generate CSV header
    const csvHeader = [
      'Session ID',
      'Started At',
      'Ended At',
      'Mode',
      'Total Trials',
      'Accuracy',
      'Max N',
      'Final Score',
      'Trial ID',
      'Stream',
      'N',
      'Stimulus Type',
      'Stimulus Value',
      'Reacted',
      'Correct',
      'Reaction Time',
    ].join(',');

    // Generate CSV rows
    const csvRows = [];
    for (const session of sessions) {
      for (const trial of session.trials) {
        csvRows.push([
          session.sessionId,
          session.startedAt.toISOString(),
          session.endedAt?.toISOString() || '',
          session.mode,
          session.totalTrials || '',
          session.accuracy || '',
          session.maxN || '',
          session.finalScore || '',
          trial.trialId,
          trial.stream,
          trial.n,
          trial.stimulusType,
          trial.stimulusValue,
          trial.reacted || '',
          trial.correct || '',
          trial.reactionTime || '',
        ].join(','));
      }
    }

    const csv = [csvHeader, ...csvRows].join('\n');
    const filename = `dual-n-back-export-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

export { router as sessionRoutes };