import type { App } from '../index.js';
import { eq, and } from 'drizzle-orm';
import { playerRanking, clubMember } from '../db/schema/schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface UpdateRankingBody {
  eloRating?: number;
  points?: number;
}

interface RankingResponse {
  success: boolean;
  player: {
    userId: string;
    userName: string;
    eloRating: number;
    points: number;
  };
}

export function registerClubRankingRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // PUT /api/club/rankings/:userId - Update player ranking manually
  app.fastify.put('/api/club/rankings/:userId', {
    schema: {
      description: 'Update a player ranking in a club (admin only)',
      tags: ['club-rankings'],
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
        },
        required: ['userId'],
      },
      querystring: {
        type: 'object',
        properties: {
          clubId: { type: 'string', format: 'uuid' },
        },
        required: ['clubId'],
      },
      body: {
        type: 'object',
        properties: {
          eloRating: { type: 'number' },
          points: { type: 'number' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            player: {
              type: 'object',
              properties: {
                userId: { type: 'string' },
                userName: { type: 'string' },
                eloRating: { type: 'number' },
                points: { type: 'number' },
              },
            },
          },
        },
        401: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        403: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{
    Params: { userId: string };
    Querystring: { clubId: string };
    Body: UpdateRankingBody;
  }>, reply: FastifyReply) => {
    const { userId } = request.params;
    const { clubId } = request.query;
    const { eloRating, points } = request.body;

    app.logger.info(
      { userId, clubId, eloRating, points, path: '/api/club/rankings/:userId' },
      'Updating player ranking',
    );

    // Authenticate user
    const session = await requireAuth(request, reply);
    if (!session) {
      app.logger.warn({ userId, clubId, authenticatedUserId: null }, 'Unauthorized ranking update attempt');
      return;
    }

    const authenticatedUserId = session.user.id;

    try {
      // Verify that authenticated user is an admin of the specified club
      const adminCheck = await app.db
        .select()
        .from(clubMember)
        .where(
          and(
            eq(clubMember.clubId, clubId),
            eq(clubMember.userId, authenticatedUserId),
            eq(clubMember.role, 'admin'),
          ),
        )
        .limit(1);

      if (adminCheck.length === 0) {
        app.logger.warn(
          { authenticatedUserId, clubId, targetUserId: userId },
          'User is not an admin of the specified club',
        );
        reply.code(403);
        return { message: 'You must be an admin of this club to update rankings' };
      }

      // Get the current player ranking
      const currentRanking = await app.db
        .select()
        .from(playerRanking)
        .where(
          and(
            eq(playerRanking.clubId, clubId),
            eq(playerRanking.userId, userId),
          ),
        )
        .limit(1);

      if (currentRanking.length === 0) {
        app.logger.warn({ clubId, userId }, 'Player ranking not found');
        reply.code(404);
        return { message: 'Player ranking not found in this club' };
      }

      // Prepare update data
      const updateData: { eloRating?: number; points?: number } = {};
      if (eloRating !== undefined) {
        updateData.eloRating = eloRating;
      }
      if (points !== undefined) {
        updateData.points = points;
      }

      // Update the player ranking
      const updated = await app.db
        .update(playerRanking)
        .set(updateData)
        .where(
          and(
            eq(playerRanking.clubId, clubId),
            eq(playerRanking.userId, userId),
          ),
        )
        .returning();

      if (updated.length === 0) {
        app.logger.error({ clubId, userId }, 'Failed to update player ranking');
        reply.code(500);
        return { message: 'Failed to update player ranking' };
      }

      const updatedRanking = updated[0];

      app.logger.info(
        {
          clubId,
          userId,
          userName: updatedRanking.userName,
          eloRating: updatedRanking.eloRating,
          points: updatedRanking.points,
        },
        'Player ranking updated successfully',
      );

      const response: RankingResponse = {
        success: true,
        player: {
          userId: updatedRanking.userId,
          userName: updatedRanking.userName,
          eloRating: updatedRanking.eloRating,
          points: updatedRanking.points,
        },
      };

      return response;
    } catch (error) {
      app.logger.error(
        { err: error, userId, clubId, eloRating, points },
        'Error updating player ranking',
      );
      reply.code(500);
      return { message: 'Internal server error' };
    }
  });
}
