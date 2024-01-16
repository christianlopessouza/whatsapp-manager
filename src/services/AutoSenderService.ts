
import dataSource from '../data-source';
import Autosender from '../models/Autosender';
import MessageBatch from '../models/MessageBatch';
import { AutosendInstance, defaultConfigAutosend } from '../autosender-preset';
import { checkAutosendMiddleware } from '../middlewares/autosendMiddleware';
import WhatsAppManager from './WhatsAppManager';
import BatchHistory from '../models/BatchHistory';
import Batch from '../models/Batch';
import { delay } from '../services/MainServices';



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
                    }
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

    async disable(instanceId: number): Promise<void> {
        await AutoSenderService.create(instanceId);

        const instance = autosenderIntances.get(instanceId);
        instance!.active = false;

        const autosenderRepository = dataSource.getRepository(Autosender);
        await autosenderRepository.update({ id: instanceId }, { active: false });

    },


    async start(instanceId: number): Promise<{ response: any, httpCode: number }> {
        await AutoSenderService.create(instanceId);

        try {
            return await AutoSenderService.turnOnSend(instanceId);

        } catch (error) {
            return { response: { message: 'Erro interno do servidor' }, httpCode: 500 }
        }

    },

    async turnOnSend(instanceId: number): Promise<{ response: any; httpCode: number; }> {
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

            return { response: { message: 'Lote enviado' }, httpCode: 200 }
            
        } catch (error) {
            return { response: { message: 'Erro interno do servidor' }, httpCode: 500 }
        }


    }



}

export default AutoSenderService;