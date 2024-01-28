"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstanceMiddleware = void 0;
const data_source_1 = __importDefault(require("../data-source"));
const Instance_1 = __importDefault(require("../models/Instance"));
async function getInstanceMiddleware(request, response, next) {
    const { name } = request.params;
    const client = request.client;
    const instanceRepository = data_source_1.default.getRepository(Instance_1.default);
    const selectedInstance = await instanceRepository.findOne({
        where: {
            name: name,
            client: {
                id: client.id
            }
        },
        select: ['id', 'name', 'enabled'],
    });
    if (selectedInstance === null) {
        return response.status(403).json({ message: 'Instancia não existente' });
    }
    else if (selectedInstance.enabled === false) {
        return response.status(403).json({ message: 'Instancia desativada' });
    }
    else {
        // Adicione a instância à solicitação para que possa ser acessada pelos controladores
        request.instance = selectedInstance;
        next();
    }
}
exports.getInstanceMiddleware = getInstanceMiddleware;
// export async function verifyInstanceMiddleware(instance: Instance, callback: (instance: Instance) => Promise<DefaultResponse>): Promise<DefaultResponse> {
//     if(!!instance === true){
//     }
// }
