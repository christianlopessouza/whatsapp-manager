import { Request, Response } from 'express';
import dataSource from '../data-source';
import Instance from '../models/Instance';



export default {
    async create(request: Request, response: Response) {
        try {


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
                select: ['id', 'name'], // Especifique os campos que você deseja obter
            });

            console.log(selectedInstance);

            if (!!selectedInstance === false) {
                const newInstance = instanceRepository.create({
                    name: name,
                    client: { id: client.id },
                });

                await instanceRepository.save(newInstance);
                return response.status(201).json(newInstance);

            } else {
                return response.status(403).json({ message: 'Instancia já existente para este cliente' });
            }

        } catch (error) {
            return response.status(500).json({ message: 'Erro interno do servidor' });

        }

    },

    async start(request: Request, response: Response) {

    }
}