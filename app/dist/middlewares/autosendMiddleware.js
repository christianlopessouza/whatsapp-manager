"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAutosendMiddleware = void 0;
const WhatsAppManager_1 = __importDefault(require("../services/WhatsAppManager"));
const AutoSenderService_1 = __importDefault(require("../services/AutoSenderService"));
const checkAutosendMiddleware = async (autosendInstance, instanceId, action) => {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const currentDay = now.getDay();
    const isTimeValid = AutoSenderService_1.default.isWithinTimeRange(currentTime, autosendInstance.time);
    const isDayValid = AutoSenderService_1.default.isCurrentDayValid(currentDay, autosendInstance.days);
    let wppSessionActive = false;
    if (isTimeValid && isDayValid && autosendInstance.active) {
        const wppInstanceConnection = await WhatsAppManager_1.default.connectionStatus(instanceId);
        wppSessionActive = wppInstanceConnection.response.status === 'CONNECTED';
        if (!!wppSessionActive === true) {
            return action();
        }
    }
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
    else if (!!wppSessionActive === false) {
        return { response: { message: 'Sessão Inativa' }, httpCode: 403, errorCode: 'ER011' };
    }
    return { response: { message: 'Erro interno do servidor' }, httpCode: 500 };
};
exports.checkAutosendMiddleware = checkAutosendMiddleware;
