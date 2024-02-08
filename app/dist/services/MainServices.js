"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.localDate = exports.delay = void 0;
const luxon_1 = require("luxon");
function delay(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
}
exports.delay = delay;
function localDate(date = null) {
    // Criar uma instância de Date para obter a data atual
    return luxon_1.DateTime.local().setZone('America/Sao_Paulo');
}
exports.localDate = localDate;
function errorHandler() {
}
exports.errorHandler = errorHandler;
