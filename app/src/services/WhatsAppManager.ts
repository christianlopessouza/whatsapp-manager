import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import dataSource from '../data-source';
import Message from '../models/Message';
import Instance from '../models/Instance';
import InstanceService from './InstanceService';
import { DefaultResponse } from '../services/MainServices';
import { WebHook } from './WebHook';


const wppManagerInstances: Map<number, WhatsAppInstance> = new Map();

interface WhatsAppInstance {
    wppClient: Client;
    qrCode?: string;
}

const WhatsAppManager = {
    create(instanceId: number) {
        if (!wppManagerInstances.has(instanceId)) {
            const client = new Client({
                puppeteer: {
                    headless: true,
                    args: ['--no-sandbox'],
                },
                authStrategy: new LocalAuth({ clientId: instanceId.toString() })

            });

            wppManagerInstances.set(instanceId, { wppClient: client });
            return true;
        } else {
            return false;
        }
    },

    async close(instanceId: number): Promise<DefaultResponse> {
        return await WhatsAppManager.verifyInstance(instanceId, async (instance) => {
            console.log("miroslav")
            const wppClient = instance?.wppClient;

            const destroyResponse = await wppClient.destroy();

            if (destroyResponse === true) {
                wppManagerInstances.delete(instanceId);
                return { response: { message: `Sessão ${instanceId} fechada` }, httpCode: 200 };
            } else {
                return { response: { message: `Não foi possível fechar instancia ${instanceId}` }, httpCode: 403 };
            }

        })
    },

    async forceDestroy(instanceId: number): Promise<DefaultResponse> {
        return await WhatsAppManager.verifyInstance(instanceId, async () => {
            wppManagerInstances.delete(instanceId);
            return { response: { message: `Sessão ${instanceId} fechada` }, httpCode: 200 };
        })
    },

    async restart(instanceId: number): Promise<DefaultResponse> {
        return await WhatsAppManager.verifyInstance(instanceId, async () => {
            await WhatsAppManager.close(instanceId);
            await WhatsAppManager.inicialize(instanceId);

            return { response: { message: `Sessão ${instanceId} reinicializada` }, httpCode: 200 };
        })
    },

    async disconnect(instanceId: number): Promise<DefaultResponse> {
        return await WhatsAppManager.verifyInstance(instanceId, async (instance) => {
            const wppClient = instance?.wppClient;

            await wppClient.logout();
            await WhatsAppManager.close(instanceId);
            await WhatsAppManager.inicialize(instanceId);
            console.log("<< COMANDO DE RESET >>")
            return { response: { message: `Sessão ${instanceId} desconectada` }, httpCode: 200 };
        })
    },


    async inicialize(instanceId: number): Promise<DefaultResponse> {
        const createStatus = WhatsAppManager.create(instanceId);

        if (createStatus === true) {
            console.log("<< CRIANDO INSTANCIA >>");

            const instance = wppManagerInstances.get(instanceId);

            const instanceRepository = dataSource.getRepository(Instance);

            const selectedInstance = await instanceRepository.findOne({
                where: {
                    id: instanceId
                },
                relations: ['client']
            })

            const client = selectedInstance!.client;

            const wppClient = instance!.wppClient;

            wppClient.on('qr', (qr) => {
                qrcode.toDataURL(qr, (_) => {
                    instance!.qrCode = qr;

                    if (!!client.hook_url === true) {
                        WebHook(client.hook_url, {
                            qrcode: qr,
                            status: 'success',
                            method: 'qrCode'
                        });
                    }
                });
            });

            wppClient.on('disconnected', async () => {
                await WhatsAppManager.close(instanceId)
                await WhatsAppManager.inicialize(instanceId)
            })

            wppClient.on('ready', async () => {
                instance!.qrCode = "";
                InstanceService.initTrigger(instanceId);

                if (!!client.hook_url === true) {
                    WebHook(client.hook_url, {
                        connected: true,
                        status: 'success',
                        method: 'connected'
                    });
                }
            });

            // setTimeout(async () => {
            //     const instanceConnection = await WhatsAppManager.connectionStatus(instanceId);
            //     const status = instanceConnection.response.status;
            //     console.log("realizando validação:");
            //     if (status === 'LOADING' || status === 'ERROR') {
            //         await WhatsAppManager.restart(instanceId);
            //         await WhatsAppManager.inicialize(instanceId);
            //     }
            //     console.log(instanceConnection);
            // }, 40000);

            wppClient.initialize();

            return { response: { message: `Instancia ${instanceId} iniciada` }, httpCode: 200 };
        } else {
            return { response: { message: 'Instancia já inicializada' }, httpCode: 403, errorCode: 'ER005' };
        }
    },

    async qrcode(instanceId: number): Promise<DefaultResponse> {
        return await WhatsAppManager.verifyInstance(instanceId, async (instance) => {
            if (!!instance.qrCode === true) {
                return { response: { qrcode: instance.qrCode }, httpCode: 200 }
            } else {
                return { response: { message: 'QrCode não gerado ainda' }, httpCode: 403, errorCode: 'ER001' };
            }

        })
    },

    async connectionStatus(instanceId: number): Promise<DefaultResponse> {
        try {
            const instance = wppManagerInstances.get(instanceId);

            if (!!instance === false) {
                return { response: { status: 'OFF' }, httpCode: 200 };
            } else if (!!instance.qrCode === true) {
                return { response: { status: 'QRCODE_SCANN' }, httpCode: 200 };
            } else {
                const wppClient = instance?.wppClient;

                let status: any = await wppClient.getState();

                if (!!status === true) {
                    return { response: { status: status }, httpCode: 200 };
                } else {
                    return { response: { status: "LOADING" }, httpCode: 200 };
                }
            }
        } catch (error) {
            console.log(error)
            return { response: { status: "ERROR" }, httpCode: 403 };
        }
    },

    async sendMessage(instanceId: number, message: string, number: string): Promise<DefaultResponse> {
        return await WhatsAppManager.verifyInstance(instanceId, async (instance) => {

            const connectionResponse = await WhatsAppManager.connectionStatus(instanceId);

            if (connectionResponse.response.status === 'CONNECTED') {
                // envia
                const wppClient = instance?.wppClient;

                const messageRepository = dataSource.getRepository(Message);

                let dataParams = {
                    message: message,
                    number: number,
                    instance: { id: instanceId },
                    insert_timestamp: new Date(),
                    sent: false,
                }

                let numberId = (number.length >= 10 && number.length <= 13) ? await wppClient.getNumberId(number) : false;

                if (!!numberId === true) {
                    try {
                        await wppClient.sendMessage(numberId._serialized, message);

                        dataParams.sent = true;
                        const newMessage = messageRepository.create(dataParams);
                        const savedMessage = await messageRepository.save(newMessage);
                        return { response: { message: 'Mensagem enviada', messageId: savedMessage.id, number: number }, httpCode: 200 };

                    } catch (error) {
                        const newMessage = messageRepository.create(dataParams);
                        await messageRepository.save(newMessage);

                        return { response: { message: 'Mensagem não enviada', number: number }, httpCode: 403, errorCode: 'ER007' };
                    }
                } else {
                    const newMessage = messageRepository.create(dataParams);
                    await messageRepository.save(newMessage);

                    return { response: { message: 'Número Inválido', number: number }, httpCode: 403, errorCode: 'ER007' };
                }

            } else {
                return { response: { message: 'Não foi possível estabelecer sessão' }, httpCode: 403, errorCode: 'ER006' };
            }

        })
    },

    async verifyInstance(instanceId: number, callback: (instance: WhatsAppInstance) => Promise<DefaultResponse>): Promise<DefaultResponse> {
        const instance = wppManagerInstances.get(instanceId);
        if (instance !== undefined) {
            return callback(instance);
        } else {
            return { response: { message: 'Instancia não inicializada' }, httpCode: 403, errorCode: 'ER002' };
        }
    }
}


export default WhatsAppManager;