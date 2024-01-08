import { Request, Response, NextFunction } from 'express';
import Client from '../models/Client';
import ClientService from '../services/ClientService';
import dataSource from '../data-source';


export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');

    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    const key = token.replace('Bearer ', '');

    try {
        const keyExists = await checkKeyExists(key);

        if (!keyExists) {
            return res.status(403).json({ message: 'Chave inválida' });
        }

        // Exemplo: Gera um token JWT contendo informações do usuário
        const client = await ClientService.findByColumn('token', key);

        // Retorna as informações do usuário encontradas no banco de dados
        (req as any).client = {
            id: client.id,
            name: client.name,
          };

        next();


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

const checkKeyExists = async (key: string): Promise<boolean> => {
    console.log(Client);
    const clientRepository = dataSource.getRepository(Client);

    try {
        const client = await clientRepository.findOne({ where: { token: key } });

        return !!client;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao verificar a chave');
    }
};




