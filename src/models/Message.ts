import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import Instance from './Instance';

@Entity('messages')
export default class Message {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    message: string;

    @Column()
    number: string;

    @Column({ type: 'datetime' })
    insert_timestamp: Date;

    @ManyToOne(() => Instance, instance => instance.message)
    @JoinColumn({ name: 'instance_id' })
    instance: Instance;


}