import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function registerUserRoutes(app: App) {
  const requireAuth = app.requireAuth();

  app.fastify.get('/api/users/me', {
    schema: {
      description: 'Get current authenticated user profile',
      tags: ['users'],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            image: { type: ['string', 'null'] },
            emailVerified: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    app.logger.info({ path: '/api/users/me' }, 'Fetching current user profile');

    const session = await requireAuth(request, reply);
    if (!session) {
      app.logger.warn({ path: '/api/users/me' }, 'Unauthorized access attempt');
      return;
    }

    app.logger.info({ userId: session.user.id }, 'Current user profile retrieved');
    return session.user;
  });
}
