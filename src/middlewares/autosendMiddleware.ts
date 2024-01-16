
import { AutosendInstance, TimeRange } from '../autosender-preset';
import dataSource from '../data-source';
import Autosender from '../models/Autosender';
import { DefaultResponse } from '../services/MainServices';
import WhatsAppManager from '../services/WhatsAppManager'



function isWithinTimeRange(currentTime: number, timeRange: TimeRange): boolean {
    const { start, end } = timeRange;
    let startTime = parseInt(start.replace(/\D/g, ""));
    let endTime = parseInt(end.replace(/\D/g, ""));
    console.log(currentTime, startTime, endTime)

    return currentTime >= startTime && currentTime < endTime;
}

function isCurrentDayValid(currentDay: number, validDays: number[]): boolean {
    return validDays.includes(currentDay);
}


const checkAutosendMiddleware = async (instance: AutosendInstance, instanceId: number, action: () => Promise<DefaultResponse>) => {
    const now = new Date();
    const currentTime = parseInt(now.getHours().toString() + '' + now.getMinutes().toString());
    const currentDay = now.getDay();

    const isTimeValid = isWithinTimeRange(currentTime, instance.time);
    const isDayValid = isCurrentDayValid(currentDay, instance.days);

    const autosenderRepository = dataSource.getRepository(Autosender);

    const wppInstanceConnection = await WhatsAppManager.connectionStatus(instanceId);

    const wppSessionActive = wppInstanceConnection.response.status === 200;



    if (isTimeValid && isDayValid && instance.active && wppSessionActive) {
        if (instance.active !== true) {
            instance!.active = true;
            await autosenderRepository.update({ id: instanceId }, { active: true });
        }

        return action();
    } else {

        if (!!instance.active === false) {
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

