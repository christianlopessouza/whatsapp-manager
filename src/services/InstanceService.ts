// instance.ts
import { PuppeteerManager } from './puppeteerManager';

export class Instance {
  private puppeteerManager: PuppeteerManager;

  constructor() {
    this.puppeteerManager = new PuppeteerManager();
  }

  async initialize() {
    await this.puppeteerManager.initialize();
  }

  async performAction() {
    // Lógica específica da instância usando Puppeteer
    await this.puppeteerManager.sendEmail('exemplo@email.com', 'Assunto', 'Corpo do email');
  }

  // Outros métodos da instância
}
