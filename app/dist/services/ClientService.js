"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = __importDefault(require("../data-source"));
const Client_1 = __importDefault(require("../models/Client"));
class ClientService {
    async findByColumn(column, value) {
        try {
            const validKeys = ['id', 'token']; // Defina as chaves válidas
            // Verifica se a chave fornecida é uma chave válida
            if (!validKeys.includes(column)) {
                throw new Error('Chave inválida');
            }
            const whereCondition = {};
            whereCondition[column] = value;
            // Obtém o repositório do usuário
            const clientRepository = data_source_1.default.getRepository(Client_1.default);
            // Consulta o banco de dados para encontrar o usuário correspondente à chave
            const client = await clientRepository.findOne({
                where: whereCondition,
                select: ['id', 'name'], // Especifique os campos que você deseja obter
            });
            if (!client) {
                // Se nenhum usuário for encontrado, pode lidar com isso de acordo com a lógica do seu aplicativo
                throw new Error('Usuário não encontrado para a chave fornecida');
            }
            return client;
        }
        catch (error) {
            console.error(`Erro ao obter cliente por ${column}:`, error);
            throw error;
        }
    }
}
exports.default = new ClientService();
