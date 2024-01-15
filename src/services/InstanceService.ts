import AutoSenderService from './AutoSenderService'

const InstanceService = {

  initTrigger(instanceId: number) {

    AutoSenderService.start(instanceId); // caso tenha o envio de mensagem automativo é iniciado
  }


}

export default InstanceService;