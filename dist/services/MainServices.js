"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.delay = void 0;
function delay(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
}
exports.delay = delay;
function errorHandler() {
}
exports.errorHandler = errorHandler;
