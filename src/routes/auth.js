import express from 'express';
import { register, login, logout, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const authRouter = express.Router(); 

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', authenticate, me);

export default authRouter;
