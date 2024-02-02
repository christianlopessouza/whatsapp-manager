"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBatch1705173481048 = void 0;
const typeorm_1 = require("typeorm");
class CreateBatch1705173481048 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'batches',
            columns: [
                {
                    name: 'id',
                    type: 'integer',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'time',
                    type: 'timestamp'
                },
                {
                    name: 'instance_id',
                    type: 'integer'
                },
                {
                    name: 'sent',
                    type: 'integer'
                }
            ],
            foreignKeys: [
                {
                    name: 'BatchInstance',
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
        await queryRunner.dropTable('batches');
    }
}
exports.CreateBatch1705173481048 = CreateBatch1705173481048;
