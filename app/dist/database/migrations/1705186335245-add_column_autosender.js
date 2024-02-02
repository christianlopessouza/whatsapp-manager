"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddColumnAutosender1705186335245 = void 0;
const typeorm_1 = require("typeorm");
class AddColumnAutosender1705186335245 {
    async up(queryRunner) {
        await queryRunner.addColumn('autosender', new typeorm_1.TableColumn({
            name: 'active',
            type: 'integer',
            default: 1,
            isNullable: false,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('autosender', 'active');
    }
}
exports.AddColumnAutosender1705186335245 = AddColumnAutosender1705186335245;
