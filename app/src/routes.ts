import { Router } from 'express';
import { authenticateToken } from './middlewares/authMiddleware';
import { getInstanceMiddleware } from './middlewares/instanceMiddleware';

import InstanceController from './controllers/InstanceController';

const routes = Router();

routes.get('/instance/list', authenticateToken, InstanceController.getInstances)

routes.get('/instance/:name/start', authenticateToken, getInstanceMiddleware, InstanceController.start)
routes.get('/instance/:name/close', authenticateToken, getInstanceMiddleware, InstanceController.close)
routes.get('/instance/:name/restart', authenticateToken, getInstanceMiddleware, InstanceController.restart)
routes.get('/instance/:name/qrcode', authenticateToken, getInstanceMiddleware, InstanceController.qrcode)
routes.get('/instance/:name/connection', authenticateToken, getInstanceMiddleware, InstanceController.connectionStatus)
routes.get('/instance/:name/disconnect', authenticateToken, getInstanceMiddleware, InstanceController.disconnect)
routes.get('/instance/:name/startAutosender', authenticateToken, getInstanceMiddleware, InstanceController.startAutosender)
routes.get('/instance/:name/pauseAutosender', authenticateToken, getInstanceMiddleware, InstanceController.pauseAutosender)
routes.get('/instance/:name/pendingBatches', authenticateToken, getInstanceMiddleware, InstanceController.listPendingBatches)
routes.get('/instance/:name/autosender', authenticateToken, getInstanceMiddleware, InstanceController.autoSenderStatus)
routes.get('/instance/:name/disable', authenticateToken, InstanceController.disable)
routes.get('/instance/:name/enable', authenticateToken, InstanceController.enable)

routes.post('/instance/:name/send', authenticateToken, getInstanceMiddleware, InstanceController.sendMessage)
routes.post('/instance/:name/addBatch', authenticateToken, getInstanceMiddleware, InstanceController.addBatch)
routes.post('/instance/:name/deleteLastBatch', authenticateToken, getInstanceMiddleware, InstanceController.deleteLastBatch)
routes.post('/instance/:name/deletePendingBatches', authenticateToken, getInstanceMiddleware, InstanceController.deletePeddingBatches)
routes.post('/instance/:name/deleteBatch/:id', authenticateToken, getInstanceMiddleware, InstanceController.deleteBatch)
routes.post('/instance/:name/editAutosender', authenticateToken, getInstanceMiddleware, InstanceController.editAutosender)
routes.post('/instance/:name', authenticateToken, InstanceController.create)



export default routes;