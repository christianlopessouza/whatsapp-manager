import express, { Request, Response, NextFunction } from 'express';
import routes from './routes';
import cron from 'node-cron';
import AutoSenderService from './services/AutoSenderService';
import InstanceService from './services/InstanceService';
import dataSource from './data-source';
import { PORT, GATEWAY } from './config';


(async () => {
    await dataSource.initialize();

    cron.schedule('* * * * *', () => { AutoSenderService.timerVerifier() })
    InstanceService.autoloader();

    const app = express();

    app.use(express.json());

    app.use((err: { status: number }, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
            return res.status(400).json({ error: 'Erro de sintaxe.' });
        }
        next();
    });

    app.use(routes);

    app.listen(PORT, GATEWAY);
    console.log(`SERVER RODANDO NA PORTA ${PORT}`);
})();

