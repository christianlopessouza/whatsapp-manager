import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateMessages1705165948527 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
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
                   name: 'instance_id' ,
                   type: 'integer'
                },
                {
                   name: 'insert_timestamp' ,
                   type: 'timestamp'
                }
            ],
            foreignKeys: [
                {
                    name: 'MessageInstance',
                    columnNames:['instance_id'],
                    referencedTableName: 'instances',
                    referencedColumnNames: ['id'],
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'  //Cascade = se o cliente for deletado, as instancias tbm serao deletadas.  Cascade = se o cliente for atualizado, as instancias tbm serao atualizadas.  Restrict = nao
                }
            ]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('messages');

    }

}
