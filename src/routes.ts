import { Router } from 'express';
import { authenticateToken } from './middlewares/authMiddleware';
import { getInstanceMiddleware } from './middlewares/instanceMiddleware';

import InstanceController from './controllers/InstanceController';

const routes = Router();


routes.get('/instance/:name/start', authenticateToken, getInstanceMiddleware, InstanceController.start)
routes.get('/instance/:name/stop', authenticateToken, getInstanceMiddleware, InstanceController.stop)
routes.get('/instance/:name/restart', authenticateToken, getInstanceMiddleware, InstanceController.restart)
routes.get('/instance/:name/qrcode', authenticateToken, getInstanceMiddleware, InstanceController.qrcode)
routes.get('/instance/:name/connection', authenticateToken, getInstanceMiddleware, InstanceController.connectionStatus)
routes.get('/instance/:name/disconnect', authenticateToken, getInstanceMiddleware, InstanceController.disconnect)
routes.get('/instance/:name/startAutosender', authenticateToken, getInstanceMiddleware, InstanceController.startAutosender)
routes.get('/instance/:name/pauseAutosender', authenticateToken, getInstanceMiddleware, InstanceController.pauseAutosender)
routes.get('/instance/list', authenticateToken, InstanceController.getInstances)
routes.get('/instance/:name/autosender', authenticateToken, InstanceController.autoSenderStatus)

routes.post('/instance/:name/send', authenticateToken, getInstanceMiddleware, InstanceController.sendMessage)
routes.post('/instance/:name/addBatch', authenticateToken, getInstanceMiddleware, InstanceController.addBatch)
routes.post('/instance/:name', authenticateToken, InstanceController.create)
routes.post('/instance/:name/disable', authenticateToken, InstanceController.disable)
routes.post('/instance/:name/enable', authenticateToken, InstanceController.enable)


export default routes;