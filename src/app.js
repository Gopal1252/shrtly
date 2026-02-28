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

app.use('/api/auth', authRouter);
app.use('/api/url', urlRouter);
app.use('/', rateLimit(config.rateLimit.redirect), redirectRouter);

app.get('/health',(req,res) => {
    res.status(200).json({ message: 'OK' });
})


export default app;
