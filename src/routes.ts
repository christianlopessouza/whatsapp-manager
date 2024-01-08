import { Router } from 'express';
import { authenticateToken } from './middlewares/authMiddleware';

import InstanceController from './controllers/InstanceController';

const routes = Router();


routes.post('/instance/:name', authenticateToken, InstanceController.create)
routes.get('/instance/:name/start', authenticateToken, InstanceController.start)

export default routes;