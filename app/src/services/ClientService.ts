import dataSource from '../data-source';
import Client from '../models/Client';

class ClientService {

    async findByColumn(column: string, value: string) {
        try {
            const validKeys = ['id', 'token']; // Defina as chaves válidas

            // Verifica se a chave fornecida é uma chave válida
            if (!validKeys.includes(column)) {
                throw new Error('Chave inválida');
            }

            const whereCondition: Record<string, string> = {};
            whereCondition[column] = value;

            // Obtém o repositório do usuário
            const clientRepository = dataSource.getRepository(Client);
            
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

        } catch (error) {
            console.error(`Erro ao obter cliente por ${column}:`, error);
            throw error;
        }
    }
}


export default new ClientService();