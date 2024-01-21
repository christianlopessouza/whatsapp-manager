import AutoSenderService from './AutoSenderService'
import dataSource from '../data-source';
import Client from '../models/Client';
import Instance from '../models/Instance';
import WhatsAppManager from '../services/WhatsAppManager';
import { MessageBatchArray } from './MainServices';


const InstanceService = {

  initTrigger(instanceId: number) {
    AutoSenderService.start(instanceId); // caso tenha o envio de mensagem automativo é iniciado
  },

  async create(name: string, clientId: number): Promise<Instance | false> {
    const clientRepository = dataSource.getRepository(Client);

    const selectedClient = await clientRepository.findOne({
      where: {
        id: clientId
      },
      select: ['id'],
    });

    if (!!selectedClient === false) {
      const instanceRepository = dataSource.getRepository(Instance);

      const newInstance = instanceRepository.create({
        name: name,
        client: { id: clientId },
        insert_timestamp: new Date()
      });

      await instanceRepository.save(newInstance);

      return newInstance;
    } else {
      return false;
    }
  },


  async addBatch(instanceId: number, messages: MessageBatchArray[]) {

  },


  async autoloader(): Promise<void> {
    const instanceRepository = dataSource.getRepository(Instance);

    const selectedInstance = await instanceRepository.find({
      where: {
        enabled: true,
      },
      select: ['id'],
    });

    for (const instance of selectedInstance) {
      WhatsAppManager.inicialize(instance.id);
    }


  }


}

export default InstanceService;