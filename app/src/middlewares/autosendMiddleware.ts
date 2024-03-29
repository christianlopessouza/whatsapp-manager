
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

        console.log(currentTime,autosendInstance.time, "<< CLOCK");
        const isTimeValid = AutoSenderService.isWithinTimeRange(currentTime, autosendInstance.time);
        const isDayValid = AutoSenderService.isCurrentDayValid(currentDay, autosendInstance.days);

        let wppSessionActive: boolean = false;

        const wppInstanceConnection = await WhatsAppManager.connectionStatus(instanceId);
        wppSessionActive = wppInstanceConnection.response.status === 'CONNECTED';


        if (!!autosendInstance.active === false) {
            console.log('Serviço Pausado');

            return { response: { message: 'Serviço Pausado' }, httpCode: 403, errorCode: 'ER010' }
        } else if (!!isTimeValid === false) {
            console.log('Horário Inválido');

            AutoSenderService.stop(instanceId);
            return { response: { message: 'Horário Inválido' }, httpCode: 403, errorCode: 'ER008' }
        } else if (!!isDayValid === false) {
            console.log('Fora do dia');

            AutoSenderService.stop(instanceId);
            return { response: { message: 'Fora do dia' }, httpCode: 403, errorCode: 'ER007' }
        } else if (autosendInstance.stopRun === true) {
            console.log('Serviço interrompido');

            autosendInstance.stopRun = false;
            return { response: { message: 'Serviço interrompido' }, httpCode: 403, errorCode: 'ER007' }
        } else if (!!wppSessionActive === false) {
            console.log('Sessão Inativa');

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

