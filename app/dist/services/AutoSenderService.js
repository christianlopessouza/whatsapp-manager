"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = __importDefault(require("../data-source"));
const Autosender_1 = __importDefault(require("../models/Autosender"));
const MessageBatch_1 = __importDefault(require("../models/MessageBatch"));
const Message_1 = __importDefault(require("../models/Message"));
const autosender_preset_1 = require("../autosender-preset");
const autosendMiddleware_1 = require("../middlewares/autosendMiddleware");
const WhatsAppManager_1 = __importDefault(require("./WhatsAppManager"));
const BatchHistory_1 = __importDefault(require("../models/BatchHistory"));
const Batch_1 = __importDefault(require("../models/Batch"));
const WebHook_1 = require("./WebHook");
const MainServices_1 = require("../services/MainServices");
const MainServices_2 = require("../services/MainServices");
const luxon_1 = require("luxon");
const timeZone = "America/Sao_Paulo";
const autosenderIntances = new Map();
const AutoSenderService = {
    async editProps(instanceId, editedProps) {
        try {
            const instance = autosenderIntances.get(instanceId);
            if (instance !== undefined && !!editedProps) {
                const dataParams = Object.assign(Object.assign({}, instance), editedProps);
                autosenderIntances.set(instanceId, dataParams);
                const autosenderRepository = data_source_1.default.getRepository(Autosender_1.default);
                await autosenderRepository.update({ instance: { id: instanceId } }, {
                    shooting_min: dataParams.shootingTimer.min,
                    shooting_max: dataParams.shootingTimer.max,
                    timer_start: dataParams.time.start,
                    timer_end: dataParams.time.end,
                    active: dataParams.active,
                    days: dataParams.days.join(',')
                });
                // console.log(response)
                // console.log(dataParams)
                // console.log({ id: instanceId }, {
                //     shooting_min: dataParams.shootingTimer.min,
                //     shooting_max: dataParams.shootingTimer.max,
                //     timer_start: dataParams.time.start,
                //     timer_end: dataParams.time.end,
                //     active: dataParams.active,
                //     days: dataParams.days.join(',')
                // })
                return true;
            }
            else {
                return false;
            }
        }
        catch (error) {
            return false;
        }
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
                    enabled: true
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
                    days: autosenderClient.days.split(',').map(Number),
                    stopRun: false,
                };
            }
            autosenderIntances.set(instanceId, dataParams);
        }
    },
    async timerVerifier() {
        if (autosenderIntances.size > 0) {
            autosenderIntances.forEach((instance, id) => {
                if (instance.active === false) {
                    const now = new Date(new Date().toLocaleString("en-US", { timeZone }));
                    const currentTime = now.getHours() * 100 + now.getMinutes();
                    const currentDay = now.getDay();
                    const isTimeValid = AutoSenderService.isWithinTimeRange(currentTime, instance.time);
                    const isDayValid = AutoSenderService.isCurrentDayValid(currentDay, instance.days);
                    if (isTimeValid && isDayValid) {
                        AutoSenderService.start(id);
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
            await autosenderRepository.update({ instance: { id: instanceId } }, { active: false });
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
            await autosenderRepository.update({ instance: { id: instanceId } }, { active: true });
            await AutoSenderService.turnOnSend(instanceId);
            return { response: { message: 'Serviço Iniciado' }, httpCode: 200 };
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
                const latestBatch = await messageBatchRepository.findOne({
                    where: {
                        batch: {
                            instance: {
                                id: instanceId
                            }
                        }
                    },
                    relations: ['batch'],
                    order: {
                        id: 'ASC' // Ordena por id de forma decrescente para obter o lote mais recente
                    }
                });
                if (latestBatch) {
                    const pendingMessages = await messageBatchRepository.find({
                        where: {
                            batch: {
                                id: latestBatch.batch.id
                            }
                        },
                        relations: ['batch'],
                        select: ['id', 'message', 'number', 'batch.id'], // Correção aqui
                        take: 100,
                        order: {
                            id: 'ASC' // Ordena por id de forma decrescente para obter o lote mais recente
                        }
                    });
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
        let batchId = batchMessages[0].batch.id;
        for (const message of batchMessages) {
            const timerVerifier = await (0, autosendMiddleware_1.checkAutosendMiddleware)(instance, instanceId, async () => {
                try {
                    const delayInSeconds = Math.floor(Math.random() * instance.shootingTimer.max) + instance.shootingTimer.min;
                    await (0, MainServices_1.delay)(delayInSeconds);
                    const statusMessage = await WhatsAppManager_1.default.sendMessage(instanceId, message.message, message.number);
                    if (!!statusMessage.response.messageId === true) {
                        const messageRepository = data_source_1.default.getRepository(Message_1.default);
                        await messageRepository.update({ id: statusMessage.response.messageId }, { message_batch_id: message.id });
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
                    }
                    if (statusMessage.errorCode != 'ER006') {
                        const messageBatchRepository = data_source_1.default.getRepository(MessageBatch_1.default);
                        await messageBatchRepository.remove(message);
                    }
                    return { response: { message: statusMessage.response }, httpCode: statusMessage.httpCode };
                }
                catch (error) {
                    return { response: { message: 'Erro interno do seridos' }, httpCode: 500 };
                }
            });
            if (timerVerifier.httpCode !== 200)
                return;
        }
        await AutoSenderService.batchVerifier(batchId);
        AutoSenderService.turnOnSend(instanceId);
    },
    async batchVerifier(batchId) {
        const messageBatchRepository = data_source_1.default.getRepository(MessageBatch_1.default);
        const selectedMessageBatch = await messageBatchRepository.findOne({
            where: {
                batch: {
                    id: batchId
                }
            }
        });
        if (!!selectedMessageBatch === false) {
            const batchRepository = data_source_1.default.getRepository(Batch_1.default);
            await batchRepository.update({
                id: batchId,
            }, { sent: true });
            const selectedBatch = await batchRepository.findOne({
                where: {
                    id: batchId
                },
                relations: ['instance', 'instance.client']
            });
            const sendedMessages = await AutoSenderService.listSendedMessagesBatch(batchId);
            const client = selectedBatch.instance.client;
            console.log(sendedMessages, "THIS LOTE");
            if (!!client.hook_url === true) {
                (0, WebHook_1.WebHook)(client.hook_url, {
                    batchId: batchId,
                    sendedMessages: sendedMessages,
                    status: 'success',
                    method: 'batchSent'
                });
            }
            // ativa o hook 
        }
    },
    async addBatch(instanceId, messages) {
        try {
            const batchRepository = data_source_1.default.getRepository(Batch_1.default);
            const message_id_list = [];
            const newBatch = batchRepository.create({
                time: (0, MainServices_2.localDate)().toString(),
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
                const savedMessage = await messageBatchRepository.save(newMessageBatch);
                message_id_list.push({
                    inserted_id: savedMessage.id,
                    reference: message.id
                });
            }
            AutoSenderService.turnOnSend(instanceId);
            return { response: { message: 'Lote enviado', messages_id: message_id_list, batchId: batchId }, httpCode: 200 };
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
            }, { sent: true, deleted: true });
            await AutoSenderService.batchVerifier(batchId);
            return { response: { message: 'Lote deletado' }, httpCode: 200 };
        }
        else {
            return { response: { message: 'Lote não existente' }, httpCode: 403 };
        }
    },
    // async deletePendingBatches(instanceId: number) {
    //     const batches = await AutoSenderService.listPendingBatches(instanceId);
    //     const batches_id_list = [];
    //     for (const batch of batches) {
    //         await AutoSenderService.deleteBatch(batch.id);
    //         batches_id_list.push(batch.id);
    //     }
    //     return { response: { message: 'Mensagens deletadas', deletedBatches: batches_id_list }, httpCode: 200 }
    // },
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
    async listPendingBatches(instanceId) {
        const batchRepository = data_source_1.default.getRepository(Batch_1.default);
        const pendingBatches = await batchRepository.find({
            where: {
                instance: {
                    id: instanceId
                }
            },
            select: ['id'],
        });
        return pendingBatches;
    },
    resetCacheBatchSended(instanceId) {
        try {
            const instance = autosenderIntances.get(instanceId);
            instance.stopRun = true;
            return true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    },
    async listSendedMessagesBatch(batchId) {
        const messageBatchRepository = data_source_1.default.getRepository(BatchHistory_1.default);
        const messagesBatch = await messageBatchRepository.find({
            where: {
                batch: {
                    id: batchId
                }
            },
            relations: ['message'], // Certifique-se de incluir os nomes corretos das relações
            select: {
                message: {
                    id: true,
                    insert_timestamp: true,
                    sent: true,
                    message_batch_id: true
                }
            },
        });
        const messagesBatchFixed = messagesBatch.map(item => (Object.assign(Object.assign({}, item), { message: Object.assign(Object.assign({}, item.message), { insert_timestamp: luxon_1.DateTime.fromJSDate(item.message.insert_timestamp).toLocal().toString() }) })));
        if (messagesBatchFixed.length > 0) {
            return messagesBatchFixed;
        }
        else {
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
        console.log(startTime, endTime, currentTime);
        return currentTime >= startTime && currentTime < endTime;
    },
    isCurrentDayValid(currentDay, validDays) {
        return validDays.includes(currentDay);
    }
};
exports.default = AutoSenderService;
