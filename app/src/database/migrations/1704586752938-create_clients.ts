import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateClients1704586752938 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name:'clients',
            columns:[
                {
                    name:'id',
                    type:'integer',
                    unsigned:true,
                    isPrimary:true,
                    isGenerated:true,
                    generationStrategy:'increment',

                },
                {
                    name:'name',
                    type:'varchar',
                },
                {
                    name:'token',
                    type:'varchar'
                },
                {
                    name:'insert_timestamp',
                    type:'timestamp',
                },
                {
                    name:'active',
                    type:'boolean'
                }
            ]
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('clients');
    }

}
