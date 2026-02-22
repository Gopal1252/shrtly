import express from 'express';
import { shortenUrl, getUserUrls } from '../controllers/urlController.js';
import authenticate from '../middleware/auth.js';
import { getUrlStats } from '../controllers/analyticsController.js';

const urlRouter = express.Router();

urlRouter.get('/', authenticate, getUserUrls);
urlRouter.post('/', authenticate, shortenUrl);
urlRouter.get('/:code/stats', authenticate, getUrlStats);

export default urlRouter;
