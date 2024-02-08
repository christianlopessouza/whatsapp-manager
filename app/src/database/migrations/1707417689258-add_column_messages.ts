import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnMessages1707417689258 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('messages', new TableColumn({
            name: 'message_batch_id',
            type: 'integer',
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('messages', 'message_batch_id');
    }

}
