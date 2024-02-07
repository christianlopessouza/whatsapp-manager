"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAutosendMiddleware = void 0;
const WhatsAppManager_1 = __importDefault(require("../services/WhatsAppManager"));
const AutoSenderService_1 = __importDefault(require("../services/AutoSenderService"));
const timeZone = "America/Sao_Paulo";
const checkAutosendMiddleware = async (autosendInstance, instanceId, action) => {
    try {
        const now = new Date(new Date().toLocaleString("en-US", { timeZone }));
        const currentTime = now.getHours() * 100 + now.getMinutes();
        const currentDay = now.getDay();
        const isTimeValid = AutoSenderService_1.default.isWithinTimeRange(currentTime, autosendInstance.time);
        const isDayValid = AutoSenderService_1.default.isCurrentDayValid(currentDay, autosendInstance.days);
        let wppSessionActive = false;
        const wppInstanceConnection = await WhatsAppManager_1.default.connectionStatus(instanceId);
        wppSessionActive = wppInstanceConnection.response.status === 'CONNECTED';
        if (!!autosendInstance.active === false) {
            return { response: { message: 'Serviço Pausado' }, httpCode: 403, errorCode: 'ER010' };
        }
        else if (!!isTimeValid === false) {
            AutoSenderService_1.default.stop(instanceId);
            return { response: { message: 'Horário Inválido' }, httpCode: 403, errorCode: 'ER008' };
        }
        else if (!!isDayValid === false) {
            AutoSenderService_1.default.stop(instanceId);
            return { response: { message: 'Fora do dia' }, httpCode: 403, errorCode: 'ER007' };
        }
        else if (autosendInstance.stopRun === true) {
            autosendInstance.stopRun = false;
            return { response: { message: 'Serviço interrompido' }, httpCode: 403, errorCode: 'ER007' };
        }
        else if (!!wppSessionActive === false) {
            return { response: { message: 'Sessão Inativa' }, httpCode: 403, errorCode: 'ER011' };
        }
        else {
            return action();
        }
    }
    catch (error) {
        return { response: { message: 'Erro interno do servidor' }, httpCode: 500 };
    }
};
exports.checkAutosendMiddleware = checkAutosendMiddleware;
