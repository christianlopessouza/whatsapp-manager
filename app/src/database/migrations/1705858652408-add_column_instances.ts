import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnInstances1705858652408 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('instances', new TableColumn({
            name: 'enabled',
            type: 'integer',
            default: 1,
            isNullable: false,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('instances', 'enabled');

    }

}
