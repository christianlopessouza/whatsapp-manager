
import dataSource from '../data-source';
import Autosender from '../models/Autosender';
import MessageBatch from '../models/MessageBatch';
import { AutosendInstance, defaultConfigAutosend, TimeRange } from '../autosender-preset';
import { checkAutosendMiddleware } from '../middlewares/autosendMiddleware';
import WhatsAppManager from './WhatsAppManager';
import BatchHistory from '../models/BatchHistory';
import Batch from '../models/Batch';
import { delay } from '../services/MainServices';
import { DefaultResponse } from '../services/MainServices';
import * as cron from 'node-cron';

cron.schedule('* * * * *', () => { AutoSenderService.timerVerifier() })

const autosenderIntances: Map<number, AutosendInstance> = new Map();

const AutoSenderService = {
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
                select: ['id', 'shooting_min', 'shooting_max', 'timer_start', 'timer_end', 'days']
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
                        AutoSenderService.start(id)
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
            await autosenderRepository.update({ id: instanceId }, { active: false });

            return { response: { message: 'Serviço parado' }, httpCode: 200 };
        } catch (error) {
            return { response: { message: 'Erro interno do servidor' }, httpCode: 500 }
        }

    },


    async start(instanceId: number): Promise<DefaultResponse> {
        await AutoSenderService.create(instanceId);

        try {
            const startReponse = await AutoSenderService.turnOnSend(instanceId);

            if (startReponse.httpCode == 200) {
                const instance = autosenderIntances.get(instanceId);
                instance!.active = true;

                const autosenderRepository = dataSource.getRepository(Autosender);
                await autosenderRepository.update({ id: instanceId }, { active: true });
            }
            
            return startReponse;

        } catch (error) {
            return { response: { message: 'Erro interno do servidor' }, httpCode: 500 }
        }

    },

    async turnOnSend(instanceId: number): Promise<DefaultResponse> {
        const instance = autosenderIntances.get(instanceId);

        return await checkAutosendMiddleware(instance!, instanceId, async () => {

            const messageBatchRepository = dataSource.getRepository(MessageBatch);

            const pendingMessages = await messageBatchRepository.find({
                where: {
                    batch: {
                        instance: {
                            id: instanceId
                        }
                    }
                },
                relations: ['batch'],
                select: ['id', 'message', 'number', 'batch.id' as keyof MessageBatch], // Correção aqui
                take: 100
            });

            if (pendingMessages.length > 0) {
                AutoSenderService.sendBatchMessages(instanceId, pendingMessages);
                return { response: { message: 'Serviço iniciado' }, httpCode: 200 };

            } else {
                return { response: { message: 'Todas mensagens enviadas' }, httpCode: 200 };

            }
        })

    },

    async sendBatchMessages(instanceId: number, batchMessages: MessageBatch[]): Promise<void> {
        await AutoSenderService.create(instanceId);

        const instance = autosenderIntances.get(instanceId);


        for (const message of batchMessages) {
            const timerVerifyer = await checkAutosendMiddleware(instance!, instanceId, async () => {
                try {
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

                    const delayInSeconds = Math.floor(Math.random() * instance!.shootingTimer.max) + instance!.shootingTimer.min;
                    await delay(delayInSeconds);

                    return { response: { message: 'Mensagem enviada' }, httpCode: 200 }
                } catch (error) {
                    return { response: { message: 'Erro interno do seridos' }, httpCode: 500 }
                }

            })

            if (timerVerifyer.httpCode !== 200) return;

        }

        AutoSenderService.turnOnSend(instanceId)
    },

    async addBatch(instaceId: number, messages: { number: string, message: string }[]) {
        try {
            const batchRepository = dataSource.getRepository(Batch)

            const newBatch = batchRepository.create({
                time: new Date(),
                sent: false,
                instance: {
                    id: instaceId,
                }
            });

            const { id: batchId } = await batchRepository.save(newBatch);

            for (const message of messages) {
                const messageBatchRepository = dataSource.getRepository(MessageBatch)

                const newMessageBatch = messageBatchRepository.create({
                    message: message.message,
                    number: message.number,
                    batch: {
                        id: batchId
                    }
                });
                await messageBatchRepository.save(newMessageBatch);
            }

            AutoSenderService.start(instaceId);

            return { response: { message: 'Lote enviado' }, httpCode: 200 }

        } catch (error) {
            return { response: { message: 'Erro interno do servidor' }, httpCode: 500 }
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