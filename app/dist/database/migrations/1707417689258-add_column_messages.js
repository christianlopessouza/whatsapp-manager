"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddColumnMessages1707417689258 = void 0;
const typeorm_1 = require("typeorm");
class AddColumnMessages1707417689258 {
    async up(queryRunner) {
        await queryRunner.addColumn('messages', new typeorm_1.TableColumn({
            name: 'message_batch_id',
            type: 'integer',
            isNullable: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('messages', 'message_batch_id');
    }
}
exports.AddColumnMessages1707417689258 = AddColumnMessages1707417689258;
