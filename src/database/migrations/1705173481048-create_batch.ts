import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBatch1705173481048 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
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
                    type: 'boolean'
                }
            ],
            foreignKeys: [
                {
                    name: 'BatchInstance',
                    columnNames: ['instance_id'],
                    referencedTableName: 'instance',
                    referencedColumnNames: ['id'],
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'  //Cascade = se o cliente for deletado, as instancias tbm serao deletadas.  Cascade = se o cliente for atualizado, as instancias tbm serao atualizadas.  Restrict = nao
                }
            ]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('batch');

    }

}
