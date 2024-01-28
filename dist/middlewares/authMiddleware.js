"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const Client_1 = __importDefault(require("../models/Client"));
const data_source_1 = __importDefault(require("../data-source"));
const authenticateToken = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token)
        return res.status(401).json({ message: 'Token não fornecido' });
    const key = token.replace('Bearer ', '');
    try {
        const client = await checkKeyExists(key);
        if (!!client === false) {
            return res.status(403).json({ message: 'Chave inválida' });
        }
        // Retorna as informações do usuário encontradas no banco de dados
        req.client = client;
        next();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.authenticateToken = authenticateToken;
const checkKeyExists = async (key) => {
    const clientRepository = data_source_1.default.getRepository(Client_1.default);
    try {
        const client = await clientRepository.findOne({ where: { token: key } });
        return client;
    }
    catch (error) {
        return undefined;
    }
};
