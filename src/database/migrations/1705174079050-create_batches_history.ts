import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBatchesHistory1705174079050 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
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
                    name: 'id_message',
                    type: 'integer'
                },
                {
                    name: 'id_batch',
                    type: 'integer'
                }
            ],
            foreignKeys: [
                {
                    name: 'BatchMessageHistory',
                    columnNames: ['id_batch'],
                    referencedTableName: 'batch',
                    referencedColumnNames: ['id'],
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'  //Cascade = se o cliente for deletado, as instancias tbm serao deletadas.  Cascade = se o cliente for atualizado, as instancias tbm serao atualizadas.  Restrict = nao
                }
            ]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('batches_history');

    }

}
