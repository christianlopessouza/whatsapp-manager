"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAutosender1705177092787 = void 0;
const typeorm_1 = require("typeorm");
class CreateAutosender1705177092787 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'autosender',
            columns: [
                {
                    name: 'id',
                    type: 'integer',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'shooting_min',
                    type: 'integer'
                },
                {
                    name: 'shooting_max',
                    type: 'integer'
                },
                {
                    name: 'timer_start',
                    type: 'string'
                },
                {
                    name: 'timer_end',
                    type: 'string'
                },
                {
                    name: 'days',
                    type: 'string'
                },
                {
                    name: 'instance_id',
                    type: 'integer'
                }
            ],
            foreignKeys: [
                {
                    name: 'InstanceAutosender',
                    columnNames: ['instance_id'],
                    referencedTableName: 'instances',
                    referencedColumnNames: ['id'],
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE' //Cascade = se o cliente for deletado, as instancias tbm serao deletadas.  Cascade = se o cliente for atualizado, as instancias tbm serao atualizadas.  Restrict = nao
                }
            ]
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('autosender');
    }
}
exports.CreateAutosender1705177092787 = CreateAutosender1705177092787;
