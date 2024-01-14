
import { AutosendInstance, TimeRange } from '../autosender-preset';



function isWithinTimeRange(currentHour: number, timeRange: TimeRange): boolean {
    const { start, end } = timeRange;
    const startTime = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);

    return currentHour >= startTime.getHours() && currentHour < endTime.getHours();
}

function isCurrentDayValid(currentDay: number, validDays: number[]): boolean {
    return validDays.includes(currentDay);
}


const checkAutosendTimeMiddleware = (instance: AutosendInstance, action:()=> { response: any, httpCode: number }) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    const isTimeValid = isWithinTimeRange(currentHour, instance.time);
    const isDayValid = isCurrentDayValid(currentDay, instance.days);

    if (isTimeValid && isDayValid) {
        return action();
    } else {
        if (!!isTimeValid === false) {
            return { response: { message: 'Horário Inválido' }, httpCode: 403, errorCode: 'ER008' }
        } else if (!!isDayValid === false) {
            return { response: { message: 'Fora do dia' }, httpCode: 403, errorCode: 'ER007' }
        }
        return { response: { message: 'Erro interno do servidor' }, httpCode: 500 }
    }

};

// async (instanceId: number, action: () => void): Promise<{ response: any, httpCode: number, errorCode?: string }>

export { checkAutosendTimeMiddleware }

