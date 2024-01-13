import { Request, Response, NextFunction } from 'express';
import dataSource from '../data-source';
import Instance from '../models/Instance';

export async function getInstanceMiddleware(request: Request, response: Response, next: NextFunction) {
    const { name } = request.params;
    const client = (request as any).client;

    const instanceRepository = dataSource.getRepository(Instance);

    const selectedInstance = await instanceRepository.findOne({
        where: { 
            name: name,
            client: {
                id: client.id
            }
        },
        select: ['id','name'],
    });

    // Adicione a instância à solicitação para que possa ser acessada pelos controladores
    (request as any).instance = selectedInstance;
    
    next();
}
