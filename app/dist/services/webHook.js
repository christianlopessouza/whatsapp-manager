"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebHook = void 0;
const axios_1 = __importDefault(require("axios"));
// Enviar solicitação POST com os dados JSON
const WebHook = (url, data) => {
    axios_1.default.post(url, data)
        .then((res) => {
        //console.log(res)
    })
        .catch((err) => {
        console.error(err.toJSON());
    });
};
exports.WebHook = WebHook;
