import config from './config/index.js';
import pool from './db/index.js';
import redisClient from './redis/index.js';
import app from './app.js';

async function start() {
  try {
    const dbResult = await pool.query('SELECT NOW()');
    console.log('PostgreSQL connected:', dbResult.rows[0].now);

    const redisResult = await redisClient.ping();
    console.log('Redis connected:', redisResult);

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
