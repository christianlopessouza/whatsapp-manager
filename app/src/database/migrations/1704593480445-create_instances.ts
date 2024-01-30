import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateInstances1704593480445 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
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
                   name: 'client_id' ,
                   type: 'integer'
                },
                {
                    name:'insert_timestamp',
                    type:'timestamp',
                }
            ],
            foreignKeys: [
                {
                    name: 'InstanceClient',
                    columnNames:['client_id'],
                    referencedTableName: 'clients',
                    referencedColumnNames: ['id'],
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'  //Cascade = se o cliente for deletado, as instancias tbm serao deletadas.  Cascade = se o cliente for atualizado, as instancias tbm serao atualizadas.  Restrict = nao
                }
            ]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('instances');
    }

}
