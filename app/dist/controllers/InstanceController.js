"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = __importDefault(require("../data-source"));
const Instance_1 = __importDefault(require("../models/Instance"));
const WhatsAppManager_1 = __importDefault(require("../services/WhatsAppManager"));
const AutoSenderService_1 = __importDefault(require("../services/AutoSenderService"));
const InstanceService_1 = __importDefault(require("../services/InstanceService"));
const Batch_1 = __importDefault(require("../models/Batch"));
const InstanceController = {
    async getInstances(request, response) {
        var _a;
        try {
            const instanceRepository = data_source_1.default.getRepository(Instance_1.default);
            const selectedInstances = await instanceRepository.find({
                where: {
                    enabled: true
                },
                select: ['id', 'name'],
            });
            let list = [];
            for (const instance of selectedInstances) {
                let { id, name } = instance;
                let statusResponse = await WhatsAppManager_1.default.connectionStatus(id);
                let connection = (_a = statusResponse.response.status) !== null && _a !== void 0 ? _a : statusResponse.response.message;
                list.push({
                    name: name,
                    id: id,
                    connection: connection
                });
            }
            return response.status(200).json({ instances: list });
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async create(request, response) {
        try {
            const { name } = request.params;
            const client = request.client;
            const createResponse = await InstanceService_1.default.create(name, client.id);
            if (createResponse === false) {
                return response.status(403).json({ message: 'Instancia já existente' });
            }
            else {
                return response.status(200).json({ message: 'Instancia Criada' });
            }
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async start(request, response) {
        try {
            const instance = request.instance;
            const startResponse = await WhatsAppManager_1.default.inicialize(instance.id);
            return response.status(startResponse.httpCode).json(startResponse.response);
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async stop(request, response) {
        try {
            const instance = request.instance;
            const stopResponse = await WhatsAppManager_1.default.close(instance.id);
            return response.status(stopResponse.httpCode).json(stopResponse.response);
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async restart(request, response) {
        try {
            const instance = request.instance;
            const restartResponse = await WhatsAppManager_1.default.restart(instance.id);
            return response.status(restartResponse.httpCode).json(restartResponse.response);
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async disconnect(request, response) {
        try {
            const instance = request.instance;
            const disconnectResponse = await WhatsAppManager_1.default.disconnect(instance.id);
            return response.status(disconnectResponse.httpCode).json(disconnectResponse.response);
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async qrcode(request, response) {
        try {
            const instance = request.instance;
            const qrCodeResponse = await WhatsAppManager_1.default.verifyInstance(instance.id, async () => {
                return await WhatsAppManager_1.default.qrcode(instance.id);
            });
            return response.status(qrCodeResponse.httpCode).json(qrCodeResponse.response);
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async connectionStatus(request, response) {
        try {
            const instance = request.instance;
            const connectionResponse = await WhatsAppManager_1.default.verifyInstance(instance.id, async () => {
                return await WhatsAppManager_1.default.connectionStatus(instance.id);
            });
            return response.status(connectionResponse.httpCode).json(connectionResponse.response);
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async sendMessage(request, response) {
        try {
            const instance = request.instance;
            const { message, number } = request.body;
            const sendResponse = await WhatsAppManager_1.default.verifyInstance(instance.id, async () => {
                return await WhatsAppManager_1.default.sendMessage(instance.id, message, number);
            });
            return response.status(sendResponse.httpCode).json(sendResponse.response);
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async addBatch(request, response) {
        try {
            const { messages } = request.body;
            const instance = request.instance;
            if (messages) {
                if (messages.length > 0) {
                    const batchResponse = await AutoSenderService_1.default.addBatch(instance.id, messages);
                    return response.status(batchResponse.httpCode).json(batchResponse.response);
                }
                else {
                    return response.status(403).json({ message: 'Nenhuma mensagem enviada' });
                }
            }
            else {
                return response.status(403).json({ message: 'Nenhuma mensagem enviada' });
            }
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async deleteBatch(request, response) {
        try {
            const instance = request.instance;
            let { id } = request.params;
            const parsedId = parseInt(id);
            if (!!parsedId === true) {
                // verificar se o lote passado pertence a instancia informada
                const batchRepository = data_source_1.default.getRepository(Batch_1.default);
                const selectedBatch = await batchRepository.findOne({
                    where: {
                        instance: {
                            id: instance.id
                        },
                        id: parsedId
                    }
                });
                if (!!selectedBatch === true) {
                    const batchResponse = await AutoSenderService_1.default.deleteBatch(parsedId);
                    return response.status(batchResponse.httpCode).json(batchResponse.response);
                }
                else {
                    return response.status(403).json({ message: 'Lote inválido' });
                }
            }
            else {
                return response.status(403).json({ message: 'Lote inválido' });
            }
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async deletePeddingBatches(request, response) {
        try {
            const instance = request.instance;
            const batchRepository = data_source_1.default.getRepository(Batch_1.default);
            const selectedBatch = await batchRepository.find({
                where: {
                    instance: {
                        id: instance.id
                    },
                    sent: false
                }
            });
            if (selectedBatch.length > 0) {
                for (const batch of selectedBatch) {
                    await AutoSenderService_1.default.deleteBatch(batch.id);
                }
                return response.status(200).json({ message: 'Lotes pendentes de envio deletados' });
            }
            else {
                return response.status(403).json({ message: 'Não há lotes pendentes de envio' });
            }
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async deleteLastBatch(request, response) {
        try {
            const instance = request.instance;
            const batchRepository = data_source_1.default.getRepository(Batch_1.default);
            const selectedBatch = await batchRepository.findOne({
                where: {
                    instance: {
                        id: instance.id
                    },
                    sent: false
                },
                order: {
                    id: 'DESC'
                }
            });
            if (!!selectedBatch === true) {
                await AutoSenderService_1.default.deleteBatch(selectedBatch.id);
                return response.status(200).json({ message: 'Ultimo lote pendente de envio deletado' });
            }
            else {
                return response.status(403).json({ message: 'Não há lotes pendentes de envio' });
            }
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async listPendingBatches(request, response) {
        try {
            const instance = request.instance;
            const listResponse = await AutoSenderService_1.default.listBatchMessagesByInstance(instance.id);
            if (!!listResponse == true) {
                return response.status(200).json(listResponse);
            }
            else {
                return response.status(403).json({ message: 'Não há lotes pendentes' });
            }
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    hooks(request, response) {
    },
    async pauseAutosender(request, response) {
        try {
            const instance = request.instance;
            const pauseResponse = await WhatsAppManager_1.default.verifyInstance(instance.id, async () => {
                return await AutoSenderService_1.default.stop(instance.id);
            });
            response.status(pauseResponse.httpCode).json(pauseResponse.response);
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async startAutosender(request, response) {
        try {
            const instance = request.instance;
            const startResponse = await WhatsAppManager_1.default.verifyInstance(instance.id, async () => {
                return await AutoSenderService_1.default.start(instance.id);
            });
            response.status(startResponse.httpCode).json(startResponse.response);
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async enable(request, response) {
        try {
            const { name } = request.params;
            const client = request.client;
            const instanceRepository = data_source_1.default.getRepository(Instance_1.default);
            const selectedInstance = await instanceRepository.findOne({
                where: {
                    name: name,
                    client: {
                        id: client.id
                    }
                },
                select: ['id'],
            });
            if (selectedInstance === null) {
                return response.status(403).json({ message: 'Instancia não existente' });
            }
            else {
                await instanceRepository.update({ id: selectedInstance.id }, { enabled: true });
                return response.status(403).json({ message: 'Instancia ativada' });
            }
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async disable(request, response) {
        try {
            const { name } = request.params;
            const client = request.client;
            const instanceRepository = data_source_1.default.getRepository(Instance_1.default);
            const selectedInstance = await instanceRepository.findOne({
                where: {
                    name: name,
                    client: {
                        id: client.id
                    }
                },
                select: ['id'],
            });
            if (selectedInstance === null) {
                return response.status(403).json({ message: 'Instancia não existente' });
            }
            else {
                await WhatsAppManager_1.default.close(selectedInstance.id);
                await AutoSenderService_1.default.stop(selectedInstance.id);
                await instanceRepository.update({ id: selectedInstance.id }, { enabled: false });
                return response.status(403).json({ message: 'Instancia desativada' });
            }
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async autoSenderStatus(request, response) {
        try {
            const instance = request.instance;
            const status = AutoSenderService_1.default.status(instance.id);
            return response.status(200).json({ status: status });
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async editAutosender(request, response) {
        try {
            const instance = request.instance;
            const body = request.body;
            const editResponse = await AutoSenderService_1.default.editProps(instance.id, body);
            if (editResponse === true) {
                response.status(200).json({ message: 'Dados alterados' });
            }
            else {
                response.status(403).json({ message: 'Dados inválidos' });
            }
        }
        catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
};
exports.default = InstanceController;
