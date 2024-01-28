"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMessages1705165948527 = void 0;
const typeorm_1 = require("typeorm");
class CreateMessages1705165948527 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'messages',
            columns: [
                {
                    name: 'id',
                    type: 'integer',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'message',
                    type: 'varchar'
                },
                {
                    name: 'number',
                    type: 'varchar'
                },
                {
                    name: 'instance_id',
                    type: 'integer'
                },
                {
                    name: 'insert_timestamp',
                    type: 'timestamp'
                }
            ],
            foreignKeys: [
                {
                    name: 'MessageInstance',
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
        await queryRunner.dropTable('messages');
    }
}
exports.CreateMessages1705165948527 = CreateMessages1705165948527;
