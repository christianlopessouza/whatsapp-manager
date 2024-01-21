import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnInstance1705785442298 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('autosender', new TableColumn({
            name: 'enabled',
            type: 'boolean',
            default: true,
            isNullable: false,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('autosender', 'enabled');

    }

}
