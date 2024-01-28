"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInstances1704593480445 = void 0;
const typeorm_1 = require("typeorm");
class CreateInstances1704593480445 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'instances',
            columns: [
                {
                    name: 'id',
                    type: 'integer',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'name',
                    type: 'varchar'
                },
                {
                    name: 'client_id',
                    type: 'integer'
                },
                {
                    name: 'insert_timestamp',
                    type: 'timestamp',
                }
            ],
            foreignKeys: [
                {
                    name: 'InstanceClient',
                    columnNames: ['client_id'],
                    referencedTableName: 'clients',
                    referencedColumnNames: ['id'],
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE' //Cascade = se o cliente for deletado, as instancias tbm serao deletadas.  Cascade = se o cliente for atualizado, as instancias tbm serao atualizadas.  Restrict = nao
                }
            ]
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('instances');
    }
}
exports.CreateInstances1704593480445 = CreateInstances1704593480445;
