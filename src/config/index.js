import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  logLevel: process.env.LOG_LEVEL || 'info',
  rateLimit: {
    urlCreation: {
      maxRequests: parseInt(process.env.RATE_LIMIT_URL_MAX) || 10,
      windowSeconds: parseInt(process.env.RATE_LIMIT_URL_WINDOW) || 15 * 60,
    },
    redirect: {
      maxRequests: parseInt(process.env.RATE_LIMIT_REDIRECT_MAX) || 100,
      windowSeconds: parseInt(process.env.RATE_LIMIT_REDIRECT_WINDOW) || 15 * 60,
    },
  },
};
