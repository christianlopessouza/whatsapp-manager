"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddColumnMessages1705171315311 = void 0;
const typeorm_1 = require("typeorm");
class AddColumnMessages1705171315311 {
    async up(queryRunner) {
        await queryRunner.addColumn('messages', new typeorm_1.TableColumn({
            name: 'sent',
            type: 'boolean',
            default: false,
            isNullable: false,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('messages', 'sent');
    }
}
exports.AddColumnMessages1705171315311 = AddColumnMessages1705171315311;
