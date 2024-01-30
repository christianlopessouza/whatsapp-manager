"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClients1704586752938 = void 0;
const typeorm_1 = require("typeorm");
class CreateClients1704586752938 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'clients',
            columns: [
                {
                    name: 'id',
                    type: 'integer',
                    unsigned: true,
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'name',
                    type: 'varchar',
                },
                {
                    name: 'token',
                    type: 'varchar'
                },
                {
                    name: 'insert_timestamp',
                    type: 'timestamp',
                },
                {
                    name: 'active',
                    type: 'boolean'
                }
            ]
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('clients');
    }
}
exports.CreateClients1704586752938 = CreateClients1704586752938;
