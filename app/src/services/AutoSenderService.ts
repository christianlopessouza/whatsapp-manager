
import dataSource from '../data-source';
import Autosender from '../models/Autosender';
import MessageBatch from '../models/MessageBatch';
import { AutosendInstance, defaultConfigAutosend, TimeRange, AutosendInstanceUpdate } from '../autosender-preset';
import { checkAutosendMiddleware } from '../middlewares/autosendMiddleware';
import WhatsAppManager from './WhatsAppManager';
import BatchHistory from '../models/BatchHistory';
import Batch from '../models/Batch';
import { WebHook } from './WebHook';
import { delay, DefaultResponse } from '../services/MainServices';


const autosenderIntances: Map<number, AutosendInstance> = new Map();

const AutoSenderService = {
    async editProps(instanceId: number, editedProps: AutosendInstanceUpdate) {
        try {
            const instance = autosenderIntances.get(instanceId);

            if (instance !== undefined && !!editedProps) {
                const dataParams = {
                    ...instance,
                    ...editedProps
                }

                autosenderIntances.set(instanceId, dataParams)

                const autosenderRepository = dataSource.getRepository(Autosender);

                const response = await autosenderRepository.update({ instance: { id: instanceId } }, {
                    shooting_min: dataParams.shootingTimer.min,
                    shooting_max: dataParams.shootingTimer.max,
                    timer_start: dataParams.time.start,
                    timer_end: dataParams.time.end,
                    active: dataParams.active,
                    days: dataParams.days.join(',')
                });

                console.log(response)
                console.log(dataParams)
                console.log({ id: instanceId }, {
                    shooting_min: dataParams.shootingTimer.min,
                    shooting_max: dataParams.shootingTimer.max,
                    timer_start: dataParams.time.start,
                    timer_end: dataParams.time.end,
                    active: dataParams.active,
                    days: dataParams.days.join(',')
                })


                return true;

            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    },

    async create(instanceId: number): Promise<void> {
        const instance = autosenderIntances.get(instanceId);

        if (instance === undefined) {

            const autosenderRepository = dataSource.getRepository(Autosender);

            const autosenderClient = await autosenderRepository.findOne({
                where: {
                    instance: {
                        id: instanceId
                    }
                },
                select: ['id', 'shooting_min', 'shooting_max', 'timer_start', 'timer_end', 'days', 'active']
            });


            let dataParams: AutosendInstance;

            if (!!autosenderClient === false) {

                dataParams = defaultConfigAutosend;

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

            } else {
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
                }
            }


            autosenderIntances.set(instanceId, dataParams);

        }
    },

    async timerVerifier(): Promise<void> {
        if (autosenderIntances.size > 0) {
            autosenderIntances.forEach((instance: AutosendInstance, id) => {
                if (instance.active === false) {

                    const now: Date = new Date();
                    const currentTime: number = now.getHours() * 100 + now.getMinutes();;
                    const validTime: boolean = AutoSenderService.isWithinTimeRange(currentTime, instance.time);

                    const currentDay: number = now.getDay();
                    const validDay: boolean = AutoSenderService.isCurrentDayValid(currentDay, instance.days);

                    if (validTime && validDay) {
                        AutoSenderService.turnOnSend(id);
                    }
                }
            });
        }
    },



    async stop(instanceId: number): Promise<DefaultResponse> {
        await AutoSenderService.create(instanceId);

        try {

            const instance = autosenderIntances.get(instanceId);
            instance!.active = false;

            const autosenderRepository = dataSource.getRepository(Autosender);
            await autosenderRepository.update({ instance: { id: instanceId } }, { active: false });

            return { response: { message: 'Serviço parado' }, httpCode: 200 };
        } catch (error) {
            return { response: { message: 'Erro interno do servidor' }, httpCode: 500 }
        }

    },


    async start(instanceId: number): Promise<DefaultResponse> {
        await AutoSenderService.create(instanceId);

        try {
            const instance = autosenderIntances.get(instanceId);
            instance!.active = true;

            const autosenderRepository = dataSource.getRepository(Autosender);
            await autosenderRepository.update({ instance: { id: instanceId } }, { active: true });

            return await AutoSenderService.turnOnSend(instanceId);

        } catch (error) {
            return { response: { message: 'Erro interno do servidor' }, httpCode: 500 }
        }

    },

    async turnOnSend(instanceId: number): Promise<DefaultResponse> {
        await AutoSenderService.create(instanceId);
        try {
            const instance = autosenderIntances.get(instanceId);
            return await checkAutosendMiddleware(instance!, instanceId, async () => {

                const messageBatchRepository = dataSource.getRepository(MessageBatch);

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
                        select: ['id', 'message', 'number', 'batch.id' as keyof MessageBatch], // Correção aqui
                        take: 100
                    });

                    AutoSenderService.sendBatchMessages(instanceId, pendingMessages);
                    return { response: { message: 'Serviço iniciado' }, httpCode: 200 };
                } else {
                    return { response: { message: 'Todas mensagens enviadas' }, httpCode: 200 };
                }

            })
        } catch (error) {
            return { response: { message: 'Erro interno do servidor' }, httpCode: 500 }
        }

    },

    async sendBatchMessages(instanceId: number, batchMessages: MessageBatch[]): Promise<void> {
        await AutoSenderService.create(instanceId);

        const instance = autosenderIntances.get(instanceId);

        let batchId = batchMessages[0].batch.id;

        for (const message of batchMessages) {
            const timerVerifier = await checkAutosendMiddleware(instance!, instanceId, async () => {
                try {
                    const delayInSeconds = Math.floor(Math.random() * instance!.shootingTimer.max) + instance!.shootingTimer.min;
                    await delay(delayInSeconds);

                    const statusMessage = await WhatsAppManager.sendMessage(instanceId, message.message, message.number);

                    const messageBatchRepository = dataSource.getRepository(MessageBatch);
                    await messageBatchRepository.remove(message);

                    const batchHistoryRepository = dataSource.getRepository(BatchHistory)

                    const newMessageHistory = batchHistoryRepository.create({
                        message: {
                            id: statusMessage.response.messageId,
                        },
                        batch: {
                            id: message.batch.id
                        }
                    });
                    await batchHistoryRepository.save(newMessageHistory);



                    return { response: { message: 'Mensagem enviada' }, httpCode: 200 }
                } catch (error) {
                    return { response: { message: 'Erro interno do seridos' }, httpCode: 500 }
                }

            })
            if (timerVerifier.httpCode !== 200) return;
        }

        await AutoSenderService.batchVerifier(batchId);

        AutoSenderService.turnOnSend(instanceId)
    },

    async batchVerifier(batchId: number): Promise<void> {
        const messageBatchRepository = dataSource.getRepository(MessageBatch);

        const selectedMessageBatch = await messageBatchRepository.findOne({
            where: {
                batch: {
                    id: batchId
                }
            }
        });

        if (!!selectedMessageBatch === false) {
            const batchRepository = dataSource.getRepository(Batch);
            await batchRepository.update({
                id: batchId,
            }, { sent: true });

            const selectedBatch = await batchRepository.findOne({
                where: {
                    id: batchId
                },
                relations: ['instance', 'instance.client']
            });

            const client = selectedBatch!.instance.client;
            if (!!client.hook_url === true) {
                WebHook(client.hook_url, {
                    batchId: batchId,
                    status: 'success',
                    method: 'batchSent'
                });
            }
            // ativa o hook 
        }
    },

    async addBatch(instanceId: number, messages: { number: string, message: string }[]) {
        try {
            const batchRepository = dataSource.getRepository(Batch)

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
                const messageBatchRepository = dataSource.getRepository(MessageBatch)

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

            return { response: { message: 'Lote enviado' }, httpCode: 200 }

        } catch (error) {
            return { response: { message: 'Erro interno do servidor' }, httpCode: 500 }
        }


    },

    async deleteBatch(batchId: number) {
        const messageBatchRepository = dataSource.getRepository(MessageBatch);

        const deleteResponse = await messageBatchRepository.delete({
            batch: {
                id: batchId,
            }
        });

        if (deleteResponse.affected !== 0) {
            const batchRepository = dataSource.getRepository(Batch);

            await batchRepository.update({
                id: batchId,
            }, { sent: true });

            return { response: { message: 'Lote deletado' }, httpCode: 200 }
        } else {
            return { response: { message: 'Lote não existente' }, httpCode: 403 }
        }

    },

    async status(instanceId: number) {
        await AutoSenderService.create(instanceId);
        try {
            const instance = autosenderIntances.get(instanceId);
            return !!instance!.active; // Retorna o status atual do serviço de envio automático

        } catch (error) {
            return false;
        }

    },

    async listBatchMessagesByInstance(instanceId: number) {
        const messageBatchRepository = dataSource.getRepository(MessageBatch);

        const messagesBatch = await messageBatchRepository.find({
            where: {
                batch: {
                    instance: { id: instanceId }
                }
            },
            select: ['id', 'message', 'number']
        });

        if (messagesBatch.length > 0) {
            return messagesBatch
        } else {
            return false;
        }
    },

    async listBatchMessagesByBatch(batchId: number) {
        const messageBatchRepository = dataSource.getRepository(MessageBatch);

        const messagesBatch = await messageBatchRepository.find({
            where: {
                batch: {
                    id: batchId,
                }
            },
            select: ['id', 'message', 'number']
        });

        if (messagesBatch.length > 0) {
            return messagesBatch
        } else {
            return false;
        }
    },


    isWithinTimeRange(currentTime: number, timeRange: TimeRange): boolean {
        const { start, end } = timeRange;
        let startTime = parseInt(start.replace(/\D/g, ""));
        let endTime = parseInt(end.replace(/\D/g, ""));

        return currentTime >= startTime && currentTime < endTime;
    },

    isCurrentDayValid(currentDay: number, validDays: number[]): boolean {
        return validDays.includes(currentDay);
    }




}

export default AutoSenderService;