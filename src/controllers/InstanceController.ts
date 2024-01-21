import { Request, Response } from 'express';
import dataSource from '../data-source';
import Instance from '../models/Instance';
import WhatsAppManager from '../services/WhatsAppManager';
import AutoSenderService from '../services/AutoSenderService';
import InstanceService from '../services/InstanceService';
import { ExtendedRequest, MessageBatchArray } from '../services/MainServices';





const InstanceController = {
    async create(request: ExtendedRequest, response: Response) {
        try {
            const { name } = request.params;
            const client = request.client!;
            const createResponse = await InstanceService.create(name, client.id);

            if (createResponse === false) {
                return response.status(403).json({ message: 'Instancia já existente' });
            } else {
                return response.status(200).json({ message: 'Instancia Criada' });
            }

        } catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async start(request: ExtendedRequest, response: Response) {
        try {
            const instance = request.instance!;

            const startResponse = await WhatsAppManager.inicialize(instance.id);
            return response.status(startResponse.httpCode).json(startResponse.response);

        } catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });

        }
    },

    async restart(request: ExtendedRequest, response: Response) {
        try {
            const instance = request.instance!;

            const restartResponse = await WhatsAppManager.restart(instance.id);
            return response.status(restartResponse.httpCode).json(restartResponse.response);

        } catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });

        }
    },

    async disconnect(request: ExtendedRequest, response: Response) {
        try {
            const instance = request.instance!;

            const disconnectResponse = await WhatsAppManager.restart(instance.id);
            return response.status(disconnectResponse.httpCode).json(disconnectResponse.response);

        } catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });

        }
    },

    async qrcode(request: ExtendedRequest, response: Response) {
        try {
            const instance = request.instance!;

            const qrCodeResponse = await WhatsAppManager.verifyInstance(instance.id, async () => {
                return await WhatsAppManager.qrcode(instance.id);
            })

            return response.status(qrCodeResponse.httpCode).json(qrCodeResponse.response);

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async connectionStatus(request: ExtendedRequest, response: Response) {
        try {
            const instance = request.instance!;

            const connectionResponse = await WhatsAppManager.verifyInstance(instance.id, async () => {
                return await WhatsAppManager.connectionStatus(instance.id);
            })

            return response.status(connectionResponse.httpCode).json(connectionResponse.response);

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async sendMessage(request: ExtendedRequest, response: Response) {
        try {
            const instance = request.instance!;
            const { message, number } = request.body;

            const sendResponse = await WhatsAppManager.verifyInstance(instance.id, async () => {
                return await WhatsAppManager.sendMessage(instance.id, message, number);
            })

            return response.status(sendResponse.httpCode).json(sendResponse.response);

        } catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },


    async addBatch(request: ExtendedRequest, response: Response) {
        try {
            const { messages } = request.body;
            const instance = request.instance!;

            if (messages.length > 0) {
                const batchResponse = InstanceService.addBatch(instance.id, messages);
                return response.status(batchResponse.httpCode).json(batchResponse.response);

            } else {
                return response.status(403).json({ message: 'Nenhuma mensagem enviada' });
            }


        } catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }


    },

    deleteBatch() {

    },

    listPendingBatches() {

    },

    hooks(){

    },


    async pauseAutosender(request: ExtendedRequest, response: Response) {
        try {
            const instance = request.instance!;

            const pauseResponse = await WhatsAppManager.verifyInstance(instance.id, async () => {
                return await AutoSenderService.stop(instance.id);
            })

            response.status(pauseResponse.httpCode).json(pauseResponse.response);
        } catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });

        }
    },

    async startAutosender(request: ExtendedRequest, response: Response) {
        try {
            const instance = request.instance!;

            const startResponse = await WhatsAppManager.verifyInstance(instance.id, async () => {
                return await AutoSenderService.start(instance.id);
            })

            response.status(startResponse.httpCode).json(startResponse.response);
        } catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }

    },

    async enable(request: ExtendedRequest, response: Response) {
        try {
            const { name } = request.params;
            const client = request.client!;

            const instanceRepository = dataSource.getRepository(Instance);

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
            } else {
                await instanceRepository.update({ id: selectedInstance.id }, { enabled: true });
                return response.status(403).json({ message: 'Instancia ativada' });
            }
        } catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }

    },

    async disable(request: Request, response: Response) {
        try {

            const { name } = request.params;
            const client = (request as any).client;

            const instanceRepository = dataSource.getRepository(Instance);

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
            } else {
                await WhatsAppManager.close(selectedInstance.id);
                await AutoSenderService.stop(selectedInstance.id);

                await instanceRepository.update({ id: selectedInstance.id }, { enabled: false });
                return response.status(403).json({ message: 'Instancia desativada' });
            }
        } catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

}

export default InstanceController;