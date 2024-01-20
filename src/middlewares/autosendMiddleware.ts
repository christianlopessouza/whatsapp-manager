
import { AutosendInstance, TimeRange } from '../autosender-preset';
import { DefaultResponse } from '../services/MainServices';
import WhatsAppManager from '../services/WhatsAppManager'
import AutoSenderService from '../services/AutoSenderService'


const checkAutosendMiddleware = async (autosendInstance: AutosendInstance, instanceId: number, action: () => Promise<DefaultResponse>) => {
    const now = new Date();
    const currentTime = parseInt(now.getHours().toString() + '' + now.getMinutes().toString());
    const currentDay = now.getDay();

    const isTimeValid = AutoSenderService.isWithinTimeRange(currentTime, autosendInstance.time);
    const isDayValid = AutoSenderService.isCurrentDayValid(currentDay, autosendInstance.days);

    const wppInstanceConnection = await WhatsAppManager.connectionStatus(instanceId);
    const wppSessionActive = wppInstanceConnection.response.status === 'CONNECTED';

    if (isTimeValid && isDayValid && autosendInstance.active && wppSessionActive) {
        return action();
    } else {

        if (!!autosendInstance.active === false) {
            return { response: { message: 'Serviço Pausado' }, httpCode: 403, errorCode: 'ER010' }
        } else if (!!isTimeValid === false) {
            return { response: { message: 'Horário Inválido' }, httpCode: 403, errorCode: 'ER008' }
        } else if (!!isDayValid === false) {
            return { response: { message: 'Fora do dia' }, httpCode: 403, errorCode: 'ER007' }
        }

        return { response: { message: 'Erro interno do servidor' }, httpCode: 500 }
    }

};

// async (instanceId: number, action: () => void): Promise<{ response: any, httpCode: number, errorCode?: string }>

export { checkAutosendMiddleware }

