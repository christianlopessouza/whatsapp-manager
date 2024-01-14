
import { Client } from 'whatsapp-web.js';
import dataSource from '../data-source';
import Autosender from '../models/Autosender';
import { AutosendInstance, defaultConfigAutosend, TimeRange } from '../autosender-preset';
import { checkAutosendTimeMiddleware } from '../middlewares/autosendMiddleware';




// const checkAndExecute = async (instanceId: number, action: () => void): Promise<{ response: any, httpCode: number, errorCode?: string }> => {
//     const instance = autosenderIntances.get(instanceId);

//     if (instance !== undefined) {

//     }else{

//     }
// };



const autosenderIntances: Map<number, AutosendInstance> = new Map();

const AutoSender = {
    async create(instanceId: number): Promise<void> {
        const instance = autosenderIntances.get(instanceId);

        if (instance === undefined) {

            const autosenderRepository = dataSource.getRepository(Autosender);

            const autosenderClient = await autosenderRepository.findOne({
                where: {
                    instance: {
                        id: instanceId
                    }
                },
                select: ['id', 'shooting_min', 'shooting_max', 'timer_start', 'timer_end', 'days']
            });


            let dataParams: AutosendInstance;

            if (!!autosenderClient === false) {

                dataParams = defaultConfigAutosend;

                const newAutoSendProfile = autosenderRepository.create({
                    shooting_min: dataParams.shootingTimer.min,
                    shooting_max: dataParams.shootingTimer.max,
                    timer_start: dataParams.time.start,
                    timer_end: dataParams.time.end,
                    active: dataParams.active,
                    days: dataParams.days.join(','),
                    instance: {
                        id: instanceId
                    }
                });

                await autosenderRepository.save(newAutoSendProfile);

            } else {
                dataParams = {
                    time: {
                        start: autosenderClient.timer_start,
                        end: autosenderClient.timer_end
                    },
                    shootingTimer: {
                        min: autosenderClient.shooting_min,
                        max: autosenderClient.shooting_max
                    },
                    active: autosenderClient.active,
                    days: autosenderClient.days.split(',').map(Number)
                }
            }


            autosenderIntances.set(instanceId, dataParams);

        }
    },

    async disable(instanceId: number): Promise<void> {
        await AutoSender.create(instanceId);

        const instance = autosenderIntances.get(instanceId);
        instance!.active = false;

        const autosenderRepository = dataSource.getRepository(Autosender);
        await autosenderRepository.update({ id: instanceId }, { active: false });

    },


    async enable(instanceId: number): Promise<{ response: any, httpCode: number }> {
        await AutoSender.create(instanceId);

        const instance = autosenderIntances.get(instanceId);
        instance!.active = true;

        const autosenderRepository = dataSource.getRepository(Autosender);
        await autosenderRepository.update({ id: instanceId }, { active: true });

        return checkAutosendTimeMiddleware(instance!, () => {
            // logica de ennvio de msg

            // verifica se tem mensagem em lote abertos

            return { response: { message: 'Entrei' }, httpCode: 200 };
        });

    },

    turnOnMessages() {
        const selectedInstance = await instanceRepository.findOne({
            where: { 
                name: name,
                client: {
                    id: client.id
                }
            },
            select: ['id','name'],
        });
    }



}