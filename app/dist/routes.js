"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("./middlewares/authMiddleware");
const instanceMiddleware_1 = require("./middlewares/instanceMiddleware");
const InstanceController_1 = __importDefault(require("./controllers/InstanceController"));
const routes = (0, express_1.Router)();
routes.get('/instance/list', authMiddleware_1.authenticateToken, InstanceController_1.default.getInstances);
routes.get('/instance/:name/start', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.start);
routes.get('/instance/:name/close', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.close);
routes.get('/instance/:name/restart', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.restart);
routes.get('/instance/:name/qrcode', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.qrcode);
routes.get('/instance/:name/connection', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.connectionStatus);
routes.get('/instance/:name/disconnect', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.disconnect);
routes.get('/instance/:name/startAutosender', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.startAutosender);
routes.get('/instance/:name/pauseAutosender', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.pauseAutosender);
routes.get('/instance/:name/pendingBatches', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.listPendingBatches);
routes.get('/instance/:name/autosender', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.autoSenderStatus);
routes.get('/instance/:name/disable', authMiddleware_1.authenticateToken, InstanceController_1.default.disable);
routes.get('/instance/:name/enable', authMiddleware_1.authenticateToken, InstanceController_1.default.enable);
routes.get('/instance/:name/batchSendedMessages/:id', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.batchSendedMessages);
routes.post('/instance/:name/send', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.sendMessage);
routes.post('/instance/:name/addBatch', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.addBatch);
routes.post('/instance/:name/deleteLastBatch', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.deleteLastBatch);
routes.post('/instance/:name/deletePendingBatches', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.deletePeddingBatches);
routes.post('/instance/:name/deleteBatch/:id', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.deleteBatch);
routes.post('/instance/:name/editAutosender', authMiddleware_1.authenticateToken, instanceMiddleware_1.getInstanceMiddleware, InstanceController_1.default.editAutosender);
routes.post('/instance/:name', authMiddleware_1.authenticateToken, InstanceController_1.default.create);
exports.default = routes;
