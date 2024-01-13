




import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode';

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

                console.log(wppClient)
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


    }
}


export default WhatsAppManager;