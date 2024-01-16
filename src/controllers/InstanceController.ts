import { Request, Response } from 'express';
import dataSource from '../data-source';
import Instance from '../models/Instance';
import WhatsAppManager from '../services/WhatsAppManager';
import AutoSenderService from '../services/AutoSenderService';
import { DefaultResponse } from '../services/MainServices';




export default {
    async create(request: Request, response: Response) {
        try {

            const selectedInstance = (request as any).instance;


            if (!!selectedInstance === false) {
                const { name } = request.params;
                const client = (request as any).client;

                const instanceRepository = dataSource.getRepository(Instance);

                const newInstance = instanceRepository.create({
                    name: name,
                    client: { id: client.id },
                    insert_timestamp: new Date()
                });

                await instanceRepository.save(newInstance);
                return response.status(201).json(newInstance);

            } else {
                return response.status(403).json({ message: 'Instancia já existente para este cliente' });
            }

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });

        }

    },

    async start(request: Request, response: Response) {
        try {
            // aqui vai inicializar o sistema
            const instance = (request as any).instance;

            if (!!instance === true) {
                const inicializeResponse = await WhatsAppManager.inicialize(instance.id);

                return response.status(inicializeResponse.httpCode).json(inicializeResponse.response);

            } else {
                return response.status(403).json({ message: 'Instancia não existente' });

            }

        } catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });

        }
    },

    async restart(request: Request, response: Response) {
        try {
            // aqui vai inicializar o sistema
            const instance = (request as any).instance;

            if (!!instance === true) {
                const inicializeResponse = await WhatsAppManager.restart(instance.id);

                return response.status(inicializeResponse.httpCode).json(inicializeResponse.response);

            } else {
                return response.status(403).json({ message: 'Instancia não existente' });

            }

        } catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });

        }
    },

    async disconnect(request: Request, response: Response) {
        try {
            // aqui vai inicializar o sistema
            const instance = (request as any).instance;

            if (!!instance === true) {
                const inicializeResponse = await WhatsAppManager.close(instance.id);

                return response.status(inicializeResponse.httpCode).json(inicializeResponse.response);

            } else {
                return response.status(403).json({ message: 'Instancia não existente' });

            }

        } catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });

        }
    },

    async qrcode(request: Request, response: Response) {
        const instance = (request as any).instance;

        try {
            const qrCodeResponse = await WhatsAppManager.qrcode(instance.id);
            return response.status(qrCodeResponse.httpCode).json(qrCodeResponse.response);

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async connectionStatus(request: Request, response: Response) {
        const instance = (request as any).instance;

        try {
            const connectionResponse = await WhatsAppManager.connectionStatus(instance.id);
            return response.status(connectionResponse.httpCode).json(connectionResponse.response);

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async sendMessage(request: Request, response: Response) {
        const instance = (request as any).instance;
        const { message, number } = request.body;

        console.log(request.body)
        try {
            const sendResponse = await WhatsAppManager.sendMessage(instance.id, message, number);
            return response.status(sendResponse.httpCode).json(sendResponse.response);

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },


    async addBatch(request: Request, response: Response) {
        try {
            const { messages }: { messages: { number: string, message: string }[] } = request.body;
            // aqui vai inicializar o sistema
            const instance = (request as any).instance;
            if (!!instance === true) {
                if (messages.length > 0) {


                    
                } else {
                    return response.status(403).json({ message: 'Nenhuma mensagem enviada' });
                }
            } else {
                return response.status(403).json({ message: 'Instancia não existente' });

            }

        } catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }


    },

    deleteBatch() {

    },

    resumeBatchSender() {

    },

    pauseBatchSender() {

    },

    listOpenBatches() {

    },

    listMessageBatch() {

    },

    async startAutosender(request: Request, response: Response) {
        const instance = (request as any).instance;

        const startResponse = await WhatsAppManager.verifyInstance(instance.id, async () => {
            return await AutoSenderService.start(instance.id);
        })

        response.status(startResponse.httpCode).json(startResponse.response);

    },

    pauseAutosender(request: Request, response: Response) {

    }


}