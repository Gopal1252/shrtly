import express from 'express';
import { shortenUrl, getUserUrls } from '../controllers/urlController.js';
import authenticate from '../middleware/auth.js';
import rateLimit from '../middleware/rateLimit.js';
import { getUrlStats } from '../controllers/analyticsController.js';

const urlRouter = express.Router();

urlRouter.get('/', authenticate, getUserUrls);
import config from '../config/index.js';

urlRouter.post('/', authenticate, rateLimit(config.rateLimit.urlCreation), shortenUrl);
urlRouter.get('/:code/stats', authenticate, getUrlStats);

export default urlRouter;
