"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = __importDefault(require("../data-source"));
const Autosender_1 = __importDefault(require("../models/Autosender"));
const MessageBatch_1 = __importDefault(require("../models/MessageBatch"));
const autosender_preset_1 = require("../autosender-preset");
const autosendMiddleware_1 = require("../middlewares/autosendMiddleware");
const WhatsAppManager_1 = __importDefault(require("./WhatsAppManager"));
const BatchHistory_1 = __importDefault(require("../models/BatchHistory"));
const Batch_1 = __importDefault(require("../models/Batch"));
const MainServices_1 = require("../services/MainServices");
const autosenderIntances = new Map();
const AutoSenderService = {
    async editProps(instanceId, props) {
    },
    async create(instanceId) {
        const instance = autosenderIntances.get(instanceId);
        if (instance === undefined) {
            const autosenderRepository = data_source_1.default.getRepository(Autosender_1.default);
            const autosenderClient = await autosenderRepository.findOne({
                where: {
                    instance: {
                        id: instanceId
                    }
                },
                select: ['id', 'shooting_min', 'shooting_max', 'timer_start', 'timer_end', 'days', 'active']
            });
            let dataParams;
            if (!!autosenderClient === false) {
                dataParams = autosender_preset_1.defaultConfigAutosend;
                const newAutoSendProfile = autosenderRepository.create({
                    shooting_min: dataParams.shootingTimer.min,
                    shooting_max: dataParams.shootingTimer.max,
                    timer_start: dataParams.time.start,
                    timer_end: dataParams.time.end,
                    active: dataParams.active,
                    days: dataParams.days.join(','),
                    instance: {
                        id: instanceId
                    },
                });
                await autosenderRepository.save(newAutoSendProfile);
            }
            else {
                dataParams = {
                    time: {
                        start: autosenderClient.timer_start,
                        end: autosenderClient.timer_end
                    },
                    shootingTimer: {
                        min: autosenderClient.shooting_min,
                        max: autosenderClient.shooting_max
                    },
                    active: autosenderClient.active,
                    days: autosenderClient.days.split(',').map(Number)
                };
            }
            autosenderIntances.set(instanceId, dataParams);
        }
    },
    async timerVerifier() {
        if (autosenderIntances.size > 0) {
            autosenderIntances.forEach((instance, id) => {
                if (instance.active === false) {
                    const now = new Date();
                    const currentTime = now.getHours() * 100 + now.getMinutes();
                    ;
                    const validTime = AutoSenderService.isWithinTimeRange(currentTime, instance.time);
                    const currentDay = now.getDay();
                    const validDay = AutoSenderService.isCurrentDayValid(currentDay, instance.days);
                    if (validTime && validDay) {
                        AutoSenderService.turnOnSend(id);
                    }
                }
            });
        }
    },
    async stop(instanceId) {
        await AutoSenderService.create(instanceId);
        try {
            const instance = autosenderIntances.get(instanceId);
            instance.active = false;
            const autosenderRepository = data_source_1.default.getRepository(Autosender_1.default);
            await autosenderRepository.update({ id: instanceId }, { active: false });
            return { response: { message: 'Serviço parado' }, httpCode: 200 };
        }
        catch (error) {
            return { response: { message: 'Erro interno do servidor' }, httpCode: 500 };
        }
    },
    async start(instanceId) {
        await AutoSenderService.create(instanceId);
        try {
            const instance = autosenderIntances.get(instanceId);
            instance.active = true;
            const autosenderRepository = data_source_1.default.getRepository(Autosender_1.default);
            await autosenderRepository.update({ id: instanceId }, { active: true });
            return await AutoSenderService.turnOnSend(instanceId);
        }
        catch (error) {
            return { response: { message: 'Erro interno do servidor' }, httpCode: 500 };
        }
    },
    async turnOnSend(instanceId) {
        await AutoSenderService.create(instanceId);
        try {
            const instance = autosenderIntances.get(instanceId);
            return await (0, autosendMiddleware_1.checkAutosendMiddleware)(instance, instanceId, async () => {
                const messageBatchRepository = data_source_1.default.getRepository(MessageBatch_1.default);
                const pendingMessages = await messageBatchRepository.find({
                    where: {
                        batch: {
                            instance: {
                                id: instanceId
                            }
                        }
                    },
                    relations: ['batch'],
                    select: ['id', 'message', 'number', 'batch.id'], // Correção aqui
                    take: 100
                });
                if (pendingMessages.length > 0) {
                    AutoSenderService.sendBatchMessages(instanceId, pendingMessages);
                    return { response: { message: 'Serviço iniciado' }, httpCode: 200 };
                }
                else {
                    return { response: { message: 'Todas mensagens enviadas' }, httpCode: 200 };
                }
            });
        }
        catch (error) {
            return { response: { message: 'Erro interno do servidor' }, httpCode: 500 };
        }
    },
    async sendBatchMessages(instanceId, batchMessages) {
        await AutoSenderService.create(instanceId);
        const instance = autosenderIntances.get(instanceId);
        for (const message of batchMessages) {
            const timerVerifier = await (0, autosendMiddleware_1.checkAutosendMiddleware)(instance, instanceId, async () => {
                try {
                    const statusMessage = await WhatsAppManager_1.default.sendMessage(instanceId, message.message, message.number);
                    const messageBatchRepository = data_source_1.default.getRepository(MessageBatch_1.default);
                    await messageBatchRepository.remove(message);
                    const batchHistoryRepository = data_source_1.default.getRepository(BatchHistory_1.default);
                    const newMessageHistory = batchHistoryRepository.create({
                        message: {
                            id: statusMessage.response.messageId,
                        },
                        batch: {
                            id: message.batch.id
                        }
                    });
                    await batchHistoryRepository.save(newMessageHistory);
                    const delayInSeconds = Math.floor(Math.random() * instance.shootingTimer.max) + instance.shootingTimer.min;
                    await (0, MainServices_1.delay)(delayInSeconds);
                    return { response: { message: 'Mensagem enviada' }, httpCode: 200 };
                }
                catch (error) {
                    return { response: { message: 'Erro interno do seridos' }, httpCode: 500 };
                }
            });
            if (timerVerifier.httpCode !== 200)
                return;
        }
        AutoSenderService.turnOnSend(instanceId);
    },
    async addBatch(instanceId, messages) {
        try {
            const batchRepository = data_source_1.default.getRepository(Batch_1.default);
            const newBatch = batchRepository.create({
                time: new Date(),
                sent: false,
                instance: {
                    id: instanceId,
                },
                deleted: false
            });
            const { id: batchId } = await batchRepository.save(newBatch);
            for (const message of messages) {
                const messageBatchRepository = data_source_1.default.getRepository(MessageBatch_1.default);
                const newMessageBatch = messageBatchRepository.create({
                    message: message.message,
                    number: message.number,
                    batch: {
                        id: batchId
                    },
                });
                await messageBatchRepository.save(newMessageBatch);
            }
            AutoSenderService.turnOnSend(instanceId);
            return { response: { message: 'Lote enviado' }, httpCode: 200 };
        }
        catch (error) {
            return { response: { message: 'Erro interno do servidor' }, httpCode: 500 };
        }
    },
    async deleteBatch(batchId) {
        const messageBatchRepository = data_source_1.default.getRepository(MessageBatch_1.default);
        const deleteResponse = await messageBatchRepository.delete({
            batch: {
                id: batchId,
            }
        });
        if (deleteResponse.affected !== 0) {
            const batchRepository = data_source_1.default.getRepository(Batch_1.default);
            await batchRepository.update({
                id: batchId,
            }, { sent: true });
            return { response: { message: 'Lote deletado' }, httpCode: 200 };
        }
        else {
            return { response: { message: 'Lote não existente' }, httpCode: 403 };
        }
    },
    async status(instanceId) {
        await AutoSenderService.create(instanceId);
        try {
            const instance = autosenderIntances.get(instanceId);
            return !!instance.active; // Retorna o status atual do serviço de envio automático
        }
        catch (error) {
            return false;
        }
    },
    async listBatchMessagesByInstance(instanceId) {
        const messageBatchRepository = data_source_1.default.getRepository(MessageBatch_1.default);
        const messagesBatch = await messageBatchRepository.find({
            where: {
                batch: {
                    instance: { id: instanceId }
                }
            },
            select: ['id', 'message', 'number']
        });
        if (messagesBatch.length > 0) {
            return messagesBatch;
        }
        else {
            return false;
        }
    },
    async listBatchMessagesByBatch(batchId) {
        const messageBatchRepository = data_source_1.default.getRepository(MessageBatch_1.default);
        const messagesBatch = await messageBatchRepository.find({
            where: {
                batch: {
                    id: batchId,
                }
            },
            select: ['id', 'message', 'number']
        });
        if (messagesBatch.length > 0) {
            return messagesBatch;
        }
        else {
            return false;
        }
    },
    isWithinTimeRange(currentTime, timeRange) {
        const { start, end } = timeRange;
        let startTime = parseInt(start.replace(/\D/g, ""));
        let endTime = parseInt(end.replace(/\D/g, ""));
        return currentTime >= startTime && currentTime < endTime;
    },
    isCurrentDayValid(currentDay, validDays) {
        return validDays.includes(currentDay);
    }
};
exports.default = AutoSenderService;
