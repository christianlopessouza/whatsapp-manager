"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfigAutosend = void 0;
const defaultConfigAutosend = {
    time: {
        start: '09:00',
        end: '19:00'
    },
    shootingTimer: {
        min: 15,
        max: 30
    },
    active: true,
    days: [0, 1, 2, 3, 4, 5, 6],
    stopRun: false
};
exports.defaultConfigAutosend = defaultConfigAutosend;
