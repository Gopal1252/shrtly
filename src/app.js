import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import authRouter from './routes/auth.js';
import urlRouter from './routes/url.js';
import redirectRouter from './routes/redirect.js';
import rateLimit from './middleware/rateLimit.js';
import config from './config/index.js';
import logger from './logger.js';
import pool from './db/index.js';
import redis from './redis/index.js';

const app = express();

app.use(cors({
  origin: config.corsOrigin,
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(pinoHttp({ logger }));

app.get('/health', async (req, res) => {
  const services = { database: 'connected', redis: 'connected' };
  let status = 'ok';

  try {
    await pool.query('SELECT 1');
  } catch {
    services.database = 'error';
    status = 'degraded';
  }

  try {
    await redis.ping();
  } catch {
    services.redis = 'error';
    status = 'degraded';
  }

  const statusCode = status === 'ok' ? 200 : 500;
  res.status(statusCode).json({ status, timestamp: new Date().toISOString(), services });
});

app.use('/api/auth', authRouter);
app.use('/api/url', urlRouter);
app.use('/', rateLimit(config.rateLimit.redirect), redirectRouter);


export default app;
