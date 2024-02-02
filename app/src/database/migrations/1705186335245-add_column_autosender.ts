import { MigrationInterface, QueryRunner,TableColumn } from "typeorm";

export class AddColumnAutosender1705186335245 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('autosender', new TableColumn({
            name: 'active',
            type: 'integer',
            default: 1,
            isNullable: false,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('autosender', 'active');

    }

}
