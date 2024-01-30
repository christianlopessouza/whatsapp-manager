import { Request, Response, NextFunction } from 'express';
import Client from '../models/Client';
import ClientService from '../services/ClientService';
import dataSource from '../data-source';
import { ExtendedRequest } from '../services/MainServices';


export const authenticateToken = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');

    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    const key = token.replace('Bearer ', '');

    try {
        const client = await checkKeyExists(key);

        if (!!client === false) {
            return res.status(403).json({ message: 'Chave inválida' });
        }


        // Retorna as informações do usuário encontradas no banco de dados
        req.client = client;

        next();


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

const checkKeyExists = async (key: string): Promise<Client | undefined | null> => {
    const clientRepository = dataSource.getRepository(Client);

    try {
        const client = await clientRepository.findOne({ where: { token: key } });

        return client;
    } catch (error) {
        return undefined;
    }
};




