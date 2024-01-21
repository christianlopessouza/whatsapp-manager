import Instance from "../models/Instance";
import Client from "../models/Client";
import { Request } from "express";

export function delay(seconds: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
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



