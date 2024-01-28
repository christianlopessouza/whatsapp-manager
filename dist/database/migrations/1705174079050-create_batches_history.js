"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBatchesHistory1705174079050 = void 0;
const typeorm_1 = require("typeorm");
class CreateBatchesHistory1705174079050 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'batches_history',
            columns: [
                {
                    name: 'id',
                    type: 'integer',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'message_id',
                    type: 'integer'
                },
                {
                    name: 'batch_id',
                    type: 'integer'
                }
            ],
            foreignKeys: [
                {
                    name: 'BatchMessageHistory',
                    columnNames: ['batch_id'],
                    referencedTableName: 'batches',
                    referencedColumnNames: ['id'],
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE' //Cascade = se o cliente for deletado, as instancias tbm serao deletadas.  Cascade = se o cliente for atualizado, as instancias tbm serao atualizadas.  Restrict = nao
                }
            ]
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('batches_history');
    }
}
exports.CreateBatchesHistory1705174079050 = CreateBatchesHistory1705174079050;
