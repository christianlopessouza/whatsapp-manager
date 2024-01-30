"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_1 = __importDefault(require("qrcode"));
const data_source_1 = __importDefault(require("../data-source"));
const Message_1 = __importDefault(require("../models/Message"));
const InstanceService_1 = __importDefault(require("./InstanceService"));
const wppManagerInstances = new Map();
const WhatsAppManager = {
    get(instanceId) {
    },
    create(instanceId) {
        if (!wppManagerInstances.has(instanceId)) {
            const client = new whatsapp_web_js_1.Client({
                puppeteer: {
                    headless: true,
                    args: ['--no-sandbox'],
                },
                authStrategy: new whatsapp_web_js_1.LocalAuth({ clientId: instanceId.toString() })
            });
            wppManagerInstances.set(instanceId, { wppClient: client });
            return true;
        }
        else {
            return false;
        }
    },
    async close(instanceId) {
        return await WhatsAppManager.verifyInstance(instanceId, async (instance) => {
            const wppClient = instance === null || instance === void 0 ? void 0 : instance.wppClient;
            wppClient.destroy();
            wppManagerInstances.delete(instanceId);
            return { response: { message: `Sessão ${instanceId} fechada` }, httpCode: 200 };
        });
    },
    async restart(instanceId) {
        return await WhatsAppManager.verifyInstance(instanceId, async () => {
            await WhatsAppManager.close(instanceId);
            await WhatsAppManager.inicialize(instanceId);
            return { response: { message: `Sessão ${instanceId} reinicializada` }, httpCode: 200 };
        });
    },
    async disconnect(instanceId) {
        return await WhatsAppManager.verifyInstance(instanceId, async (instance) => {
            const wppClient = instance === null || instance === void 0 ? void 0 : instance.wppClient;
            await wppClient.logout();
            await WhatsAppManager.close(instanceId);
            await WhatsAppManager.inicialize(instanceId);
            return { response: { message: `Sessão ${instanceId} desconectada` }, httpCode: 200 };
        });
    },
    async inicialize(instanceId) {
        const createStatus = WhatsAppManager.create(instanceId);
        if (createStatus === true) {
            const instance = wppManagerInstances.get(instanceId);
            const wppClient = instance.wppClient;
            wppClient.on('qr', (qr) => {
                qrcode_1.default.toDataURL(qr, _ => {
                    instance.qrCode = qr;
                    // this.webhookHandler({ _id: this.profile_name, qrcode: qrcode, method: "qrcode-set" });
                });
            });
            wppClient.on('disconnected', async () => {
                await WhatsAppManager.close(instanceId);
                await WhatsAppManager.inicialize(instanceId);
            });
            wppClient.on('ready', async () => {
                instance.qrCode = "";
                InstanceService_1.default.initTrigger(instanceId);
                // this.webhookHandler({ _id: this.profile_name, status: true, status_code: 4, method: "session_status" });
            });
            wppClient.initialize();
            return { response: { message: `Instancia ${instanceId} iniciada` }, httpCode: 200 };
        }
        else {
            return { response: { message: 'Instancia já inicializada' }, httpCode: 403, errorCode: 'ER005' };
        }
    },
    async qrcode(instanceId) {
        return await WhatsAppManager.verifyInstance(instanceId, async (instance) => {
            if (!!instance.qrCode === true) {
                return { response: { qrcode: instance.qrCode }, httpCode: 200 };
            }
            else {
                return { response: { message: 'QrCode não gerado ainda' }, httpCode: 403, errorCode: 'ER001' };
            }
        });
    },
    async connectionStatus(instanceId) {
        const instance = wppManagerInstances.get(instanceId);
        if (!!instance === false) {
            return { response: { status: 'OFF' }, httpCode: 200 };
        }
        else if (!!instance.qrCode === true) {
            return { response: { status: 'QRCODE_SCANN' }, httpCode: 200 };
        }
        else {
            const wppClient = instance === null || instance === void 0 ? void 0 : instance.wppClient;
            let status = await wppClient.getState();
            if (!!status === true) {
                return { response: { status: status }, httpCode: 200 };
            }
            else {
                return { response: { status: "LOADING" }, httpCode: 200 };
            }
        }
    },
    async sendMessage(instanceId, message, number) {
        return await WhatsAppManager.verifyInstance(instanceId, async (instance) => {
            const connectionResponse = await WhatsAppManager.connectionStatus(instanceId);
            if (connectionResponse.response.status === 'CONNECTED') {
                // envia
                const wppClient = instance === null || instance === void 0 ? void 0 : instance.wppClient;
                const messageRepository = data_source_1.default.getRepository(Message_1.default);
                let dataParams = {
                    message: message,
                    number: number,
                    instance: { id: instanceId },
                    insert_timestamp: new Date(),
                    sent: false,
                };
                let numberId = (number.length >= 10 && number.length <= 13) ? await wppClient.getNumberId(number) : false;
                if (!!numberId === true) {
                    try {
                        await wppClient.sendMessage(numberId._serialized, message);
                        dataParams.sent = true;
                        const newMessage = messageRepository.create(dataParams);
                        const savedMessage = await messageRepository.save(newMessage);
                        return { response: { message: 'Mensagem enviada', messageId: savedMessage.id, number: number }, httpCode: 200 };
                    }
                    catch (error) {
                        const newMessage = messageRepository.create(dataParams);
                        await messageRepository.save(newMessage);
                        return { response: { message: 'Mensagem não enviada', number: number }, httpCode: 403, errorCode: 'ER007' };
                    }
                }
                else {
                    const newMessage = messageRepository.create(dataParams);
                    await messageRepository.save(newMessage);
                    return { response: { message: 'Número Inválido', number: number }, httpCode: 403, errorCode: 'ER007' };
                }
            }
            else {
                return { response: { message: 'Não foi possível estabelecer sessão' }, httpCode: 403, errorCode: 'ER006' };
            }
        });
    },
    async verifyInstance(instanceId, callback) {
        const instance = wppManagerInstances.get(instanceId);
        if (instance !== undefined) {
            return callback(instance);
        }
        else {
            return { response: { message: 'Instancia não inicializada' }, httpCode: 403, errorCode: 'ER002' };
        }
    }
};
exports.default = WhatsAppManager;
