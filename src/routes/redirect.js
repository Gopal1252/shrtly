import express from 'express';
import { redirectController } from '../controllers/redirectController.js';

const redirectRouter = express.Router();

redirectRouter.get('/:code',redirectController);

export default redirectRouter;