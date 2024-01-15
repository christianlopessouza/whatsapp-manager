




import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import dataSource from '../data-source';
import Message from '../models/Message';
import InstanceService from './InstanceService';
import { DefaultResponse } from '../services/MainServices';


const intances: Map<number, WhatsAppInstance> = new Map();

interface WhatsAppInstance {
    wppClient: Client;
    qrCode?: string;
}

const WhatsAppManager = {
    create(instanceId: number) {
        if (!intances.has(instanceId)) {
            const client = new Client({
                puppeteer: {
                    headless: true,
                    args: ['--no-sandbox'],
                },
                authStrategy: new LocalAuth({ clientId: instanceId.toString() })

            });

            intances.set(instanceId, { wppClient: client });
            return true;
        } else {
            return false;
        }
    },

    async close(instanceId: number): Promise<DefaultResponse> {
        return await WhatsAppManager.verifyInstance(instanceId, async (instance) => {

            const wppClient = instance?.wppClient;

            wppClient.destroy();

            intances.delete(instanceId);

            return { response: { message: `Sessão ${instanceId} fechada` }, httpCode: 200 };
        })
    },

    async restart(instanceId: number): Promise<DefaultResponse> {
        return await WhatsAppManager.verifyInstance(instanceId, async () => {

            WhatsAppManager.close(instanceId);
            await WhatsAppManager.inicialize(instanceId);

            return { response: { message: `Sessão ${instanceId} reinicializada` }, httpCode: 200 };
        })
    },


    async inicialize(instanceId: number): Promise<DefaultResponse> {
        const createStatus = WhatsAppManager.create(instanceId);

        if (createStatus === true) {
            const instance = intances.get(instanceId);

            const wppClient = instance!.wppClient;

            wppClient.on('qr', (qr) => {
                qrcode.toDataURL(qr, _ => {
                    instance!.qrCode = qr;
                    console.log(qr);

                    // this.webhookHandler({ _id: this.profile_name, qrcode: qrcode, method: "qrcode-set" });
                });
            });

            wppClient.on('disconnected', async () => {
                WhatsAppManager.close(instanceId)
                await WhatsAppManager.inicialize(instanceId)
            })

            wppClient.on('ready', async () => {
                instance!.qrCode = "";
                InstanceService.initTrigger(instanceId);


                // this.webhookHandler({ _id: this.profile_name, status: true, status_code: 4, method: "session_status" });
            });

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
        return await WhatsAppManager.verifyInstance(instanceId, async (instance) => {
            if (!!instance.qrCode === true) {
                return { response: { status: 'QRCODE_SCANN' }, httpCode: 200 };
            } else {
                const wppClient = instance?.wppClient;

                let status: any = await wppClient.getState();
                console.log(status);

                if (!!status === true) {
                    return { response: { status: status }, httpCode: 200 };
                } else {
                    return { response: { status: "OFF" }, httpCode: 200 };
                }
            }
        })
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
        const instance = intances.get(instanceId);
        if (instance !== undefined) {
            return callback(instance);
        } else {
            return { response: { message: 'Instancia não inicializada' }, httpCode: 403, errorCode: 'ER002' };
        }
    }
}


export default WhatsAppManager;