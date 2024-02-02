import { MigrationInterface, QueryRunner,TableColumn } from "typeorm";

export class AddColumnMessages1705171315311 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('messages', new TableColumn({
            name: 'sent',
            type: 'integer',
            default: false,
            isNullable: false,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('messages', 'sent');
    }

}
