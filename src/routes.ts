import { Router } from 'express';
import { authenticateToken } from './middlewares/authMiddleware';
import { getInstanceMiddleware } from './middlewares/instanceMiddleware';

import InstanceController from './controllers/InstanceController';

const routes = Router();


routes.post('/instance/:name', authenticateToken, getInstanceMiddleware, InstanceController.create)
routes.get('/instance/:name/start', authenticateToken, getInstanceMiddleware, InstanceController.start)
routes.get('/instance/:name/qrcode', authenticateToken, getInstanceMiddleware, InstanceController.qrcode)
routes.get('/instance/:name/connection', authenticateToken, getInstanceMiddleware, InstanceController.connectionStatus)
routes.post('/instance/:name/send', authenticateToken, getInstanceMiddleware, InstanceController.sendMessage)
routes.post('/instance/:name/startAutosender', authenticateToken, getInstanceMiddleware, InstanceController.startAutosender)
routes.post('/instance/:name/pauseAutosender', authenticateToken, getInstanceMiddleware, InstanceController.pauseAutosender)

export default routes;