




import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import dataSource from '../data-source';
import Message from '../models/Message';


const intances: Map<string, WhatsAppInstance> = new Map();

interface WhatsAppInstance {
    wppClient: Client;
    qrCode?: string;
}

const WhatsAppManager = {
    create(instanceId: string) {
        if (!intances.has(instanceId)) {
            const client = new Client({
                puppeteer: {
                    headless: true,
                    args: ['--no-sandbox'],
                }
            });

            intances.set(instanceId, { wppClient: client });
            return true;
        } else {
            return false;
        }
    },

    close(instanceId: string) {

        const instance = intances.get(instanceId);
        if (instance !== undefined) {
            const wppClient = instance?.wppClient;

            wppClient.destroy();

            intances.delete(instanceId);

            return { response: { message: `Sessão ${instanceId} fechada` }, httpCode: 200 };
        } else {
            return { response: { message: 'Instancia não inicializada' }, httpCode: 403, errorCode: 'ER002' };

        }
    },

    async restart(instanceId: string): Promise<{ response: any; httpCode: number; errorCode?: string; }> {

        const instance = intances.get(instanceId);

        if (instance !== undefined) {
            WhatsAppManager.close(instanceId);
            await WhatsAppManager.inicialize(instanceId);

            return { response: { message: `Sessão ${instanceId} reinicializada` }, httpCode: 200 };
        } else {

            return { response: { message: 'Instancia não inicializada' }, httpCode: 403, errorCode: 'ER002' };
        }

    },


    async inicialize(instanceId: string): Promise<{ response: any; httpCode: number; errorCode?: string; }> {
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
                console.log("READY TO WORK");
                instance!.qrCode = "";


                // this.webhookHandler({ _id: this.profile_name, status: true, status_code: 4, method: "session_status" });
            });

            wppClient.initialize();

            return { response: { message: `Instancia ${instanceId} iniciada` }, httpCode: 200 };
        } else {
            return { response: { message: 'Instancia já inicializada' }, httpCode: 403, errorCode: 'ER005' };
        }
    },

    qrcode(instanceId: string): { response: any; httpCode: number; errorCode?: string; } {
        const instance = intances.get(instanceId);

        if (instance !== undefined) {
            if (!!instance.qrCode === true) {
                return { response: { qrcode: instance.qrCode }, httpCode: 200 }
            } else {
                return { response: { message: 'QrCode não gerado ainda' }, httpCode: 403, errorCode: 'ER001' };
            }
        } else {
            return { response: { message: 'Instancia não inicializada' }, httpCode: 403, errorCode: 'ER002' };
        }
    },

    async connectionStatus(instanceId: string): Promise<{ response: any; httpCode: number; errorCode?: string; }> {
        const instance = intances.get(instanceId);

        if (instance !== undefined) {
            if (!!instance.qrCode === true) {
                return { response: { status: 'QRCODE_SCANN' }, httpCode: 200 };
            } else {
                const wppClient = instance?.wppClient;

                let status: any = await wppClient.getState();

                if (!!status === true) {
                    return { response: { status: status }, httpCode: 200 };
                } else {
                    return { response: { status: "OFF" }, httpCode: 200 };
                }
            }

        } else {
            return { response: { message: 'Instancia não inicializada' }, httpCode: 403, errorCode: 'ER002' };
        }
    },

    async sendMessage(instanceId: string, message: string, number: string): Promise<{ response: any; httpCode: number; errorCode?: string; }> {
        const instance = intances.get(instanceId);

        if (instance !== undefined) {
            const connectionResponse = await WhatsAppManager.connectionStatus(instanceId);

            if (connectionResponse.response.status === 'CONNECTED') {
                // envia
                const wppClient = instance?.wppClient;

                const messageRepository = dataSource.getRepository(Message);

                const dataParams = {
                    message: message,
                    number: number,
                    instance: { id: parseInt(instanceId) },
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

        } else {
            return { response: { message: 'Instancia não inicializada' }, httpCode: 403, errorCode: 'ER002' };

        }
    }
}


export default WhatsAppManager;