"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddColumnInstance1705785442298 = void 0;
const typeorm_1 = require("typeorm");
class AddColumnInstance1705785442298 {
    async up(queryRunner) {
        await queryRunner.addColumn('autosender', new typeorm_1.TableColumn({
            name: 'enabled',
            type: 'integer',
            default: 1,
            isNullable: false,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('autosender', 'enabled');
    }
}
exports.AddColumnInstance1705785442298 = AddColumnInstance1705785442298;
