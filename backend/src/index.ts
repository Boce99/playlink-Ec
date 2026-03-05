import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema/schema.js';
import * as authSchema from './db/schema/auth-schema.js';
import { registerUserRoutes } from './routes/users.js';
import { registerClubRankingRoutes } from './routes/club-rankings.js';

// Combine app schema with auth schema
const schema = { ...appSchema, ...authSchema };

// Create application with combined schema
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Configure authentication with Better Auth
app.withAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [
    // Web origins
    'http://localhost:3000',
    'http://localhost:3001',
    'https://*.example.com',
    // Mobile app custom scheme
    'playlink://',
  ],
});

// Register routes - add your route modules here
// IMPORTANT: Always use registration functions to avoid circular dependency issues
registerUserRoutes(app);
registerClubRankingRoutes(app);

await app.run();
app.logger.info('Application running and ready for authentication');
