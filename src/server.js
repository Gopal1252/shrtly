import config from './config/index.js';
import pool from './db/index.js';
import redisClient from './redis/index.js';
import app from './app.js';
import logger from './logger.js';

async function start() {
  const required = ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.fatal('Missing required environment variables: %s', missing.join(', '));
    process.exit(1);
  }

  try {
    const dbResult = await pool.query('SELECT NOW()');
    logger.info('PostgreSQL connected: %s', dbResult.rows[0].now);

    const redisResult = await redisClient.ping();
    logger.info('Redis connected: %s', redisResult);

    app.listen(config.port, () => {
      logger.info('Server is running on port %d', config.port);
    });
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();
