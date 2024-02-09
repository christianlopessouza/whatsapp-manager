
import { AutosendInstance } from '../autosender-preset';
import { DefaultResponse } from '../services/MainServices';
import WhatsAppManager from '../services/WhatsAppManager'
import AutoSenderService from '../services/AutoSenderService'
const timeZone = "America/Sao_Paulo";




const checkAutosendMiddleware = async (autosendInstance: AutosendInstance, instanceId: number, action: () => Promise<DefaultResponse>) => {
    try {


        const now = new Date(new Date().toLocaleString("en-US", { timeZone }));
        const currentTime: number = now.getHours() * 100 + now.getMinutes();
        const currentDay: number = now.getDay();

        const isTimeValid = AutoSenderService.isWithinTimeRange(currentTime, autosendInstance.time);
        const isDayValid = AutoSenderService.isCurrentDayValid(currentDay, autosendInstance.days);

        let wppSessionActive: boolean = false;

        const wppInstanceConnection = await WhatsAppManager.connectionStatus(instanceId);
        wppSessionActive = wppInstanceConnection.response.status === 'CONNECTED';

        console.log(wppSessionActive,"ESTADO DA SESSÃO");
        console.log(wppInstanceConnection.response.status);

        if (!!autosendInstance.active === false) {
            return { response: { message: 'Serviço Pausado' }, httpCode: 403, errorCode: 'ER010' }
        } else if (!!isTimeValid === false) {
            AutoSenderService.stop(instanceId);
            return { response: { message: 'Horário Inválido' }, httpCode: 403, errorCode: 'ER008' }
        } else if (!!isDayValid === false) {
            AutoSenderService.stop(instanceId);
            return { response: { message: 'Fora do dia' }, httpCode: 403, errorCode: 'ER007' }
        } else if (autosendInstance.stopRun === true) {
            autosendInstance.stopRun = false;
            return { response: { message: 'Serviço interrompido' }, httpCode: 403, errorCode: 'ER007' }
        } else if (!!wppSessionActive === false) {
            return { response: { message: 'Sessão Inativa' }, httpCode: 403, errorCode: 'ER011' }
        } else {
            return action();
        }

    } catch (error) {
        return { response: { message: 'Erro interno do servidor' }, httpCode: 500 }
    }

};

// async (instanceId: number, action: () => void): Promise<{ response: any, httpCode: number, errorCode?: string }>

export { checkAutosendMiddleware }

