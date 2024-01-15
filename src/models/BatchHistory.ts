import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn,ManyToOne, OneToOne } from 'typeorm'
import Message from './Message';
import Batch from './Batch';


@Entity('batches_history')
export default class BatchHistory {
    @PrimaryGeneratedColumn('increment')
    id: number;


    @ManyToOne(() => Batch, batch => batch.batchHistory)
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;

    @OneToOne(() => Message, message => message.batchHistory)
    @JoinColumn({ name: 'message_id' })
    message: Message;
}