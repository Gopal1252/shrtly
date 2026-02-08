import express from 'express';
import authRouter from './routes/auth.js';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);

app.get('/health',(req,res) => {
    res.status(200).json({ message: 'OK' });
})

export default app;