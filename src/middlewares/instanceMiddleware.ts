import { Response, NextFunction } from 'express';
import { ExtendedRequest } from '../services/MainServices';

import dataSource from '../data-source';
import Instance from '../models/Instance';
import { DefaultResponse } from '../services/MainServices';



export async function getInstanceMiddleware(request: ExtendedRequest, response: Response, next: NextFunction) {
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
        select: ['id', 'name', 'enabled'],
    });

    if (selectedInstance === null) {
        return response.status(403).json({ message: 'Instancia não existente' });
    } else if (selectedInstance.enabled === false) {
        return response.status(403).json({ message: 'Instancia desativada' });
    } else {
        // Adicione a instância à solicitação para que possa ser acessada pelos controladores
        request.instance = selectedInstance;
        next();
    }

}

// export async function verifyInstanceMiddleware(instance: Instance, callback: (instance: Instance) => Promise<DefaultResponse>): Promise<DefaultResponse> {
//     if(!!instance === true){

//     }
// }
