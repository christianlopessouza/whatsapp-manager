import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAutosender1705177092787 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
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
                    referencedTableName: 'instance',
                    referencedColumnNames: ['id'],
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'  //Cascade = se o cliente for deletado, as instancias tbm serao deletadas.  Cascade = se o cliente for atualizado, as instancias tbm serao atualizadas.  Restrict = nao
                }
            ]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('autosender');

    }

}
