"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_1 = __importDefault(require("qrcode"));
const data_source_1 = __importDefault(require("../data-source"));
const Message_1 = __importDefault(require("../models/Message"));
const Instance_1 = __importDefault(require("../models/Instance"));
const InstanceService_1 = __importDefault(require("./InstanceService"));
const WebHook_1 = require("./WebHook");
const MainServices_1 = require("../services/MainServices");
const wppManagerInstances = new Map();
const WhatsAppManager = {
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
            const destroyResponse = await wppClient.destroy();
            if (destroyResponse === true) {
                wppManagerInstances.delete(instanceId);
                return { response: { message: `Sessão ${instanceId} fechada` }, httpCode: 200 };
            }
            else {
                return { response: { message: `Não foi possível fechar instancia ${instanceId}` }, httpCode: 403 };
            }
        });
    },
    async forceDestroy(instanceId) {
        return await WhatsAppManager.verifyInstance(instanceId, async () => {
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
            console.log("<< CRIANDO INSTANCIA >>");
            const instance = wppManagerInstances.get(instanceId);
            const instanceRepository = data_source_1.default.getRepository(Instance_1.default);
            const selectedInstance = await instanceRepository.findOne({
                where: {
                    id: instanceId
                },
                relations: ['client']
            });
            const client = selectedInstance.client;
            const wppClient = instance.wppClient;
            wppClient.on('qr', (qr) => {
                qrcode_1.default.toDataURL(qr, (_) => {
                    instance.qrCode = qr;
                    if (!!client.hook_url === true) {
                        (0, WebHook_1.WebHook)(client.hook_url, {
                            qrcode: qr,
                            status: 'success',
                            method: 'qrCode'
                        });
                    }
                });
            });
            wppClient.on('disconnected', async () => {
                console.log("<< DISCONECTADO >>");
                await WhatsAppManager.close(instanceId);
                await WhatsAppManager.inicialize(instanceId);
                if (!!client.hook_url === true) {
                    (0, WebHook_1.WebHook)(client.hook_url, {
                        disconnect: true,
                        method: 'disconnected'
                    });
                }
            });
            wppClient.on('ready', async () => {
                instance.qrCode = "";
                InstanceService_1.default.initTrigger(instanceId);
                console.log("READY!");
                if (!!client.hook_url === true) {
                    (0, WebHook_1.WebHook)(client.hook_url, {
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
        try {
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
        }
        catch (error) {
            console.log(error);
            return { response: { status: "ERROR" }, httpCode: 403 };
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
                    insert_timestamp: (0, MainServices_1.localDate)().toString(),
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
