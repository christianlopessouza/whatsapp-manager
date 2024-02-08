import Instance from "../models/Instance";
import Client from "../models/Client";
import { Request } from "express";
import { DateTime } from 'luxon';


export function delay(seconds: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
}

export function localDate(date: string | Date | number | null = null): DateTime {
    // Criar uma instância de Date para obter a data atual
    return DateTime.local().setZone('America/Sao_Paulo');
}

export interface DefaultResponse {
    response: any,
    httpCode: number,
    errorCode?: string
}

export interface ExtendedRequest extends Request {
    instance?: Instance;
    client?: Client
}

export function errorHandler() {

}

export interface MessageBatchArray {
    number: string,
    message: string,
}



