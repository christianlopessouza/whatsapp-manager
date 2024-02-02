"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddColumnBatches1705853173911 = void 0;
const typeorm_1 = require("typeorm");
class AddColumnBatches1705853173911 {
    async up(queryRunner) {
        await queryRunner.addColumn('batches', new typeorm_1.TableColumn({
            name: 'deleted',
            type: 'integer',
            default: 0,
            isNullable: false,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('batches', 'deleted');
    }
}
exports.AddColumnBatches1705853173911 = AddColumnBatches1705853173911;
