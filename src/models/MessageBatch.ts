import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import Batch from './Batch';


@Entity('messages_batch')
export default class MessageBatch {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    message: string;

    @Column()
    number: string;


    @ManyToOne(() => Batch, batch => batch.messagesBatch)
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;

}