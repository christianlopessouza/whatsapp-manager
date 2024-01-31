"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const node_cron_1 = __importDefault(require("node-cron"));
const AutoSenderService_1 = __importDefault(require("./services/AutoSenderService"));
const InstanceService_1 = __importDefault(require("./services/InstanceService"));
const data_source_1 = __importDefault(require("./data-source"));
const config_1 = require("./config");
(async () => {
    await data_source_1.default.initialize();
    node_cron_1.default.schedule('* * * * *', () => { AutoSenderService_1.default.timerVerifier(); });
    InstanceService_1.default.autoloader();
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
            return res.status(400).json({ error: 'Erro de sintaxe.' });
        }
        next();
    });
    app.use(routes_1.default);
    app.listen(config_1.PORT, config_1.GATEWAY);
    console.log(`SERVER RODANDO NA PORTA ${config_1.PORT}`);
})();
