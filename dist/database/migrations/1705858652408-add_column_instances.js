"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddColumnInstances1705858652408 = void 0;
const typeorm_1 = require("typeorm");
class AddColumnInstances1705858652408 {
    async up(queryRunner) {
        await queryRunner.addColumn('instances', new typeorm_1.TableColumn({
            name: 'enabled',
            type: 'boolean',
            default: true,
            isNullable: false,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('instances', 'enabled');
    }
}
exports.AddColumnInstances1705858652408 = AddColumnInstances1705858652408;
