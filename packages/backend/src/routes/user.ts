import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Validation schemas
const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.boolean().optional(),
  dataSync: z.boolean().optional(),
  analytics: z.boolean().optional(),
});

// Get user profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        lastLoginAt: true,
        theme: true,
        notifications: true,
        dataSync: true,
        analytics: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          preferences: {
            theme: user.theme,
            notifications: user.notifications,
            dataSync: user.dataSync,
            analytics: user.analytics,
          },
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

// Update user preferences
router.patch('/preferences', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const preferences = updatePreferencesSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: preferences,
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        lastLoginAt: true,
        theme: true,
        notifications: true,
        dataSync: true,
        analytics: true,
      },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          createdAt: updatedUser.createdAt,
          lastLoginAt: updatedUser.lastLoginAt,
          preferences: {
            theme: updatedUser.theme,
            notifications: updatedUser.notifications,
            dataSync: updatedUser.dataSync,
            analytics: updatedUser.analytics,
          },
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

// Get user statistics
router.get('/stats', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const stats = await prisma.session.aggregate({
      where: { userId: req.userId },
      _count: { id: true },
      _avg: {
        accuracy: true,
        maxN: true,
        finalScore: true,
        averageReactionTime: true,
      },
      _max: {
        maxN: true,
        finalScore: true,
      },
      _sum: {
        totalTrials: true,
      },
    });

    const firstSession = await prisma.session.findFirst({
      where: { userId: req.userId },
      orderBy: { startedAt: 'asc' },
      select: { startedAt: true },
    });

    const lastSession = await prisma.session.findFirst({
      where: { userId: req.userId },
      orderBy: { startedAt: 'desc' },
      select: { startedAt: true },
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalSessions: stats._count.id,
          totalTrials: stats._sum.totalTrials || 0,
          averageAccuracy: stats._avg.accuracy || 0,
          averageMaxN: stats._avg.maxN || 0,
          averageScore: stats._avg.finalScore || 0,
          averageReactionTime: stats._avg.averageReactionTime || 0,
          bestN: stats._max.maxN || 0,
          bestScore: stats._max.finalScore || 0,
          firstSessionAt: firstSession?.startedAt || null,
          lastSessionAt: lastSession?.startedAt || null,
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

export { router as userRoutes };