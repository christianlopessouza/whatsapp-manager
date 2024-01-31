"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddColumnClient1706628863267 = void 0;
const typeorm_1 = require("typeorm");
class AddColumnClient1706628863267 {
    async up(queryRunner) {
        await queryRunner.addColumn('clients', new typeorm_1.TableColumn({
            name: 'hook_url',
            type: 'string',
            isNullable: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('clients', 'hook_url');
    }
}
exports.AddColumnClient1706628863267 = AddColumnClient1706628863267;
