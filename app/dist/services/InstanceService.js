"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AutoSenderService_1 = __importDefault(require("./AutoSenderService"));
const data_source_1 = __importDefault(require("../data-source"));
const Instance_1 = __importDefault(require("../models/Instance"));
const WhatsAppManager_1 = __importDefault(require("../services/WhatsAppManager"));
const MainServices_1 = require("../services/MainServices");
const MainServices_2 = require("../services/MainServices");
const InstanceService = {
    initTrigger(instanceId) {
        AutoSenderService_1.default.turnOnSend(instanceId); // caso tenha o envio de mensagem automativo é iniciado
    },
    async create(name, clientId) {
        const instanceRepository = data_source_1.default.getRepository(Instance_1.default);
        const selectedClient = await instanceRepository.findOne({
            where: {
                client: {
                    id: clientId,
                },
                name: name,
            },
            select: ['id'],
        });
        if (!!selectedClient === false) {
            const newInstance = instanceRepository.create({
                name: name,
                client: { id: clientId },
                insert_timestamp: (0, MainServices_2.localDate)().toString(),
                enabled: true,
            });
            await instanceRepository.save(newInstance);
            return newInstance;
        }
        else {
            return false;
        }
    },
    async autoloader() {
        const instanceRepository = data_source_1.default.getRepository(Instance_1.default);
        const selectedInstance = await instanceRepository.find({
            where: {
                enabled: true,
            },
            select: ['id'],
        });
        for (const instance of selectedInstance) {
            await WhatsAppManager_1.default.inicialize(instance.id);
            await (0, MainServices_1.delay)(10);
        }
    }
};
exports.default = InstanceService;
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
