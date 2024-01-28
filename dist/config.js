"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILE_FORMAT = exports.APP_DIR = exports.GATEWAY = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const environment = process.env.NODE_ENV || 'development';
dotenv_1.default.config({ path: `.env${environment !== 'development' ? `.${environment}` : ''}` });
exports.PORT = parseInt(process.env.PORT) || 3000;
exports.GATEWAY = process.env.GATEWAY || '0.0.0.0';
exports.APP_DIR = process.env.APP_DIR;
exports.FILE_FORMAT = process.env.FILE_FORMAT;
// Adicione outras variáveis de ambiente conforme necessário
