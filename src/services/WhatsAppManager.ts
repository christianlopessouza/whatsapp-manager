




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
        }
    },

    destroy(instanceId: string){
        intances.delete(instanceId);    
    },

    restart(instanceId: string){
        WhatsAppManager.destroy(instanceId);
        WhatsAppManager.create(instanceId);
        WhatsAppManager.inicialize(instanceId);
    },

    logout(instanceId: string){
        const instance = intances.get(instanceId);
        if (instance !== undefined) {
            const wppClient = instance?.wppClient; 

            wppClient.destroy();

            return { message: `Sessão ${instanceId} desconectada`, httpCode: 200 };
        } else {
            return { message: 'Instancia não inicializada', httpCode: 403, errorCode: 'ER002' };

        }    
    },


    async inicialize(instanceId: string) {
        WhatsAppManager.create(instanceId);

        const instance = intances.get(instanceId);
        if (instance !== undefined) {
            const wppClient = instance?.wppClient;

            wppClient.on('qr', (qr) => {
                qrcode.toDataURL(qr, _ => {
                    instance.qrCode = qr;

                    // this.webhookHandler({ _id: this.profile_name, qrcode: qrcode, method: "qrcode-set" });
                });
            });

            wppClient.on('ready', async () => {
                // this.webhookHandler({ _id: this.profile_name, status: true, status_code: 4, method: "session_status" });
            });

            return { message: `Instancia ${instanceId} iniciada`, httpCode: 200 };
        } else {
            return { message: 'Instancia não inicializada', httpCode: 403, errorCode: 'ER002' };

        }
    },

    qrcode(instanceId: string) {
        WhatsAppManager.create(instanceId);

        const instance = intances.get(instanceId);

        if (instance !== undefined) {
            if (!!instance.qrCode === true) {
                return { qrcode: instance.qrCode, httpCode: 200 }
            } else {
                return { message: 'QrCode não gerado ainda', httpCode: 403, errorCode: 'ER001' };
            }
        } else {
            return { message: 'Instancia não inicializada', httpCode: 403, errorCode: 'ER002' };
        }
    },

    async connectionStatus(instanceId: string) {
        WhatsAppManager.create(instanceId);

        const instance = intances.get(instanceId);

        if (instance !== undefined) {
            const wppClient = instance?.wppClient;

            let status: any = await wppClient.getState();
            if (!!status) {
                if (!!instance.qrCode === true) {
                    status = 'QRCODE_SCANN';
                }
                return { status: status, httpCode: 200 };
            } else {
                return { status: "OFF", httpCode: 200 };

            }
        } else {
            return { message: 'Instancia não inicializada', httpCode: 403, errorCode: 'ER002' };
        }


    }
}


}

export default WhatsAppManager;