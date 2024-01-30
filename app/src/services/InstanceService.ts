import AutoSenderService from './AutoSenderService'
import dataSource from '../data-source';
import Client from '../models/Client';
import Instance from '../models/Instance';
import WhatsAppManager from '../services/WhatsAppManager';


const InstanceService = {

  initTrigger(instanceId: number) {
    AutoSenderService.turnOnSend(instanceId); // caso tenha o envio de mensagem automativo é iniciado
  },

  async create(name: string, clientId: number): Promise<Instance | false> {
    const clientRepository = dataSource.getRepository(Client);

    const selectedClient = await clientRepository.findOne({
      where: {
        id: clientId,
        name: name,
      },
      select: ['id'],
    });

    if (!!selectedClient === false) {
      const instanceRepository = dataSource.getRepository(Instance);

      const newInstance = instanceRepository.create({
        name: name,
        client: { id: clientId },
        insert_timestamp: new Date(),
        enabled: true,
      });

      await instanceRepository.save(newInstance);

      return newInstance;
    } else {
      return false;
    }
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

// CREATE TRIGGER after_delete_messages_batch
// AFTER DELETE ON messages_batch
// FOR EACH ROW
// BEGIN
//     -- Atualiza a coluna 'sent' em 'lotes' se não houver mais mensagens para o lote
//     UPDATE batches
//     SET sent = true
//     WHERE id = OLD.batch_id
//         AND NOT EXISTS (
//             SELECT 1
//             FROM messages_batch
//             WHERE batch_id = OLD.batch_id
//         );
// END;