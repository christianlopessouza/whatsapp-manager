"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMessagesBatch1705172926718 = void 0;
const typeorm_1 = require("typeorm");
class CreateMessagesBatch1705172926718 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'messages_batch',
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
                    name: 'batch_id',
                    type: 'integer'
                }
            ],
            foreignKeys: [
                {
                    name: 'BatchMessage',
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
        await queryRunner.dropTable('messages_batch');
    }
}
exports.CreateMessagesBatch1705172926718 = CreateMessagesBatch1705172926718;
