import express from 'express';
import routes from './routes';
import dotenv from 'dotenv';
import cron from 'node-cron';
import AutoSenderService from './services/AutoSenderService';
import InstanceService from './services/InstanceService';
import dataSource from './data-source';

dotenv.config();

(async () => {
    await dataSource.initialize();
    
    cron.schedule('* * * * *', () => { AutoSenderService.timerVerifier() })
    InstanceService.autoloader();

    const app = express();

    app.use(express.json());
    app.use(routes);

    app.listen(3324)
    console.log("SERVER RODANDO NA PORTA 3324");
})();

