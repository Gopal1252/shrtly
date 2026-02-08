import express from 'express';
import { shortenUrl } from '../controllers/urlController.js';
import authenticate from '../middleware/auth.js';

const urlRouter = express.Router();

urlRouter.post('/', authenticate, shortenUrl);

export default urlRouter;