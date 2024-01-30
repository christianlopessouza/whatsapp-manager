import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnClient1706628863267 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('clients', new TableColumn({
            name: 'hook_url',
            type: 'string',
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('clients', 'hook_url');
    }

}
