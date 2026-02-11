import express from 'express';
import authRouter from './routes/auth.js';
import urlRouter from './routes/url.js';
import redirectRouter from './routes/redirect.js';
import rateLimit from './middleware/rateLimit.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/url', rateLimit({ maxRequests: 10, windowSeconds: 15*60}), urlRouter);
app.use('/', rateLimit({ maxRequests: 100, windowSeconds: 15*60 }), redirectRouter);

app.get('/health',(req,res) => {
    res.status(200).json({ message: 'OK' });
})


export default app;