import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm'
import BatchHistory from './BatchHistory';
import Instance from './Instance';
import MessageBatch from './MessageBatch';

@Entity('batches')
export default class Batch {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    sent: boolean;


    @ManyToOne(() => Instance, instance => instance.batches)
    @JoinColumn({ name: 'instance_id' })
    instance: Instance;

    // vinculo com tabela de historico 
    @OneToMany(() => BatchHistory, batchHistory => batchHistory.batch, {
        cascade: ['insert', 'update'],
    })
    @JoinColumn({
        name: 'batch_id',
    })
    batchHistory: BatchHistory[];

    // vinculo com tabela de historico 
    @OneToMany(() => MessageBatch, messageBatch => messageBatch.batch, {
        cascade: ['insert', 'update'],
    })
    @JoinColumn({
        name: 'batch_id',
    })
    messagesBatch: MessageBatch[];

}