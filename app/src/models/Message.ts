import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import Instance from './Instance';
import BatchHistory from './BatchHistory';

@Entity('messages')
export default class Message {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    message: string;

    @Column()
    number: string;

    @Column()
    sent: boolean;

    @Column()
    message_batch_id: number;

    @Column({ type: 'datetime' })
    insert_timestamp: Date;

    @ManyToOne(() => Instance, instance => instance.messages)
    @JoinColumn({ name: 'instance_id' })
    instance: Instance;


    // vinculo com tabela de historico 
    @OneToMany(() => BatchHistory, batchHistory => batchHistory.message, {
        cascade: ['insert', 'update'],
    })
    @JoinColumn({
        name: 'message_id',
    })
    batchHistory: BatchHistory;


}