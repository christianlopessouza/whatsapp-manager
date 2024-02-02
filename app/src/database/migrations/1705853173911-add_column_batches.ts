import { MigrationInterface, QueryRunner,TableColumn } from "typeorm";

export class AddColumnBatches1705853173911 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('batches', new TableColumn({
            name: 'deleted',
            type: 'integer',
            default: 0,
            isNullable: false,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('batches', 'deleted');

    }

}
